import assert from "node:assert/strict"
import { test } from "node:test"
import type { ScreenSignals } from "../lib/types/screen-calibration"

// Dynamic file URL allows Node's type stripping without changing app TS options.
const { estimateScreenScale, readDeviceModel } = (await import(
	new URL("../lib/screen-calibration.ts", import.meta.url).href
)) as typeof import("../lib/screen-calibration")
const iphone: ScreenSignals = {
	userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)",
	width: 393,
	height: 852,
	pixelRatio: 3,
	viewportScale: 1,
}

test("iPhone display estimate gives a physical 20 mm reference, without claiming an exact model", () => {
	const result = estimateScreenScale(iphone)
	assert.ok(result)
	assert.ok(Math.abs(((result.referenceWidth * 3) / 460) * 25.4 - 20) < 0.03)
	assert.equal(result.label, "Perfil de tela compatível com iPhone")
	assert.deepEqual(
		estimateScreenScale({ ...iphone, width: 852, height: 393 }),
		result,
	)
})

test("unknown, ambiguous, desktop, invalid and pinch-zoomed screens do not get estimates", () => {
	for (const change of [
		{ userAgent: "Windows Chrome" },
		{ width: 375, height: 812 },
		{ width: 1000 },
		{ viewportScale: 1.5 },
		{ pixelRatio: 0 },
		{ width: NaN },
	])
		assert.equal(estimateScreenScale({ ...iphone, ...change }), null)
})

test("Android needs a known exact model and compatible display", () => {
	const pixel: ScreenSignals = {
		userAgent: "Android",
		model: "Pixel 9",
		width: 432,
		height: 969.6,
		pixelRatio: 2.5,
		viewportScale: 1,
	}
	const result = estimateScreenScale(pixel)
	assert.ok(result)
	assert.ok(Math.abs(((result.referenceWidth * 2.5) / 422) * 25.4 - 20) < 0.03)
	for (const change of [
		{ model: "" },
		{ model: "Pixel 9 Pro" },
		{ height: 800 },
	]) {
		assert.equal(estimateScreenScale({ ...pixel, ...change }), null)
	}
	assert.equal(
		estimateScreenScale({
			...pixel,
			model: "",
			userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 9 Build/ABC)",
		})?.label,
		"Google Pixel 9",
	)
})

test("Galaxy S24 scale uses its full physical diagonal and does not match the Plus", () => {
	const samsung = {
		...iphone,
		userAgent: "Android",
		model: "SM-S921B",
		width: 360,
		height: 780,
	}
	const result = estimateScreenScale(samsung)
	assert.ok(result)
	const screenWidthMm = (156.4 * 1080) / Math.hypot(1080, 2340)
	assert.ok(Math.abs((result.referenceWidth / 360) * screenWidthMm - 20) < 0.03)
	assert.equal(estimateScreenScale({ ...samsung, model: "SM-S926B" }), null)
})

test("missing or rejected browser hints fall back without failure", async () => {
	assert.equal(await readDeviceModel({}), "")
	assert.equal(
		await readDeviceModel({
			userAgentData: {
				getHighEntropyValues: async () => {
					throw new Error("Denied")
				},
			},
		}),
		"",
	)
	assert.equal(
		await readDeviceModel({
			userAgentData: {
				getHighEntropyValues: async (hints) => {
					assert.deepEqual(hints, ["model"])
					return { model: "Pixel 9" }
				},
			},
		}),
		"Pixel 9",
	)
})
