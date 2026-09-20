# Ateliê Lara Lobo — Next.js + React

Migração independente do MVP visual. A pasta `../atelie-mvp` não é alterada.

## Executar

```powershell
pnpm install
pnpm dev
```

Abra http://localhost:3000. Para acessar na mesma rede, use o IP desta máquina e a porta 3000 (por exemplo, http://192.168.0.9:3000). O servidor usa 0.0.0.0; o firewall precisa permitir a conexão.

Para produção local: `pnpm build` e `pnpm start`.

## Organização

- `app/page.tsx`: página do ateliê.
- `app/pecas/page.jsx`: categorias do acervo.
- `app/pecas/[category]/page.jsx`: fotos de cada categoria.
- `app/layout.tsx`: estrutura compartilhada, metadados e idioma.
- `components/atelier`: estado React, seletores, ícones e visualizador.
- `components/gallery`: ampliação das fotos, teclado e navegação.
- `components/layout`: cabeçalho e rodapé.
- `lib/catalog.js`: opções e descrição da combinação.
- `lib/collections.js`: curadoria das 20 fotografias.
- `lib/three/jewelry.js`: construção das joias, contornos, garras e símbolo vazado.
- `lib/three/viewer.js`: cena, câmera, iluminação, exportação PNG e liberação dos recursos.
- `lib/three/brand-symbol.js`: contornos originais da página 3 do manual da marca.
- `lib/three/vendor`: mesma versão local de Three.js e addons do MVP, com licenças preservadas; sem dependência de CDN.
- `public/assets`: fotografias, marca e seis malhas de gemas copiadas do original.

O Three.js é carregado sob demanda apenas no navegador. A interface usa componentes e estado React, sem iframe ou injeção da aplicação antiga. O estado fica em memória no layout e acompanha a navegação até o acervo. Recarregar a página reinicia as escolhas. Não há banco de dados, acesso administrativo ou autenticação.

## Verificação

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Os testes verificam todas as famílias e lapidações nos extremos de tamanho e com contorno duplo. Também comparam o conteúdo do MVP original com `migration-source-hashes.json`; esse teste requer a pasta irmã original disponível. As proporções do visualizador permanecem ilustrativas.

Skills consultadas em `.agents/skills`: aplicada `vercel-react-best-practices`; as skills de React Native e transições não são necessárias para esta migração. A documentação da versão instalada está em `node_modules/next/dist/docs`.

### Estilos

Os componentes usam utilitários Tailwind CSS v4, incluindo estados de seleção e regras responsivas. `app/globals.css` concentra somente imports, tokens de tema e padrões globais mínimos. O Preflight foi omitido para preservar as medidas nativas de controles e a aparência existente. As amostras de metais e gemas usam classes completas em `lib/catalog.js`.
