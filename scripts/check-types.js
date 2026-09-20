#!/usr/bin/env node

/**
 * Custom script to enforce type export conventions
 * Ensures that all exported types and interfaces are in lib/types/
 * Non-exported types can stay in component files
 */

import fs from 'node:fs';
import path from 'node:path';

const ALLOWED_DIRS = ['lib/types/'];
const SCAN_DIRS = ['app', 'components', 'lib'];

// Types that are allowed to be exported from specific files (tightly coupled with values)
const WHITELISTED_TYPES = {};

// Colors for console output
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

/**
 * List files under a directory, as repo-root-relative POSIX paths
 */
function listFiles(dir, extensions) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs.readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile() && extensions.some(ext => entry.name.endsWith(ext)))
    .map(entry => path.relative(process.cwd(), path.join(entry.parentPath, entry.name)).replace(/\\/g, '/'));
}

/**
 * Find all files that import a specific type
 */
function findTypeUsage(typeName, allFiles) {
  const importingFiles = [];

  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf-8');

    // Check for various import patterns
    const patterns = [
      // import { TypeName } from '...'
      new RegExp(`import\\s*{[^}]*\\b${typeName}\\b[^}]*}\\s*from`, 'g'),
      // import type { TypeName } from '...'
      new RegExp(`import\\s+type\\s*{[^}]*\\b${typeName}\\b[^}]*}\\s*from`, 'g'),
      // import { type TypeName } from '...'
      new RegExp(`import\\s*{[^}]*\\btype\\s+${typeName}\\b[^}]*}\\s*from`, 'g'),
    ];

    for (const pattern of patterns) {
      if (pattern.test(content)) {
        const relativePath = path.relative(process.cwd(), file);
        importingFiles.push(relativePath);
        break;
      }
    }
  }

  return importingFiles;
}

/**
 * Extract the full declaration of a type/interface (handles multiline)
 */
function extractDeclaration(lines, startIndex) {
  let declaration = lines[startIndex].trim();
  let braceCount = 0;
  let inDeclaration = false;

  // Count braces in the first line
  for (const char of declaration) {
    if (char === '{') {
      braceCount++;
      inDeclaration = true;
    }
    if (char === '}') braceCount--;
  }

  // If it's a simple type alias or interface declaration ends on same line
  if (!inDeclaration || braceCount === 0) {
    // Check if it ends with semicolon or is a simple type
    if (declaration.endsWith(';') || !declaration.includes('{')) {
      return declaration;
    }
  }

  // Handle multiline declarations
  let i = startIndex + 1;
  while (i < lines.length && braceCount > 0) {
    const line = lines[i].trim();
    declaration += ' ' + line;

    for (const char of line) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
    }

    if (braceCount === 0) break;
    i++;
  }

  // Truncate if too long (keep first 100 chars)
  if (declaration.length > 100) {
    return declaration.substring(0, 100) + '...';
  }

  return declaration;
}

/**
 * Check a file for exported type/interface violations
 */
function checkFile(filePath, allFiles) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const violations = [];

  // Skip if file is in allowed directories or is a .d.ts file
  const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
  const isInAllowedDir = ALLOWED_DIRS.some(dir => relativePath.includes(dir));
  if (isInAllowedDir || filePath.endsWith('.d.ts')) {
    return violations;
  }

  // Get whitelisted types for this file
  const whitelistedForFile = WHITELISTED_TYPES[relativePath] || [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Skip re-export statements (export type { X } from "...")
    if (trimmed.includes('from')) {
      return;
    }

    // Check for exported interfaces
    const interfaceMatch = trimmed.match(/^export\s+interface\s+(\w+)/);
    if (interfaceMatch) {
      const typeName = interfaceMatch[1];
      // Skip whitelisted types
      if (whitelistedForFile.includes(typeName)) {
        return;
      }
      const declaration = extractDeclaration(lines, index);
      const usedIn = findTypeUsage(typeName, allFiles);

      violations.push({
        file: relativePath,
        line: index + 1,
        name: typeName,
        kind: 'interface',
        code: declaration,
        usedIn
      });
    }

    // Check for exported type aliases
    const typeMatch = trimmed.match(/^export\s+type\s+(\w+)/);
    if (typeMatch) {
      const typeName = typeMatch[1];
      // Skip whitelisted types
      if (whitelistedForFile.includes(typeName)) {
        return;
      }
      const declaration = extractDeclaration(lines, index);
      const usedIn = findTypeUsage(typeName, allFiles);

      violations.push({
        file: relativePath,
        line: index + 1,
        name: typeName,
        kind: 'type',
        code: declaration,
        usedIn
      });
    }

    // Check for type re-exports: export type { Foo } (but skip if it has 'from')
    const typeReExportMatch = trimmed.match(/^export\s+type\s*{\s*([^}]+)\s*}/);
    if (typeReExportMatch && !trimmed.includes('from')) {
      const types = typeReExportMatch[1].split(',').map(t => t.trim());

      for (const type of types) {
        const typeName = type.split(/\s+as\s+/)[0].trim();
        const usedIn = findTypeUsage(typeName, allFiles);

        violations.push({
          file: relativePath,
          line: index + 1,
          name: typeName,
          kind: 'type',
          code: trimmed,
          usedIn
        });
      }
    }
  });

  return violations;
}

/**
 * Get list of existing type files for reference
 */
function getExistingTypeFiles() {
  const allTypeFiles = [];

  for (const dir of ALLOWED_DIRS) {
    const files = listFiles(dir, ['.ts']).filter(file => !file.endsWith('.d.ts'));
    allTypeFiles.push(...files);
  }

  return allTypeFiles.map(file => '@/' + file).sort();
}

function main() {
  console.log(`${YELLOW}Checking type export conventions...${RESET}\n`);

  // Find all TypeScript files in the source directories
  const files = SCAN_DIRS.flatMap(dir => listFiles(dir, ['.ts', '.tsx']));

  let totalViolations = [];

  // First pass: collect all violations
  files.forEach(file => {
    const violations = checkFile(file, files);
    totalViolations = totalViolations.concat(violations);
  });

  if (totalViolations.length > 0) {
    console.log(`${RED}=== TYPE EXPORT VIOLATIONS ===${RESET}\n`);

    const localOnly = [];
    const shared = [];

    totalViolations.forEach((violation, index) => {
      if (violation.usedIn.length === 0) {
        localOnly.push(violation);
      } else {
        shared.push(violation);
      }

      console.log(`${RED}[${index + 1}]${RESET} ${violation.file}:${violation.line}`);
      console.log(`    Name: ${YELLOW}${violation.name}${RESET}`);
      console.log(`    Kind: ${violation.kind}`);
      console.log(`    Code: ${violation.code}`);
      console.log(`    Used in: ${violation.usedIn.length} file(s)`);

      if (violation.usedIn.length === 0) {
        console.log(`    ${GREEN}Fix: Remove 'export' keyword - type is not imported anywhere (local-only)${RESET}`);
      } else {
        console.log(`    ${BLUE}Fix: Move to appropriate file in @/lib/types/ or @/lib/database/ and update imports in ${violation.usedIn.length} file(s)${RESET}`);
        violation.usedIn.forEach(file => {
          console.log(`      - ${file}`);
        });
      }
      console.log();
    });

    // Show existing type files for reference
    const existingTypeFiles = getExistingTypeFiles();
    if (existingTypeFiles.length > 0) {
      console.log(`${YELLOW}=== EXISTING TYPE FILES (for reference) ===${RESET}`);
      existingTypeFiles.forEach(file => {
        console.log(file);
      });
      console.log();
    }

    // Summary
    console.log(`${YELLOW}=== SUMMARY ===${RESET}`);
    console.log(`Scanned: ${files.length} files | Violations: ${totalViolations.length} | Local-only: ${localOnly.length} | Shared: ${shared.length}`);
    console.log();

    // Machine-readable output
    console.log(`${YELLOW}=== MACHINE-READABLE ===${RESET}`);
    totalViolations.forEach(violation => {
      const fileList = violation.usedIn.join(',');
      console.log(`${violation.file}:${violation.line}:${violation.name}:${violation.kind}:${violation.usedIn.length}:[${fileList}]`);
    });

    process.exit(1);
  } else {
    console.log(`${GREEN}✓ No type export violations found (scanned ${files.length} files)${RESET}`);
    process.exit(0);
  }
}

main();
