'use client';
import { useEffect, useRef, useState, useImperativeHandle } from 'react';
import Image from 'next/image';
import { createViewer } from '@/lib/three/viewer';
import { families } from '@/lib/catalog';
export default function Viewer({ state, apiRef, onStatus }) {
    const host = useRef(null), section = useRef(null), engine = useRef(null), latest = useRef(state);
    const [status, setStatus] = useState('loading'), [light, setLight] = useState('studio'), [rotate, setRotate] = useState(false);
    useEffect(() => { latest.current = state; engine.current?.update(state); }, [state]);
    useEffect(() => { const instance = createViewer(host.current, latest.current, value => { setStatus(value); onStatus(value); }); engine.current = instance; return () => { engine.current = null; instance.dispose(); }; }, [onStatus]);
    useImperativeHandle(apiRef, () => ({ save: () => engine.current?.save(), reset: () => { engine.current?.reset(); } }), []);
    const unavailable = status !== 'ready';
    async function fullscreen() { try {
        if (document.fullscreenElement)
            await document.exitFullscreen();
        else
            await section.current.requestFullscreen();
    }
    catch { /* Normal viewer remains usable if fullscreen is refused. */ } }
    return <section ref={section} className="viewer" data-light={light} aria-label="Visualizador da joia em 3D"><div className="viewer-heading"><div><span className="eyebrow">{families[state.family].label}</span><h2>{families[state.family].models[state.model]}</h2></div><span className="live-badge"><i />{status === 'error' ? 'REFERÊNCIA FOTOGRÁFICA' : status === 'loading' ? 'CARREGANDO 3D' : '3D INTERATIVO'}</span></div>
 <div id="canvas-host" ref={host} hidden={status === 'error'} tabIndex={0} role="img" aria-label="Joia em 3D. Arraste para girar e use a roda do mouse para aproximar."/>
 {status === 'error' && <div id="fallback"><Image src={`/assets/reference-${families[state.family].photo}.jpg`} width={320} height={320} alt={`Referência: ${families[state.family].name}`}/><p>O 3D não está disponível neste dispositivo. Esta fotografia é uma referência do acervo e não representa suas escolhas.</p></div>}
 <div className="viewer-side"><button disabled={unavailable} aria-label="Aproximar" onClick={() => engine.current.zoom(.85)}>＋</button><button disabled={unavailable} aria-label="Afastar" onClick={() => engine.current.zoom(1.15)}>−</button><span /><button disabled={unavailable} aria-label="Restaurar ângulo" onClick={() => engine.current.reset()}>↺</button><button disabled={unavailable} aria-label="Tela cheia" onClick={fullscreen}>⛶</button></div>
 <div className="viewer-bottom"><div className="light-switch" role="group" aria-label="Iluminação">{[['studio', '☼ Estúdio'], ['warm', '◐ Ambiente']].map(([value, label]) => <button key={value} disabled={unavailable} className={light === value ? 'active' : ''} onClick={() => { setLight(value); engine.current.light(value); }}>{label}</button>)}</div><button disabled={unavailable} className="rotate-button" aria-label="Giro automático" aria-pressed={rotate} onClick={() => { setRotate(!rotate); engine.current.rotate(!rotate); }}>↻ <span>Giro automático</span></button></div><div className="canvas-hint">Arraste para explorar <span>·</span> Role para aproximar</div><div className="viewer-caption"><span>ESTUDO DE DESIGN</span><span>Representação ilustrativa · proporções aproximadas</span></div></section>;
}
