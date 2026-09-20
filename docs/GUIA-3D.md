# Guia de continuidade — Ateliê 3D Lara Lobo

Atualizado em 20/09/2026. Este documento preserva o contexto do projeto sem depender do histórico da conversa. Leia junto com `AGENTS.md` e confira o código atual antes de alterar proporções: o projeto pode evoluir depois desta data.

## 1. Objetivo e limites

O produto é um MVP visual para experimentar joias, modelos, metais, lapidações, pedras e tamanhos. A referência estética é o ateliê Lara Lobo e suas peças reais. Não há banco de dados, painel administrativo, autenticação ou orçamento de fabricação.

- Projeto ativo: `D:\tmp\lara-instagram-data\atelie-mvp-next`.
- Original preservado: `D:\tmp\lara-instagram-data\atelie-mvp`. Não editar, regenerar ou substituir arquivos nessa pasta.
- Stack atual: Next.js App Router, React, Tailwind v4 e Three.js local em `lib/three/vendor/`. Não modificar o vendor.
- Preservar a organização legível dos componentes feita pelo usuário. Não reformatar ou reestruturar arquivos sem necessidade.
- UI em português; código e comentários em inglês. Novos arquivos de aplicação em TypeScript; o motor existente em `lib/three` permanece JavaScript.
- As dimensões e os quilates são aproximações visuais. Não apresentar as malhas como CAD de produção, medidas certificadas ou instruções de cravação.
- Estilos de componentes usam Tailwind. `app/globals.css` contém imports, tema e defaults mínimos; Preflight está omitido para preservar a aparência. Não voltar às antigas classes CSS sem solicitação.

## 2. Mapa para encontrar a alteração certa

| Arquivo | Responsabilidade |
| --- | --- |
| `lib/catalog.js` | `families`, `cuts`, `metals`, `stones`, `initial`, `carats`, `summary()` e rótulos |
| `components/atelier/ConfigurationProvider.jsx` | Estado compartilhado no layout; persiste entre rotas, reinicia ao recarregar |
| `components/atelier/Atelier.jsx` | Escolhas, regras modelo/metal, carregamento dinâmico de `Viewer` com `ssr: false`, salvar imagem |
| `components/atelier/Controls.jsx` | Seções legíveis de configuração, ordem dos passos, controles visíveis por família/modelo |
| `components/atelier/Viewer.jsx` | Ponte React/motor; host do canvas, status, iluminação, zoom e tela cheia |
| `lib/three/viewer.js` | Renderer, câmera, luzes, ambiente, carregamento das gemas, resize, captura PNG e dispose |
| `lib/three/jewelry.js` | `createJewelry(state, gemGeometries)`: materiais e construção procedural de todas as famílias |
| `lib/three/brand-symbol.js` | Contornos vetoriais originais da assinatura vazada |
| `public/assets/gem-<cut>.json` | Malha facetada de cada lapidação |
| `lib/icons.js` / `components/atelier/Icon.jsx` | Ícones das famílias e lapidações |
| `lib/collections.js` / `public/assets/gallery/` | Acervo fotográfico, separado da geração 3D |
| `tests/migration.test.mjs` | Integridade do original e sanidade geométrica |

Fluxo: controles → estado React → `Viewer` → `engine.update(state)` → `createJewelry()` → cena Three.js. O motor reconstrói a joia quando o estado muda; trocar família/modelo também restaura a câmera.

## 3. Estado e opções existentes

Campos atuais: `family`, `model`, `metal`, `stone`, `cut`, `carat`, `halo`, `bandStyle`, `width`, `finish`.

| Campo | IDs atuais |
| --- | --- |
| Família/modelo | `ring`: `classic`, `duo`; `band`: `half`, `eternity`, `plain`; `earring`: `stud`, `halo`, `piercing`; `riviera`: `classic`, `graduated`, `rainbow` |
| Lapidação | `round`, `oval`, `pear`, `emerald`, `princess`, `heart` |
| Pedra/material | `diamond`, `emerald`, `paraiba`, `pink`, `sapphire`, `yellow` |
| Metal | `yellow`, `white`, `duo` |
| Contorno do solitário | `none`, `single` (rótulo Ilusion), `double` |
| Aro/acabamento | `plain` ou `pave`; `polished` ou `matte` |

`emerald` existe tanto como ID de lapidação quanto como ID de pedra: são conceitos independentes. “Adicionar uma gema” pode significar uma nova cor/material ou uma nova forma; não confundir os dois.

Regras relevantes: modelo `duo` escolhe metal `duo`; mudar seu metal para outro volta o modelo a `classic`. Aliança lisa mostra largura/acabamento e esconde controles de pedra. Riviera Rainbow esconde o seletor de pedra e usa uma lista própria de cores em `buildRiviera()`.

## 4. Convenções geométricas

- A gema tem altura no eixo Y; sua silhueta vista de cima ocupa X/Z. O aro do solitário circunda o plano X/Y, com largura no eixo Z.
- Gota deve ter seu eixo comprido em Z, vertical na vista superior da gema. Não a girar horizontalmente para acompanhar o aro.
- O loader cria `BufferGeometry` com `Float32BufferAttribute(data.positions, 3)`, calcula normais e bounding box. O arquivo esperado contém `positions`, uma lista plana de coordenadas de triângulos não indexados.
- Cada triângulo exige 9 números: três vértices XYZ. Índices, UVs e normais de um exportador externo não são utilizados pelo loader atual.
- Compare escala, origem, orientação, altura da cintura e bounds com os assets existentes. Não basta renomear um GLB/OBJ para JSON. Posição e proporção da montagem derivam da bounding box.
- No solitário, `size = 1.15 * cbrt(carat)` e `top = 2.05 + .25 + sy * .35`; `top` é a posição Y usada para o grupo da gema, não o máximo Y da malha.
- A malha `round` é reutilizada nos diamantes laterais. Mudar sua normalização afeta contornos, pavê e outras famílias.
- Gemas carregadas são compartilhadas entre várias meshes. Não deformar/rotacionar a geometria compartilhada durante a construção de uma peça. Para uma variação particular, usar um grupo/transformação coerente da montagem ou uma cópia com ciclo de vida explícito.

## 5. Decisões de design aprovadas — não regredir

### Aro do solitário

O usuário rejeitou o aro com aparência de “donut”. `ringBand()` usa um perfil com face interna plana e quinas internas definidas; o exterior é suavemente abaulado. Não substituir por um `TorusGeometry` circular nem por uma faixa totalmente retangular com arestas externas duras.

Parâmetros atuais de `buildRing()`: raio `2.05`, espessura radial `.145`, largura axial `.36`, com estreitamento nos ombros. São referências de implementação, não milímetros de fabricação.

### Ilusion e contorno duplo

`buildRingHalo()` segue o casco convexo da projeção X/Z da gema, para acompanhar a lapidação em vez de impor um círculo distante.

- Diamantes próximos à gema central, com assentamento e pequenas garras visíveis; não devem parecer flutuar.
- Diâmetro-base atual `.34 * carat ** .2`; quantidade calculada a partir do perímetro, par e com mínimo de 10. Tamanho e número são adaptativos.
- Os dois terminais da fileira interna são 16% maiores no algoritmo atual. O objetivo visual do usuário é destacar norte e sul; revisar a posição real em lapidações assimétricas, pois o segundo terminal é escolhido por meia volta de perímetro.
- No duplo, **cada diamante externo fica centralizado entre um par de vizinhos internos**, usando a mediatriz dos centros reais. Não distribuir apenas por ângulo em uma elipse maior.
- A solicitação histórica “1:2” significa essa relação de um externo com dois internos adjacentes. O usuário rejeitou uma fileira externa com metade das pedras. Na implementação aprovada, há uma pedra externa em cada intervalo e as duas fileiras têm a mesma contagem.
- Não criar um aro contínuo externo ligando toda a segunda fileira. O suporte individual de cada pedra continua existindo. Só a fileira interna recebe o tubo contínuo de ligação entre assentos.
- **Apenas um suporte descendente por diamante lateral**, nas duas fileiras, conectado ao aro inferior do símbolo. Permanecem três garras curtas junto de cada diamante: elas não devem virar três hastes longas até a base.
- O `halo` simples dentro de `stoneSetting()` atende outros usos, como brincos, e não é o mesmo algoritmo do contorno do solitário. Alterar um não atualiza automaticamente o outro.

### Símbolo vazado sob a gema

O símbolo real foi extraído da página 3 do manual da marca, não desenhado de memória. `brandContours` contém aberturas primeiro e o contorno externo por último. `buildSignatureBasket()` converte isso em `Shape` com `holes` e extrusão metálica.

- A assinatura fica sob a gema, como na foto de referência do anel real, e é visível ao girar a peça para sua parte inferior.
- Símbolo tão grande quanto couber na moldura, mantendo proporção uniforme, encostando nela. Não voltar a adicionar pequenos suportes dedicados à esquerda/direita e embaixo do símbolo.
- A moldura inferior deve ficar contida sob a gema, sem aparecer como um halo extra na vista superior. Também deve encontrar as garras que descem da montagem superior.
- Moldura atual: `rx = size * dims.x * .53 * .73`, `rz = size * dims.z * .53 * .73`, `baseY = top - sy * .52 - .055`; tubo de raio `.027`.
- Esses mesmos valores aparecem na base das garras centrais e em `buildRingHalo()`. Alterá-los de forma coordenada: mexer só em uma função pode produzir conexões soltas.
- As garras centrais são contínuas da moldura inferior até a superior e a gema. As hastes dos diamantes laterais usam essa mesma base inferior.
- Os ombros estruturais que ligam aro e cesta continuam necessários. Não confundir esses elementos com os antigos pequenos suportes internos do símbolo que o usuário pediu para retirar.

Esses objetivos precisam de inspeção superior, lateral e inferior. Uma bounding box válida não comprova que peças se tocam ou que a moldura está escondida em toda lapidação.

## 6. Adicionar uma pedra por cor/material

1. Adicionar um ID estável a `stones` em `lib/catalog.js`, com `name`, `color` e `swatchClass`. Usar uma classe Tailwind completa literal, por exemplo `bg-[#c43b58]`; não montar nomes de classes dinamicamente.
2. O seletor e o resumo usam o catálogo. Conferir se a nova opção cabe no layout estreito.
3. Ajustar `stoneMaterial()` apenas se o material precisar de aparência diferente. Hoje transmissão, IOR e dispersão são uma aproximação compartilhada; adicionar uma cor não cria propriedades físicas específicas automaticamente.
4. Só incluir na lista `rainbow` de `buildRiviera()` se solicitado. Uma nova pedra no catálogo não entra nessa sequência automaticamente.
5. Validar sob luz Estúdio/Ambiente, ouro amarelo/branco e tamanhos extremos. Não precisa de nova malha se a lapidação já existe.

## 7. Adicionar uma lapidação

1. Obter referência visual e malha facetada apropriada; confirmar o formato e a orientação desejados quando não estiverem claros.
2. Preparar `public/assets/gem-<id>.json` no contrato descrito acima. Verificar números finitos, comprimento múltiplo de 9, bounds não degenerados, escala comparável e faces orientadas para fora.
3. Adicionar `<id>` em `cuts` no catálogo e seu ícone em `lib/icons.js`. Conferir como `Icon.jsx` trata IDs desconhecidos.
4. O viewer carrega todos os IDs de `cuts` no início: um único arquivo ausente ou inválido pode derrubar o carregamento de todas as gemas. Entregar cadastro e asset juntos.
5. Verificar a montagem em `stoneSetting()`: ela ainda usa um aro elíptico e quatro garras genéricas. Lapidações especiais podem exigir outra disposição, proteção de pontas ou cesta específica.
6. Revisar o contorno, assinatura e conexões. O casco convexo não segue concavidades profundas, como a reentrância de um coração; não presumir ajuste perfeito para qualquer forma nova.
7. Os testes existentes enumeram `cuts`, mas acrescentar verificações direcionadas quando a nova forma exigir invariantes próprias. Inspecionar também alianças, brincos e rivieras, porque o seletor de lapidação é compartilhado.

## 8. Adicionar um modelo de anel

1. Distinguir novo solitário (`families.ring.models`) de nova aliança (`families.band.models`) ou nova família. Pedir fotos de topo, perfil e parte inferior se o pedido não definir a estrutura.
2. Registrar o modelo no catálogo; implementar uma ramificação explícita em `buildRing()`/`buildBand()` ou uma função dedicada chamada por elas. **Adicionar só o nome ao catálogo não muda a geometria.**
3. Manter as construções existentes. Hoje Clássico e DuoGold compartilham a forma base; a diferença passa pelas regras de metal e montagem bicolor.
4. Se houver várias gemas centrais, montar grupos com transformações locais e definir como tamanho, halo e símbolo se aplicam. Não multiplicar o estado global ou duplicar contornos sem necessidade.
5. Atualizar `visibleSections()` e a lógica `choose()` para opções compatíveis. Definir defaults ao trocar modelo/família e impedir combinações inválidas.
6. Atualizar `summary()` se o modelo trouxer propriedades novas; a exportação usa esse resumo. Rever enquadramento e chão em `viewer.js` se o volume mudar muito.
7. O teste atual enumera os modelos do catálogo, mas cobre principalmente a configuração inicial de cada um. Acrescentar combinações críticas específicas do novo modelo.

## 9. Recursos, execução e validação

`viewer.js` mantém `reusableGeometry` para as gemas. Na reconstrução, libera geometrias procedurais e materiais antigos, preservando os assets compartilhados. No encerramento, também deve liberar renderer, controles, observadores, ambiente e malhas carregadas. Recursos adicionais precisam de descarte correspondente; não alterar o vendor para resolver lógica da aplicação.

Usar `pnpm`; não instalar pacotes sem autorização. Conferir `package.json` atual antes de executar scripts. `pnpm lint` pode conter `--write --unsafe` e modificar muitos arquivos: não usá-lo como verificação somente de leitura.

```powershell
cd D:\tmp\lara-instagram-data\atelie-mvp-next
pnpm dev
# Em outro terminal, para validar mudanças de código:
pnpm typecheck
pnpm test
pnpm build
```

Prévia: `http://localhost:3000`. Na mesma rede, o usuário informou `http://192.168.0.9:3000`; confirmar o IP atual se não funcionar. Não iniciar dois servidores na mesma porta. `pnpm start` serve o build de produção e exige rebuild para incorporar edições.

Verificação visual mínima após mudar geometria:

- Modelo Clássico, cortes Oval/Gota e o corte novo; vistas superior, lateral e inferior.
- Tamanhos 0,30 e 3,00 ct, além de um intermediário; sem contorno, Ilusion, duplo; aro liso/cravejado quando aplicável.
- Ouro amarelo/branco/Duo e pedra branca/colorida; iluminação Estúdio/Ambiente.
- Sem pedras flutuantes, hastes duplicadas, interpenetrações evidentes ou símbolo deformado; garras e moldura conectadas.
- Zoom, giro, restaurar ângulo, troca de família/modelo e exportação PNG; navegar ao acervo e voltar sem perder a combinação.
- Tela larga e celular; canvas com dimensões positivas, sem rolagem horizontal da página, seletores usáveis.
- Console e carregamento de `/assets/gem-<id>.json`; se ficar em “Preparando” ou fallback, investigar asset, cache e servidor antes de alterar geometria.

`pnpm test` confere os hashes dos arquivos registrados do `../atelie-mvp/dist/` e verifica geometrias finitas/bounds razoáveis. Precisa da pasta original. **Não** comprova fidelidade visual, ausência de colisões, conexão de suportes ou descarte completo de todos os recursos. `typecheck` também não verifica internamente todo o JS, pois `checkJs` está desligado.

## 10. Referências e como retomar sem histórico

Fontes visuais fornecidas pelo usuário:

- Marca: `D:\Drive\Lara\Lara Lobo Joias\Marca e Papelaria\LaraLobo-v4.pdf`, página 3. O vetor utilizado já está versionável em `lib/three/brand-symbol.js`.
- Base assinada: `C:\Users\bruno\Downloads\LaraLobo_full_Aquamarine_and_Oval_Diamond_Ring_4.png`.
- Perfil dos aros: `LaraLobo_3-Stone_White_Gold_Diamond_Ring_1.png`, `_2.png` e `LaraLobo_Prong-Set_Diamond_Ring_2.png`, na pasta Downloads acima.
- Referência estética geral: `https://laralobo.com/`.

Esses caminhos externos podem deixar de existir. Capturas antigas em `AppData/Local/Temp` não são um acervo confiável. Se precisar reexaminar um detalhe ausente, pedir a imagem novamente; não inventar o desenho. Este guia não incorpora cópias dessas fotos/PDF.

Para retomar: ler `AGENTS.md` e este guia, inspecionar o diff atual para preservar alterações do usuário, localizar o ramo geométrico relevante e fazer uma mudança limitada ao pedido. Consultar as skills locais quando aplicáveis e a documentação instalada do Next ao mexer na aplicação. Separar decisão visual aprovada de aproximação do código; manter este guia atualizado após mudanças relevantes. Instruções novas do usuário podem revisar as decisões registradas aqui.
