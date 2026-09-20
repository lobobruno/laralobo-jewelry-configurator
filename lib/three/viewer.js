import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/addons/controls/OrbitControls.js';
import { RoomEnvironment } from './vendor/addons/environments/RoomEnvironment.js';
import { createJewelry } from './jewelry.js';
import { cuts, families, summary } from '../catalog.js';
export function createViewer(host, initialState, onStatus) {
    let state = initialState, renderer, scene, camera, controls, jewel, ground, envMap, observer;
    let ready = false, disposed = false, autoRotate = false, lightMode = 'studio';
    const abort = new AbortController(), gemGeometries = {}, reusableGeometry = new Set();
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    function disposeJewel() {
        if (!jewel)
            return;
        const geometries = new Set(), materials = new Set();
        jewel.traverse(o => { if (o.isMesh) {
            if (!reusableGeometry.has(o.geometry))
                geometries.add(o.geometry);
            if (Array.isArray(o.material))
                o.material.forEach(m => materials.add(m));
            else
                materials.add(o.material);
        } });
        geometries.forEach(g => g.dispose());
        materials.forEach(m => m.dispose());
        scene.remove(jewel);
    }
    function rebuild(reset = false) { if (!ready)
        return; disposeJewel(); jewel = createJewelry(state, gemGeometries); scene.add(jewel); ground.position.y = state.family === 'riviera' ? -1.02 : -2.38; if (reset)
        resetCamera(); render(); }
    function resetCamera() {
        if (!camera)
            return;
        const riv = state.family === 'riviera';
        controls.target.set(0, state.family === 'ring' ? .25 : 0, 0);
        camera.position.copy(riv ? V(7, 10, 11) : state.family === 'earring' ? V(4, 3, 10) : V(5.6, 6.5, 8.3));
        camera.zoom = 1;
        camera.updateProjectionMatrix();
        controls.update();
        render();
    }
    function render() { if (renderer && scene && camera)
        renderer.render(scene, camera); }
    async function init3D() {
        try {
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
            renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.05;
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            host.appendChild(renderer.domElement);
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(36, 1, .1, 80);
            const pmrem = new THREE.PMREMGenerator(renderer);
            const room = new RoomEnvironment();
            envMap = pmrem.fromScene(room, .025).texture;
            scene.environment = envMap;
            room.dispose();
            pmrem.dispose();
            const key = new THREE.DirectionalLight('#fff9e8', 2);
            key.name = 'key';
            key.position.set(-3, 8, 5);
            key.castShadow = true;
            key.shadow.mapSize.set(2048, 2048);
            key.shadow.camera.left = -7;
            key.shadow.camera.right = 7;
            key.shadow.camera.top = 7;
            key.shadow.camera.bottom = -7;
            key.shadow.bias = -.001;
            key.shadow.normalBias = .025;
            key.shadow.radius = 4;
            scene.add(key);
            const fill = new THREE.DirectionalLight('#dce9ff', 1);
            fill.position.set(5, 3, -4);
            scene.add(fill);
            scene.add(new THREE.AmbientLight('#ffffff', .45));
            ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ color: '#5b5546', opacity: .12 }));
            ground.rotation.x = -Math.PI / 2;
            ground.receiveShadow = true;
            scene.add(ground);
            controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = .08;
            controls.enablePan = false;
            controls.minDistance = 5;
            controls.maxDistance = 22;
            controls.maxPolarAngle = Math.PI * .88;
            controls.autoRotateSpeed = .6;
            const entries = await Promise.all(Object.keys(cuts).map(async (id) => { const response = await fetch(`/assets/gem-${id}.json`, { signal: abort.signal }); if (!response.ok)
                throw new Error('Gema indisponível'); const data = await response.json(); const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(data.positions, 3)); geo.computeVertexNormals(); geo.computeBoundingBox(); return [id, geo]; }));
            if (disposed) {
                entries.forEach(([, geo]) => geo.dispose());
                return;
            }
            for (const [id, geo] of entries) {
                gemGeometries[id] = geo;
                reusableGeometry.add(geo);
            }
            ready = true;
            rebuild(true);
            onStatus("ready");
            const resize = () => { const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); render(); };
            observer = new ResizeObserver(resize);
            observer.observe(host);
            resize();
            renderer.setAnimationLoop(() => { if (document.hidden)
                return; controls.autoRotate = autoRotate; controls.update(); render(); });
            renderer.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); ready = false; onStatus('error'); });
        }
        catch (err) {
            if (!disposed) {
                console.error('Visualizador indisponível', err);
                onStatus('error');
            }
        }
    }
    function zoom(factor) { if (!ready)
        return; camera.position.sub(controls.target).multiplyScalar(factor).add(controls.target); controls.update(); render(); }
    function key(e) { if (!ready)
        return; if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '-'].includes(e.key)) {
        e.preventDefault();
        if (e.key === '+')
            zoom(.85);
        else if (e.key === '-')
            zoom(1.15);
        else {
            const p = camera.position.clone().sub(controls.target);
            const sphere = new THREE.Spherical().setFromVector3(p);
            sphere.theta += e.key === 'ArrowLeft' ? .15 : e.key === 'ArrowRight' ? -.15 : 0;
            sphere.phi = THREE.MathUtils.clamp(sphere.phi + (e.key === 'ArrowUp' ? -.15 : e.key === 'ArrowDown' ? .15 : 0), .1, Math.PI - .1);
            camera.position.setFromSpherical(sphere).add(controls.target);
            controls.update();
            render();
        }
    } }
    host.addEventListener('keydown', key);
    init3D();
    return {
        update(next) { const reset = next.family !== state.family || next.model !== state.model; state = next; rebuild(reset); },
        zoom, reset: resetCamera, rotate(value) { autoRotate = value; },
        light(mode) { lightMode = mode; if (!ready)
            return; scene.getObjectByName('key').color.set(mode === 'warm' ? '#ffc581' : '#fff9e8'); renderer.toneMappingExposure = mode === 'warm' ? .95 : 1.05; render(); },
        async save() {
            if (!ready)
                throw Error('Visualizador indisponível');
            const width = 1800, height = 1600, oldSize = renderer.getSize(new THREE.Vector2()), oldPixel = renderer.getPixelRatio(), oldAspect = camera.aspect;
            let data;
            try {
                renderer.setPixelRatio(1);
                renderer.setSize(width, height, false);
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                render();
                data = renderer.domElement.toDataURL('image/png');
            }
            finally {
                renderer.setPixelRatio(oldPixel);
                renderer.setSize(oldSize.x, oldSize.y);
                camera.aspect = oldAspect;
                camera.updateProjectionMatrix();
                render();
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            const grad = ctx.createRadialGradient(900, 650, 50, 900, 650, 1000);
            grad.addColorStop(0, '#fffefb');
            grad.addColorStop(1, lightMode === 'warm' ? '#e7dac5' : '#e9e8e0');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);
            const img = new Image();
            img.src = data;
            await img.decode();
            ctx.drawImage(img, 0, 0);
            ctx.fillStyle = '#343f35';
            ctx.font = '32px Georgia';
            ctx.fillText('LARA LOBO  |  JOIAS', 75, 100);
            ctx.font = '24px sans-serif';
            ctx.fillText(families[state.family].models[state.model], 75, height - 128);
            ctx.font = '18px sans-serif';
            ctx.fillText(summary(state), 75, height - 86);
            ctx.fillStyle = '#78806d';
            ctx.font = '16px sans-serif';
            ctx.fillText('Estudo visual · representação ilustrativa · proporções aproximadas', 75, height - 47);
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            if (!blob)
                throw Error('Não foi possível gerar a imagem');
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'minha-joia-lara-lobo.png';
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 10000);
        },
        dispose() { disposed = true; ready = false; abort.abort(); observer?.disconnect(); host.removeEventListener('keydown', key); renderer?.setAnimationLoop(null); controls?.dispose(); disposeJewel(); Object.values(gemGeometries).forEach(g => g.dispose()); ground?.geometry.dispose(); ground?.material.dispose(); scene?.traverse(o => o.shadow?.dispose()); envMap?.dispose(); renderer?.dispose(); renderer?.domElement.remove(); }
    };
}
