import type { ScreenSignals } from "./types/screen-calibration"

type DisplayProfile = { width: number; height: number; ppi: number }

// These are display profiles, NOT unique iPhone model identifiers. Published PPI
// is rounded, and Display Zoom can mimic another profile: always verify physically.
// Manufacturer sources and intentionally excluded profiles: docs/RING-SIZING.md.
const iphoneDisplays: DisplayProfile[] = [
	{ width: 750, height: 1334, ppi: 326 },
	{ width: 828, height: 1792, ppi: 326 },
	{ width: 1170, height: 2532, ppi: 460 },
	{ width: 1179, height: 2556, ppi: 460 },
	{ width: 1284, height: 2778, ppi: 458 },
	{ width: 1290, height: 2796, ppi: 460 },
	{ width: 1206, height: 2622, ppi: 460 },
	{ width: 1320, height: 2868, ppi: 460 },
]

export function estimateScreenScale(
	signals: ScreenSignals,
): { referenceWidth: number; label: string } | null {
	const { width, height, pixelRatio, viewportScale, userAgent } = signals
	if (
		![width, height, pixelRatio, viewportScale].every(
			(value) => Number.isFinite(value) && value > 0,
		)
	)
		return null
	// A pinch-zoomed page must use manual calibration, not an uncorrected estimate.
	if (Math.abs(viewportScale - 1) > 0.001) return null
	const physicalWidth = Math.min(width, height) * pixelRatio
	const physicalHeight = Math.max(width, height) * pixelRatio
	const matches = (profile: DisplayProfile) =>
		Math.abs(profile.width - physicalWidth) <= 4 &&
		Math.abs(profile.height - physicalHeight) <= 4
	let profile: DisplayProfile | undefined
	let label = ""
	if (/iPhone/i.test(userAgent)) {
		profile = iphoneDisplays.find(matches)
		label = "Perfil de tela compatível com iPhone"
	} else if (/Android/i.test(userAgent)) {
		// Older browsers may expose the exact model in UA; never infer it from
		// a generic Android UA or from resolution alone.
		const model =
			signals.model?.trim() ||
			userAgent.match(
				/\b(Pixel 9|SM-S921[BUEWN0](?:1)?)(?=\s+Build|[;)/]|$)/i,
			)?.[1] ||
			""
		if (/^Pixel 9$/i.test(model)) {
			profile = { width: 1080, height: 2424, ppi: 422 }
			label = "Google Pixel 9"
		} else if (/^SM-S921[BUEWN0](?:1)?$/i.test(model)) {
			// Samsung lists a full-rectangle diagonal of 156.4 mm.
			profile = {
				width: 1080,
				height: 2340,
				ppi: Math.hypot(1080, 2340) / (156.4 / 25.4),
			}
			label = "Samsung Galaxy S24"
		}
		if (profile && !matches(profile)) return null
	}
	if (!profile) return null
	const referenceWidth =
		Math.round(((20 * profile.ppi) / (25.4 * pixelRatio)) * 4) / 4
	if (referenceWidth < 40 || referenceWidth > 200) return null
	return { referenceWidth, label }
}

type NavigatorWithHints = {
	userAgentData?: {
		getHighEntropyValues: (hints: string[]) => Promise<{ model?: string }>
	}
}

export async function readDeviceModel(
	nav: NavigatorWithHints,
): Promise<string> {
	try {
		const result = await nav.userAgentData?.getHighEntropyValues(["model"])
		return typeof result?.model === "string" ? result.model : ""
	} catch {
		// Unsupported, denied, or privacy-filtered hints fall back to manual.
		return ""
	}
}
