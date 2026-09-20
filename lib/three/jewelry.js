import * as THREE from './vendor/three.module.js';
import { brandContours } from './brand-symbol.js';
import { metals, stones } from '../catalog.js';
export function createJewelry(state, gemGeometries) {
    const jewel = new THREE.Group();
    function mesh(geometry, material, parent = jewel) { const m = new THREE.Mesh(geometry, material); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; }
    function metalMaterial(white = false) { return new THREE.MeshStandardMaterial({ color: white ? '#e4e9ee' : metals[state.metal].color, metalness: 1, roughness: state.finish === 'matte' && state.model === 'plain' ? .42 : .18, envMapIntensity: 1.4 }); }
    function stoneMaterial(id = state.stone) { return new THREE.MeshPhysicalMaterial({ color: stones[id].color, metalness: 0, roughness: .035, transmission: id === 'diamond' ? .55 : .3, thickness: .8, ior: 2.417, dispersion: .07, clearcoat: 1, clearcoatRoughness: .015, envMapIntensity: 1.7, attenuationColor: new THREE.Color(stones[id].color), attenuationDistance: id === 'diamond' ? 3 : 1.4 }); }
    function tubeCurve(points, radius, material, parent = jewel, closed = false) { return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, closed), Math.max(32, points.length * 4), radius, 8, closed), material, parent); }
    function rod(a, b, radius, material, parent) { const dir = new THREE.Vector3().subVectors(b, a); const m = mesh(new THREE.CylinderGeometry(radius, radius, dir.length(), 8), material, parent); m.position.copy(a).add(b).multiplyScalar(.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize()); return m; }
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    function ringBand(radius, thickness, width, material, parent = jewel, taper = false) {
        // Explicit radial/axial frame: thickness is radial, width runs along the finger.
        // Flat inner face with square inner edges; only the exterior is softly domed.
        const profile = new THREE.Shape();
        const t = thickness / 2, w = width / 2, edge = t - thickness * .6;
        profile.moveTo(-t, -w);
        profile.lineTo(edge, -w);
        profile.bezierCurveTo(t, -w, t, -w * .55, t, 0);
        profile.bezierCurveTo(t, w * .55, t, w, edge, w);
        profile.lineTo(-t, w);
        // Duplicate inner corners so their normals stay independent of the outer surface.
        const outline = profile.getPoints(16);
        outline.push(outline[outline.length - 1].clone(), outline[0].clone());
        const positions = [], indices = [], segments = 256, stride = outline.length;
        for (let i = 0; i <= segments; i++) {
            const gap = taper ? .24 : 0;
            const angle = gap + i / segments * (Math.PI * 2 - 2 * gap);
            const shoulder = taper ? Math.pow(Math.max(0, Math.cos(angle)), 6) : 0;
            for (const point of outline) {
                const radial = radius + point.x * (1 - .18 * shoulder);
                positions.push(Math.sin(angle) * radial, Math.cos(angle) * radial, point.y * (1 - .24 * shoulder));
            }
        }
        for (let i = 0; i < segments; i++)
            for (let j = 0; j < stride - 1; j++) {
                if (outline[j].equals(outline[j + 1]))
                    continue;
                const a = i * stride + j, b = (i + 1) * stride + j;
                indices.push(a, a + 1, b, a + 1, b + 1, b);
            }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        return mesh(geometry, material, parent);
    }
    function stoneSetting({ x = 0, y = 0, z = 0, size = 1, cut = state.cut, color = state.stone, prongs = true, parent = jewel, halo = false, signatureBase = false } = {}) {
        const group = new THREE.Group();
        group.position.set(x, y, z);
        parent.add(group);
        const geo = gemGeometries[cut] || gemGeometries.round;
        const stone = mesh(geo, stoneMaterial(color), group);
        stone.scale.setScalar(size);
        const bounds = geo.boundingBox.getSize(new THREE.Vector3());
        const sx = size * bounds.x, sz = size * bounds.z, sy = size * bounds.y;
        const mount = metalMaterial(state.metal === 'duo');
        const basket = [];
        for (let i = 0; i < 48; i++) {
            const a = i / 48 * Math.PI * 2;
            basket.push(V(Math.cos(a) * sx * .47, -sy * .19, Math.sin(a) * sz * .47));
        }
        tubeCurve(basket, Math.min(.035, size * .045), mount, group, true);
        if (prongs) {
            for (let i = 0; i < 4; i++) {
                const a = Math.PI / 4 + i * Math.PI / 2;
                const px = Math.cos(a) * sx * .53, pz = Math.sin(a) * sz * .53;
                if (signatureBase) {
                    // One continuous claw joins the lower gallery, upper rail and stone tip.
                    tubeCurve([V(px * .73, -sy * .52 - .055, pz * .73), V(Math.cos(a) * sx * .47, -sy * .19, Math.sin(a) * sz * .47), V(px, sy * .23, pz)], Math.min(.04, size * .045), mount, group);
                }
                else rod(V(px * .73, -sy * .48, pz * .73), V(px, sy * .23, pz), Math.min(.04, size * .045), mount, group);
                const tip = mesh(new THREE.SphereGeometry(Math.min(.046, size * .05), 10, 8), mount, group);
                tip.position.set(px, sy * .24, pz);
            }
        }
        if (halo) {
            const count = 18;
            for (let i = 0; i < count; i++) {
                const a = i / count * Math.PI * 2;
                stoneSetting({ x: Math.cos(a) * (sx * .57 + .13), y: sy * .04, z: Math.sin(a) * (sz * .57 + .13), size: .17, cut: 'round', color: 'diamond', parent: group });
            }
        }
        return group;
    }
    function buildRingHalo(geo, size, top, sy) {
        const dims = geo.boundingBox.getSize(V(0, 0, 0));
        const lowerX = size * dims.x * .53 * .73, lowerZ = size * dims.z * .53 * .73;
        const lowerY = top - sy * .52 - .055;
        const lowerAnchor = (x, z) => {
            const scale = Math.hypot(x / lowerX, z / lowerZ);
            return V(x / scale, lowerY, z / scale);
        };
        // Follow the gemstone's actual footprint, including clipped corners and pear tips.
        const attribute = geo.attributes.position, unique = new Map();
        for (let i = 0; i < attribute.count; i++) {
            const x = attribute.getX(i) * size, z = attribute.getZ(i) * size;
            unique.set(`${x.toFixed(5)},${z.toFixed(5)}`, { x, z });
        }
        const points = [...unique.values()].sort((a, b) => a.x - b.x || a.z - b.z);
        const cross = (a, b, c) => (b.x - a.x) * (c.z - a.z) - (b.z - a.z) * (c.x - a.x);
        const half = list => { const out = []; for (const p of list) {
            while (out.length > 1 && cross(out.at(-2), out.at(-1), p) <= 0)
                out.pop();
            out.push(p);
        } return out; };
        const hull = half(points).slice(0, -1).concat(half([...points].reverse()).slice(0, -1));
        const diameter = .34 * Math.pow(state.carat, .2), mount = metalMaterial(state.metal === 'duo');
        const roundHeight = gemGeometries.round.boundingBox.getSize(V(0, 0, 0)).y;
        let innerCount = 0;
        const innerStones = [];
        for (let row = 0; row < (state.halo === 'double' ? 2 : 1); row++) {
            const offset = diameter * (.49 + row * .88) + .006, contour = [];
            for (let i = 0; i < hull.length; i++) {
                const p = hull[i], prev = hull[(i + hull.length - 1) % hull.length], next = hull[(i + 1) % hull.length];
                const a = Math.atan2(-(p.x - prev.x), p.z - prev.z);
                let b = Math.atan2(-(next.x - p.x), next.z - p.z);
                while (b < a)
                    b += Math.PI * 2;
                for (let j = 0; j <= Math.max(1, Math.ceil((b - a) / .06)); j++) {
                    const angle = a + (b - a) * j / Math.max(1, Math.ceil((b - a) / .06));
                    contour.push({ x: p.x + Math.cos(angle) * offset, z: p.z + Math.sin(angle) * offset, nx: Math.cos(angle), nz: Math.sin(angle) });
                }
            }
            const north = contour.reduce((best, p, i) => p.z > contour[best].z ? i : best, 0);
            const path = contour.slice(north).concat(contour.slice(0, north));
            path.push(path[0]);
            const lengths = [0];
            for (let i = 1; i < path.length; i++)
                lengths.push(lengths.at(-1) + Math.hypot(path[i].x - path[i - 1].x, path[i].z - path[i - 1].z));
            const perimeter = lengths.at(-1);
            if (row === 0)
                innerCount = Math.max(10, 2 * Math.floor(perimeter / (diameter * 1.08) / 2));
            const count = innerCount;
            const seats = [];
            for (let i = 0; i < count; i++) {
                // Fill every gap: each outer diamond is shared by two adjacent inner diamonds.
                const fraction = row === 0 ? i / count : (i + .5) / innerCount;
                const distance = perimeter * fraction;
                let k = 1;
                while (lengths[k] < distance)
                    k++;
                const t = (distance - lengths[k - 1]) / (lengths[k] - lengths[k - 1]), p = path[k - 1], q = path[k];
                const nx = p.nx + (q.nx - p.nx) * t, nz = p.nz + (q.nz - p.nz) * t, normal = V(nx, 0, nz).normalize();
                const terminal = row === 0 && (i === 0 || i === count / 2), d = diameter * (terminal ? 1.16 : 1), extra = (d - diameter) / 2;
                let x = p.x + (q.x - p.x) * t + normal.x * extra, z = p.z + (q.z - p.z) * t + normal.z * extra;
                if (row === 0)
                    innerStones.push({ x, z, d });
                else {
                    // Use the actual neighboring centers, not arc fractions on a larger contour.
                    // The perpendicular bisector keeps the external stone centered on its pair.
                    const left = innerStones[i], right = innerStones[(i + 1) % count];
                    const dx = right.x - left.x, dz = right.z - left.z, separation = Math.hypot(dx, dz);
                    normal.set(dz / separation, 0, -dx / separation);
                    const clearance = (Math.max(left.d, right.d) + d) / 2 + .006;
                    const outward = Math.sqrt(Math.max(0, clearance * clearance - separation * separation / 4));
                    x = (left.x + right.x) / 2 + normal.x * outward;
                    z = (left.z + right.z) / 2 + normal.z * outward;
                }
                const h = d * roundHeight, y = top + sy * .08 - h * .25 - row * .045;
                stoneSetting({ x, y, z, size: d, cut: 'round', color: 'diamond', prongs: false });
                seats.push(V(x, y - h * .24, z));
                // Both halo rows share the signature's lower gallery as their foundation.
                tubeCurve([lowerAnchor(x, z), V(x * .94, y - h * .55, z * .94), V(x, y - h * .24, z)], d * .055, mount);
                const angle = Math.atan2(normal.z, normal.x);
                for (let j = 0; j < 3; j++) {
                    const a = angle + j * Math.PI * 2 / 3, dx = Math.cos(a) * d * .48, dz = Math.sin(a) * d * .48;
                    // Short claws hold the stone; only its central rib descends to the gallery.
                    tubeCurve([V(x + dx * .72, y - h * .48, z + dz * .72), V(x + dx * 1.06, y, z + dz * 1.06), V(x + dx, y + h * .28, z + dz)], d * .048, mount);
                    const tip = mesh(new THREE.SphereGeometry(d * .065, 10, 8), mount);
                    tip.position.set(x + dx, y + h * .29, z + dz);
                }
            }
            if (row === 0)
                tubeCurve(seats, diameter * .055, mount, jewel, true);
        }
    }
    function buildSignatureBasket(size, dims, top, sy) {
        const material = metalMaterial(state.metal === 'duo');
        // Keep the under-gallery inside the gemstone silhouette, including narrow cuts.
        const rx = size * dims.x * .53 * .73, rz = size * dims.z * .53 * .73;
        // Largest uniform scale inside the frame; preserve the original brand proportions.
        const extent = Math.max(...brandContours.at(-1).map(([x, y]) => Math.hypot(x / rx, y / rz)));
        const width = 1 / extent, baseY = top - sy * .52 - .055;
        const path = (contour, Type) => {
            const p = new Type();
            contour.forEach(([x, y], i) => i ? p.lineTo(x * width, y * width) : p.moveTo(x * width, y * width));
            p.closePath();
            return p;
        };
        const shape = path(brandContours.at(-1), THREE.Shape);
        shape.holes = brandContours.slice(0, -1).map(c => path(c, THREE.Path));
        const symbol = mesh(new THREE.ExtrudeGeometry(shape, { depth: .035, bevelEnabled: true, bevelThickness: .003, bevelSize: .003, bevelSegments: 2, steps: 1 }), material);
        symbol.rotation.x = -Math.PI / 2;
        symbol.position.y = baseY;
        // Open under-gallery, seen through the finger opening, as on the reference ring.
        const frame = [];
        for (let i = 0; i < 64; i++) {
            const a = i / 64 * Math.PI * 2;
            frame.push(V(rx * Math.cos(a), baseY, rz * Math.sin(a)));
        }
        tubeCurve(frame, .027, material, jewel, true);
        for (const side of [-1, 1]) {
            tubeCurve([V(side * 2.05 * Math.sin(.24), 2.05 * Math.cos(.24), 0), V(side * rx, baseY, 0)], .063, material);
            tubeCurve([V(side * rx, baseY, 0), V(side * size * dims.x * .34, top - sy * .3, 0), V(side * size * dims.x * .43, top - sy * .19, 0)], .026, material);
        }
    }
    function buildRing() {
        const radius = 2.05, metal = metalMaterial();
        ringBand(radius, .145, .36, metal, jewel, true);
        const size = 1.15 * Math.cbrt(state.carat), geo = gemGeometries[state.cut], dims = geo.boundingBox.getSize(V(0, 0, 0));
        const sy = dims.y * size, top = radius + .25 + sy * .35;
        stoneSetting({ y: top, size, signatureBase: true });
        buildSignatureBasket(size, dims, top, sy);
        for (const side of [-1, 1])
            tubeCurve([V(side * .9, 1.84, 0), V(side * .64, 2.02, 0), V(side * .29, top - sy * .36, 0)], .048, metal);
        if (state.halo !== 'none')
            buildRingHalo(geo, size, top, sy);
        if (state.bandStyle === 'pave')
            for (const side of [-1, 1])
                for (let i = 0; i < 10; i++) {
                    const a = .32 + i * .10;
                    const seatRadius = radius + .11;
                    const g = stoneSetting({ x: side * seatRadius * Math.sin(a), y: seatRadius * Math.cos(a), size: .17, cut: 'round', color: 'diamond' });
                    g.rotation.z = -side * a;
                }
    }
    function buildBand() {
        const metal = metalMaterial();
        if (state.model === 'plain') {
            if (state.metal === 'duo') {
                ringBand(2.05, .27, state.width * .15, metal);
                const stripe = ringBand(2.07, .28, state.width * .046, metalMaterial(true));
                stripe.position.z = .08;
            }
            else
                ringBand(2.05, .27, state.width * .15, metal);
            return;
        }
        ringBand(2.05, .16, .27, metal);
        const size = .43 * Math.cbrt(state.carat), half = state.model === 'half';
        const count = half ? 11 : 26;
        for (let i = 0; i < count; i++) {
            const a = half ? (-Math.PI * .46 + i / (count - 1) * Math.PI * .92) : i / count * Math.PI * 2;
            const g = stoneSetting({ x: 2.11 * Math.sin(a), y: 2.11 * Math.cos(a), size });
            g.rotation.z = -a;
        }
    }
    function buildEarring() {
        const metal = metalMaterial(), size = 1.15 * Math.cbrt(state.carat);
        if (state.model === 'piercing') {
            const pts = [];
            for (let i = 0; i <= 50; i++) {
                const a = -.7 + i / 50 * 5;
                pts.push(V(Math.cos(a) * 1.35, Math.sin(a) * 1.35, 0));
            }
            tubeCurve(pts, .12, metal);
            for (let i = 0; i < 7; i++) {
                const a = .15 + i * .23;
                const g = stoneSetting({ x: 1.4 * Math.cos(a), y: 1.4 * Math.sin(a), size: .38 * Math.cbrt(state.carat) });
                g.rotation.z = a - Math.PI / 2;
            }
        }
        else {
            for (const side of [-1, 1]) {
                const root = new THREE.Group();
                root.position.set(side * 1.25, .1, 0);
                root.rotation.x = Math.PI / 2;
                root.rotation.z = side * .12;
                jewel.add(root);
                stoneSetting({ size, halo: state.model === 'halo', parent: root });
                rod(V(0, -.3, 0), V(0, -1.2, 0), .05, metal, root);
                const back = mesh(new THREE.TorusGeometry(.19, .05, 8, 20), metal, root);
                back.rotation.x = Math.PI / 2;
                back.position.y = -.95;
            }
        }
    }
    function buildRiviera() {
        const metal = metalMaterial(), count = 64, points = [];
        for (let i = 0; i < count; i++) {
            const a = i / count * Math.PI * 2;
            points.push(V(Math.sin(a) * 3.5, -.65, Math.cos(a) * 4.05));
        }
        tubeCurve(points, .045, metal, jewel, true);
        const rainbow = ['sapphire', 'paraiba', 'emerald', 'yellow', 'pink'];
        for (let i = 0; i < count; i++) {
            const a = i / count * Math.PI * 2;
            const gradient = state.model === 'graduated' ? (.32 + .28 * (1 + Math.cos(a)) / 2) : .36;
            stoneSetting({ x: Math.sin(a) * 3.5, y: -.6, z: Math.cos(a) * 4.05, size: gradient * Math.cbrt(state.carat), color: state.model === 'rainbow' ? rainbow[Math.floor(i / count * rainbow.length)] : state.stone });
        }
        const clasp = mesh(new THREE.BoxGeometry(.32, .14, .3), metal);
        clasp.position.set(0, -.65, -4.05);
    }
    ({ ring: buildRing, band: buildBand, earring: buildEarring, riviera: buildRiviera }[state.family])();
    return jewel;
}
