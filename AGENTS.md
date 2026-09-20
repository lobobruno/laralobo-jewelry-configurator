<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Ateliê Lara Lobo — agent guide

Next.js 16.3.5 App Router + React 19.2 front-end for a virtual jewellery atelier:
pick a family, model, metal, stone, cut and carat, and see the piece rendered in 3D
with Three.js. No database, no auth, no API routes — state lives in memory and
resets on reload. `README.md` (Portuguese) describes the product and every file;
this file covers what an agent needs that the code does not already say.

## 3D continuity guide — read before changing jewelry

Read [docs/GUIA-3D.md](docs/GUIA-3D.md) before adding or changing gems, cuts,
ring models, halos, prongs, or the signature basket. It records the user's
approved design decisions, geometry contracts, extension workflows, reference
paths, and visual validation checklist so work can continue without chat history.
Keep it current when those decisions change. Verify scripts and file conventions
against the current source; older descriptions below may lag user edits.

The block above is genuine and current — `next dev` rewrites it on every start, and
it is committed, so the tree stays clean. Leave it in place. The Next 16 section
below is what it points at, already read and filtered down to this project.

## Working Principles

These principles apply to every task. They bias toward caution over speed — for
trivial changes, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that *your* changes made unused.
- Don't remove pre-existing dead code unless asked.

**Test:** Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
```

Strong success criteria enable independent looping. Weak criteria ("make it work")
require constant clarification.

### Conflict resolution

If any guideline, skill, or agent suggests a pattern that conflicts with existing
code, **prefer existing conventions**.

## Critical Rules

- Use `pnpm` only (never npm). The repo pins `pnpm@10.33.2`.
- Ask the user before installing packages.
- Run `pnpm typecheck` after changing code, and `pnpm build` before calling a task
  done. Do **not** put `pnpm lint` in that loop yet — see "Known traps".
- Use Tailwind utilities in components. Keep `app/globals.css` limited to Tailwind
  imports, theme tokens, and shared base defaults. Preserve the current design.
- Never edit `lib/three/vendor/` or the sibling `../atelie-mvp/` — see
  "Do not touch".

## Commands

```
pnpm dev        # next dev on 0.0.0.0:3000 (Turbopack, output in .next/dev)
pnpm build      # production build — the real gate, run it before claiming done
pnpm start      # serve the production build
pnpm typecheck  # tsc --noEmit
pnpm test       # node tests/migration.test.mjs
pnpm lint       # see "Known traps" — currently checks nothing and exits 1
```

`pnpm build` and `pnpm typecheck` are the checks that actually cover this codebase.

## Where Next 16 will trip you up

Nothing here is about migrating — this project started on 16. These are the four
places where writing Next.js from memory produces code that is wrong for this
version. Full docs in `node_modules/next/dist/docs/` (API reference under
`01-app/03-api-reference/`).

- **`params` and `searchParams` are Promises** and must be awaited.
  `app/pecas/[category]/page.jsx` already does this — keep new dynamic routes
  `async` and awaiting, and do not "simplify" it back to a plain object.
- **React Compiler is off.** It is stable in 16 but opt-in, and this project has
  not enabled it, so memoization is manual — `memo`/`useMemo`/`useCallback` still
  have to be written by hand where they matter.
- **`next/image` rejects local sources with a query string** unless the pattern is
  listed in `images.localPatterns.search`. `photoSource()` in `lib/collections.js`
  returns bare `/assets/gallery/NNN.jpg` paths; keep it that way, or add the config.
- **Next no longer forces `scroll-behavior: auto` during navigation.** A global
  `scroll-behavior: smooth` would now apply to route changes unless `<html>` carries
  `data-scroll-behavior="smooth"`. `app/globals.css` only sets it under
  `prefers-reduced-motion`, so nothing is wrong today — remember this if smooth
  scrolling is ever added.

Also true, rarely load-bearing: Turbopack runs both `dev` and `build` with no flag
(`next dev` writes to `.next/dev`, and a lockfile blocks a second dev server), and
the floor is Node 20.9+, TypeScript 5.1+, Chrome/Edge/Firefox 111+, Safari 16.4+.

## Conventions

- **TypeScript first.** Every new file is `.ts`/`.tsx` with typed props — components,
  routes, `lib/`, tests. Two directories stay JavaScript:

  - `lib/three/` — the vendored Three.js build and the modules that drive it.
  - `scripts/` — tooling run straight by Node, not through the bundler
    (`scripts/check-types.js`). No build step, so no TS.

  `tsconfig.json` is `strict` with `allowJs: true`, so the TS side can import
  `lib/three/` freely; `checkJs` is off, so neither directory is type-checked.

  **The existing code does not match this yet** — most of `app/`, all of
  `components/` and `lib/catalog.js`, `lib/collections.js`, `lib/icons.js` are still
  `.jsx`/`.js`. That is a known gap, not the convention. Write new work in TS, and
  convert a file when you are already substantially changing it — not as a drive-by
  (see Surgical Changes).

  Be clear about what `pnpm typecheck` covers today. `allowJs` pulls a `.js`/`.jsx`
  file into the program when something TypeScript imports it, so most of
  `components/` and `lib/` are in there — but `checkJs` is off, so tsc reports no
  errors inside them. Files nothing TS imports, currently `app/pecas/**`, are not in
  the program at all. Converting a file to `.tsx` is what actually puts it under the
  checker, so expect a green `pnpm typecheck` to start failing as you migrate; that
  is the point.
- **House style is dense.** 4-space indent, single quotes, semicolons, JSX returned
  inline from a single expression, small modules with no blank-line padding. See
  `components/atelier/ConfigurationProvider.jsx` and `lib/catalog.js` for the shape
  — copy the density, not the missing types. Do not reformat files you are not
  otherwise changing.
- **Imports** use the `@/*` alias (mapped to the repo root in `tsconfig.json`) for
  cross-directory imports, relative paths within a directory.
- **Three.js is browser-only** and loaded on demand from `lib/three/viewer.js`.
  Never import it at module scope in a server component. Dispose geometries and
  materials you create; `tests/migration.test.mjs` asserts that contract.
- **Tailwind CSS v4** provides component styling through utility classes.
  Keep full utility names in source so Tailwind can discover them.
- Copy in Portuguese (`lang="pt-BR"`), code and comments in English.

### Server and Client Components

**Default to a Server Component** unless the component needs one of:

- Event handlers (`onClick`, `onChange`…)
- Hooks (`useState`, `useEffect`…)
- Browser APIs (`window`, `localStorage`, WebGL…)
- Real-time interaction

Today that means `'use client'` sits on exactly four files — the atelier provider,
`Controls`, `Viewer` and `PhotoGallery`. `app/layout.tsx` and the page shells stay
on the server. Push the boundary down rather than up:

```tsx
// Server component (default — no 'use client')
export default async function CollectionPage({ params }: { params: Promise<{ category: string }> }) {
    const { category } = await params;               // Promise in Next 16 — type it as one
    if (!Object.hasOwn(collections, category)) notFound();
    return <section className="portfolio">
        <h1>{collections[category].name}</h1>        {/* static, stays server */}
        <PhotoGallery collection={collections[category]}/>  {/* only this is client */}
    </section>;
}
```

Type the `params` prop as a `Promise`, not as the resolved object — getting this
wrong is the most common Next 16 type error.

Checklist before you commit a component:

- [ ] Server Component by default?
- [ ] Client boundary as small as it can be?
- [ ] Data read at the highest server component that needs it?
- [ ] Heavy imports (Three.js) code-split and browser-only?
- [ ] No re-render forced on a parent that didn't need it?

## Skills

Vendored under `.agents/skills/`, pinned by `skills-lock.json`. Read a SKILL.md
end-to-end before writing code in its domain. There is no `.claude/agents/`
directory in this repo — the built-in agent types are all that's available.

| Skill | When to use |
|---|---|
| `vercel-react-best-practices` | **The one applied here.** React components, hooks, state, client/server boundaries. Doubly relevant because React Compiler is off, so memoization is manual. |
| `web-design-guidelines` | UI and accessibility review — auditing markup, focus states, contrast, keyboard paths in the atelier and gallery. |
| `vercel-react-view-transitions` | Available but unused. Only if route or shared-element animation is actually requested. |
| `vercel-react-native-skills` | Not applicable — there is no mobile app. |

## Do not touch

- `lib/three/vendor/` — a pinned local copy of Three.js and its addons, with
  licences preserved, deliberately vendored instead of a CDN or an npm dependency.
  Excluded from ESLint. Do not upgrade, reformat or replace it with a package.
- `../atelie-mvp/` — the original MVP, a sibling directory outside this repo. It is
  the migration reference and must stay byte-for-byte unchanged;
  `migration-source-hashes.json` pins its hashes and the first test verifies them.
  That test needs `../atelie-mvp/dist/` to exist and fails without it.
- `.agents/skills/` — vendored, hash-pinned. Do not hand-edit.

## Known traps

These are real, present-tense problems — do not paper over them in a diff, and do
not trust the tools they break:

- `biome.json` and the `lint` script point at `./src`, which does not exist in this
  repo (code lives in `app/`, `components/` and `lib/`). `pnpm lint` checks zero
  files and exits 1, and since Next 16 dropped linting from `next build`, nothing
  else catches it. Fixing the globs is not a free change: the script runs
  `biome check --write --unsafe` and Biome is configured for tabs and double
  quotes, so the first successful run would rewrite every file against the house
  style above. Align the Biome formatter with the existing style before widening
  the globs. Its `nursery/useSortedClasses` rule can sort Tailwind utilities.
- `.husky/pre-commit` runs `pnpm lint` and `pnpm validate`. `lint` exits 1 and there
  is no `validate` script in `package.json`, so the hook blocks every commit as it
  stands.
- ESLint (`eslint.config.mjs`, via `eslint-config-next`) and Biome are both
  configured, and neither is wired into a passing command. Pick one deliberately
  rather than adding a third.

## Browser testing

When a change needs to be seen rather than asserted, prefer driving a real browser
(an agent browser / headless CLI) over guessing from the code — the 3D viewer in
particular cannot be verified any other way. Neither an agent browser nor a
Playwright setup is configured in this repo yet; say so rather than claiming a
visual check you did not run.

## Commit messages

- Provide the commit message at the end when a task is **fully completed**.
- If work remains, don't write one.
- Format: clear, concise description of what was done, prefixed with the matching
  emoji. The existing history follows this (`:tada: init`).

| Commit type | Emoji |
|---|---|
| Initial commit | :tada: |
| Version tag | :bookmark: |
| New feature | :sparkles: |
| Bugfix | :bug: |
| Metadata | :card_index: |
| Documentation | :books: |
| Documenting source code | :bulb: |
| Performance | :racehorse: |
| Cosmetic | :lipstick: |
| Tests | :rotating_light: |
| Adding a test | :white_check_mark: |
| Make a test pass | :heavy_check_mark: |
| General update | :zap: |
| Improve format/structure | :art: |
| Refactor code | :hammer: |
| Removing code/files | :fire: |
| Continuous Integration | :green_heart: |
| Security | :lock: |
| Upgrading dependencies | :arrow_up: |
| Downgrading dependencies | :arrow_down: |
| Lint | :shirt: |
| Translation | :alien: |
| Text | :pencil: |
| Critical hotfix | :ambulance: |
| Deploying stuff | :rocket: |
| Fixing on MacOS | :apple: |
| Fixing on Linux | :penguin: |
| Fixing on Windows | :checkered_flag: |
| Work in progress | :construction: |
| Adding CI build system | :construction_worker: |
| Analytics or tracking code | :chart_with_upwards_trend: |
| Removing a dependency | :heavy_minus_sign: |
| Adding a dependency | :heavy_plus_sign: |
| Docker | :whale: |
| Configuration files | :wrench: |
| Package.json in JS | :package: |
| Merging branches | :twisted_rightwards_arrows: |
| Bad code / need improv. | :hankey: |
| Reverting changes | :rewind: |
| Breaking changes | :boom: |
| Code review changes | :ok_hand: |
| Accessibility | :wheelchair: |
| Move/rename repository | :truck: |

## Troubleshooting

- "String to replace not found": use `sed` instead.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer
rewrites due to overcomplication, and clarifying questions come before
implementation rather than after mistakes.
