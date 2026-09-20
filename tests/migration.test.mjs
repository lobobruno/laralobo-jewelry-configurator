import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import { cuts, families, initial } from "../lib/catalog.js"
import { createJewelry } from "../lib/three/jewelry.js"
import * as THREE from "../lib/three/vendor/three.module.js"

const geometries = Object.fromEntries(
	Object.keys(cuts).map((cut) => {
		const { positions } = JSON.parse(
			readFileSync(
				new URL(`../public/assets/gem-${cut}.json`, import.meta.url),
			),
		)
		const geo = new THREE.BufferGeometry()
		geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
		geo.computeBoundingBox()
		geo.computeVertexNormals()
		return [cut, geo]
	}),
)
test("The original MVP remains byte-for-byte unchanged", () => {
	const hashes = JSON.parse(
		readFileSync(new URL("../migration-source-hashes.json", import.meta.url)),
	)
	for (const [path, hash] of Object.entries(hashes))
		assert.equal(
			createHash("sha256")
				.update(
					readFileSync(
						new URL(`../../atelie-mvp/dist/${path}`, import.meta.url),
					),
				)
				.digest("hex"),
			hash,
			path,
		)
})
test("All models and ring cuts produce finite 3D geometry", () => {
	const configurations = Object.entries(families).flatMap(([family, f]) =>
		Object.keys(f.models).map((model) => ({ ...initial, family, model })),
	)
	for (const cut of Object.keys(cuts))
		for (const carat of [0.3, 3])
			configurations.push({ ...initial, cut, carat, halo: "double" })
	for (const config of configurations) {
		const object = createJewelry(config, geometries)
		assert.ok(object.children.length)
		const disposable = new Set(),
			materials = new Set()
		object.traverse((mesh) => {
			if (!mesh.isMesh) return
			for (const value of mesh.geometry.attributes.position.array)
				assert.ok(Number.isFinite(value), JSON.stringify(config))
			if (!Object.values(geometries).includes(mesh.geometry))
				disposable.add(mesh.geometry)
			materials.add(mesh.material)
		})
		const bounds = new THREE.Box3().setFromObject(object)
		assert.ok(!bounds.isEmpty())
		assert.ok(bounds.max.length() < 30)
		disposable.forEach((g) => {
			g.dispose()
		})
		materials.forEach((m) => {
			m.dispose()
		})
	}
})
