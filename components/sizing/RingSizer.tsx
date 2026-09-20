"use client"

import { useEffect, useRef, useState } from "react"
import { estimateScreenScale, readDeviceModel } from "@/lib/screen-calibration"

const format = new Intl.NumberFormat("pt-BR", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
})
const control =
	"size-11 shrink-0 rounded-full border border-solid border-[#c6cebf] bg-white text-xl hover:bg-[#edf1e9] disabled:opacity-40"

export default function RingSizer() {
	const [referenceWidth, setReferenceWidth] = useState(76)
	const [diameter, setDiameter] = useState(18)
	const [calibrated, setCalibrated] = useState(false)
	const [invalidated, setInvalidated] = useState(false)
	const [automatic, setAutomatic] = useState<{
		status: "checking" | "suggested" | "unavailable" | "manual"
		label?: string
	}>({ status: "checking" })
	const manuallyAdjusted = useRef(false)
	const pixelsPerMm = referenceWidth / 20
	// ABNT reference: internal circumference in millimetres minus 40.
	const ringSize = Math.round(Math.PI * diameter - 40)

	useEffect(() => {
		let cancelled = false
		// Bound the optional browser lookup; calibration remains usable throughout.
		const timeout = window.setTimeout(() => {
			cancelled = true
			if (!manuallyAdjusted.current) setAutomatic({ status: "unavailable" })
		}, 1500)
		async function suggestScale() {
			const model = await readDeviceModel(
				navigator as Parameters<typeof readDeviceModel>[0],
			)
			if (cancelled || manuallyAdjusted.current) return
			window.clearTimeout(timeout)
			const estimate = estimateScreenScale({
				userAgent: navigator.userAgent,
				model,
				width: window.screen.width,
				height: window.screen.height,
				pixelRatio: window.devicePixelRatio,
				viewportScale: window.visualViewport?.scale ?? 1,
			})
			if (estimate) {
				setReferenceWidth(estimate.referenceWidth)
				setAutomatic({ status: "suggested", label: estimate.label })
			} else setAutomatic({ status: "unavailable" })
		}
		void suggestScale()
		return () => {
			cancelled = true
			window.clearTimeout(timeout)
		}
	}, [])

	useEffect(() => {
		if (!calibrated) return
		const viewport = window.visualViewport
		const width = window.innerWidth
		const ratio = window.devicePixelRatio
		const scale = viewport?.scale ?? 1
		const invalidate = () => {
			if (
				window.innerWidth !== width ||
				window.devicePixelRatio !== ratio ||
				(viewport?.scale ?? 1) !== scale
			) {
				setCalibrated(false)
				setInvalidated(true)
			}
		}
		const orientation = () => {
			setCalibrated(false)
			setInvalidated(true)
		}
		window.addEventListener("resize", invalidate)
		viewport?.addEventListener("resize", invalidate)
		window.screen.orientation?.addEventListener("change", orientation)
		const resolution = window.matchMedia(`(resolution: ${ratio}dppx)`)
		resolution.addEventListener("change", orientation)
		return () => {
			window.removeEventListener("resize", invalidate)
			viewport?.removeEventListener("resize", invalidate)
			window.screen.orientation?.removeEventListener("change", orientation)
			resolution.removeEventListener("change", orientation)
		}
	}, [calibrated])

	function adjustReference(value: number) {
		manuallyAdjusted.current = true
		setAutomatic({ status: "manual" })
		setReferenceWidth(Math.min(200, Math.max(40, value)))
		setCalibrated(false)
	}

	function adjustDiameter(value: number) {
		setDiameter(Math.min(25, Math.max(13, Math.round(value * 20) / 20)))
	}

	return (
		<div>
			<div className="grid items-start gap-6 md:grid-cols-[.9fr_1.1fr]">
				<section
					aria-labelledby="calibration-title"
					className="rounded-lg border border-line border-solid bg-white p-5 sm:p-8"
				>
					<p className="m-0 text-[#766442] text-sm tracking-widest">PASSO 01</p>
					<h2 id="calibration-title">Calibre sua tela</h2>
					<p
						role="status"
						className="border-[#a59b53] border-y-0 border-r-0 border-l-2 border-solid pl-3 text-[#5d685e] text-sm leading-relaxed"
					>
						{automatic.status === "checking" &&
							"Verificando se há um ajuste inicial para sua tela… Você já pode usar a régua."}
						{automatic.status === "suggested" && (
							<>
								<strong className="font-medium text-green">
									{automatic.label}
								</strong>
								<br />
								Aplicamos uma estimativa inicial. Confira os 2 cm com a régua e
								ajuste se necessário.
							</>
						)}
						{automatic.status === "unavailable" &&
							"Não foi possível estimar a medida física desta tela. Use a régua para calibrar."}
						{automatic.status === "manual" &&
							"Ajuste manual. Confira os 2 cm com a régua antes de confirmar."}
					</p>
					<p id="calibration-help" className="text-base leading-relaxed">
						Encoste uma régua na tela. Ajuste a linha até a distância entre as
						duas marcas corresponder a <strong>2 cm na régua</strong>.
					</p>
					<div
						className="flex h-24 items-center justify-center rounded-md bg-[#f5f5ef]"
						aria-hidden="true"
					>
						<div
							className="relative h-px shrink-0 bg-green"
							style={{ width: referenceWidth }}
						>
							<span className="absolute top-[-10px] left-0 h-5 w-px bg-green" />
							<span className="absolute top-[-10px] right-0 h-5 w-px bg-green" />
							<span className="absolute top-4 w-full text-center text-sm">
								2 cm
							</span>
						</div>
					</div>
					<label htmlFor="screen-scale" className="mt-6 mb-2 block text-sm">
						Ajuste da linha de referência
					</label>
					<div className="flex items-center gap-3">
						<button
							type="button"
							className={control}
							aria-label="Diminuir linha de referência"
							disabled={referenceWidth <= 40}
							onClick={() => adjustReference(referenceWidth - 0.25)}
						>
							−
						</button>
						<input
							id="screen-scale"
							type="range"
							min="40"
							max="200"
							step="0.25"
							value={referenceWidth}
							onChange={(event) => adjustReference(Number(event.target.value))}
							aria-describedby="calibration-help"
							aria-valuetext="Ajuste até a linha medir dois centímetros na sua régua"
							className="m-0 h-11 w-full min-w-0 accent-[#104735]"
						/>
						<button
							type="button"
							className={control}
							aria-label="Aumentar linha de referência"
							disabled={referenceWidth >= 200}
							onClick={() => adjustReference(referenceWidth + 0.25)}
						>
							+
						</button>
					</div>
					<button
						type="button"
						onClick={() => {
							manuallyAdjusted.current = true
							if (automatic.status === "checking")
								setAutomatic({ status: "manual" })
							setCalibrated(true)
							setInvalidated(false)
						}}
						className="mt-5 min-h-12 w-full rounded-md bg-[#104735] px-4 py-3 text-base text-white hover:bg-[#08603f]"
					>
						{calibrated ? "✓ Tela calibrada" : "A linha mede 2 cm — confirmar"}
					</button>
					<p
						role="status"
						className="mb-0 text-[#5d685e] text-sm leading-relaxed"
					>
						{invalidated
							? "A escala da tela mudou. Confira os 2 cm com a régua e confirme novamente."
							: "Mantenha o mesmo zoom e a mesma tela durante a medição. Se mudar de tela, calibre novamente."}
					</p>
				</section>

				<section
					aria-labelledby="measurement-title"
					className="min-w-0 rounded-lg border border-line border-solid bg-white p-4 sm:p-8"
				>
					<p className="m-0 text-[#766442] text-sm tracking-widest">PASSO 02</p>
					<h2 id="measurement-title">Encontre o encaixe</h2>
					<p id="ring-help" className="text-base leading-relaxed">
						Apoie seu anel sobre o círculo. Ajuste até a{" "}
						<strong>borda externa da linha verde</strong> coincidir com a borda
						interna do anel, sem incluir o metal.
					</p>
					<div
						className="relative flex min-h-[280px] items-center justify-center rounded-md bg-[#f7f7f1]"
						aria-label={
							calibrated
								? `Círculo com diâmetro interno de ${format.format(diameter)} milímetros`
								: "Círculo ilustrativo; calibre a tela para medir"
						}
						role="img"
					>
						{/* Border-box outer diameter is the measured edge; never scale this with responsive CSS. */}
						<div
							className="relative box-border shrink-0 rounded-full border border-[#104735] border-solid bg-white"
							style={{
								width: diameter * pixelsPerMm,
								height: diameter * pixelsPerMm,
							}}
						>
							<span
								aria-hidden="true"
								className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#a8ae9d] text-lg"
							>
								+
							</span>
						</div>
						{!calibrated && (
							<span className="absolute right-2 bottom-3 left-2 text-center text-[#5d685e] text-sm">
								Prévia · calibre a tela antes de medir
							</span>
						)}
					</div>
					<label htmlFor="ring-diameter" className="mt-5 mb-2 block text-sm">
						Diâmetro do círculo
					</label>
					<div className="flex items-center gap-3">
						<button
							type="button"
							className={control}
							aria-label="Diminuir diâmetro em 0,05 milímetro"
							disabled={!calibrated || diameter <= 13}
							onClick={() => adjustDiameter(diameter - 0.05)}
						>
							−
						</button>
						<input
							id="ring-diameter"
							type="range"
							min="13"
							max="25"
							step="0.05"
							value={diameter}
							disabled={!calibrated}
							onChange={(event) => adjustDiameter(Number(event.target.value))}
							aria-describedby="ring-help"
							aria-valuetext={`${format.format(diameter)} milímetros`}
							className="m-0 h-11 w-full min-w-0 accent-[#104735] disabled:opacity-40"
						/>
						<button
							type="button"
							className={control}
							aria-label="Aumentar diâmetro em 0,05 milímetro"
							disabled={!calibrated || diameter >= 25}
							onClick={() => adjustDiameter(diameter + 0.05)}
						>
							+
						</button>
					</div>
					<div
						aria-live="polite"
						aria-atomic="true"
						className="mt-5 rounded-md bg-[#104735] p-5 text-[#f8f6ee]"
					>
						<p className="m-0 text-sm">
							{calibrated
								? "Seu aro estimado · referência ABNT"
								: "Seu resultado aparece após a calibração"}
						</p>
						{calibrated ? (
							<div className="mt-3 flex flex-wrap items-center justify-between gap-3">
								<strong className="font-display font-normal text-5xl">
									{ringSize}
								</strong>
								<div className="text-sm tabular-nums leading-relaxed">
									Diâmetro: {format.format(diameter)} mm
									<br />
									Circunferência: {format.format(Math.PI * diameter)} mm
								</div>
							</div>
						) : (
							<p className="mb-0 text-sm leading-relaxed">
								Confirme a medida de 2 cm no passo 01 para começar.
							</p>
						)}
					</div>
					<p className="mb-0 text-[#5d685e] text-sm leading-relaxed">
						Use + e − para um ajuste fino. Se o anel não se encaixar entre 13 e
						25 mm, peça uma medição ao ateliê.
					</p>
				</section>
			</div>
			<p className="mx-auto mt-6 mb-0 max-w-[820px] text-[#5d685e] text-sm leading-relaxed">
				Esta é uma estimativa. Aros tradicionais podem ter outra numeração:
				confirme o diâmetro em milímetros e o tamanho com o ateliê antes de
				encomendar. Use um anel redondo, sem deformações, e apoie-o com cuidado
				para não riscar a tela.
			</p>
		</div>
	)
}
