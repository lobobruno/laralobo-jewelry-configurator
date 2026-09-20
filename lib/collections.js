// Selected by visual review, not by the original (occasionally inaccurate) filenames.
export const collections = {
    ring: { name: 'Solitários', description: 'A pedra central em diferentes proporções, lapidações e detalhes.', photos: [
            [150, 'Três proporções de solitário', 'Três anéis solitários sobre a mão, em fundo neutro.'],
            [123, 'Brilho em detalhe', 'Solitário com pedra redonda, fotografado de perto na mão.'],
            [237, 'Contorno delicado', 'Anel com pedra rosada e contorno sobre fundo verde.'],
            [122, 'Linhas essenciais', 'Anel de aro delicado e pedra central na mão.'],
            [235, 'À luz natural', 'Solitário de aro cravejado fotografado ao ar livre.']
        ] },
    band: { name: 'Alianças', description: 'Texturas, cores e sequências de pedras para combinar.', photos: [
            [268, 'Delicadeza em verde', 'Aliança cravejada sobre tecido verde da marca.'],
            [272, 'Lapidação retangular', 'Aliança com pedras retangulares em tons verdes.'],
            [127, 'Encontro de lapidações', 'Alianças com diferentes lapidações sobre os dedos.'],
            [264, 'Um toque de cor', 'Aliança com pedras coloridas sobre uma mão apoiada em pedra clara.'],
            [241, 'Cores e assinatura', 'Alianças coloridas com o símbolo da marca, sobre superfície de pedra.']
        ] },
    earring: { name: 'Brincos & piercings', description: 'Pontos de luz, contornos e composições para a orelha.', photos: [
            [160, 'Gotas de cor', 'Par de brincos de gota azul com contorno claro, sobre fundo verde.'],
            [257, 'Contorno violeta', 'Par de brincos violetas com contorno na caixa da marca.'],
            [156, 'Pontos de luz', 'Brincos redondos nas caixas verdes e marrons da marca.'],
            [238, 'Composição na orelha', 'Detalhe de piercings cravejados combinados na orelha.'],
            [226, 'Verde em duas formas', 'Brincos verdes de gota e coração no expositor de orelha.']
        ] },
    riviera: { name: 'Rivieras', description: 'Do brilho contínuo às combinações de cores.', photos: [
            [180, 'Cores no pulso', 'Três pulseiras riviera em tons violeta, multicolorido e azul.'],
            [54, 'Duas proporções', 'Duas rivieras de pedras claras sobre o veludo da caixa.'],
            [138, 'Sequência em verde', 'Detalhe de rivieras de pedras verdes sobre a mão.'],
            [98, 'Uma linha de luz', 'Riviera de pedras claras disposta em curva sobre tecido.'],
            [255, 'Contraste e cor', 'Rivieras coloridas combinadas com uma manga verde.']
        ] }
};
export const photoSource = id => `/assets/gallery/${String(id).padStart(3, '0')}.jpg`;
