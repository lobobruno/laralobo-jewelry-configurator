"use client"
import Image from "next/image"
import { useEffect, useImperativeHandle, useRef, useState } from "react"
import { families } from "@/lib/catalog"
import { createViewer } from "@/lib/three/viewer"
export default function Viewer({ state, apiRef, onStatus }) {
	const host = useRef(null),
		section = useRef(null),
		engine = useRef(null),
		latest = useRef(state)
	const [status, setStatus] = useState("loading"),
		[light, setLight] = useState("studio"),
		[rotate, setRotate] = useState(false)
	useEffect(() => {
		latest.current = state
		engine.current?.update(state)
	}, [state])
	useEffect(() => {
		const instance = createViewer(host.current, latest.current, (value) => {
			setStatus(value)
			onStatus(value)
		})
		engine.current = instance
		return () => {
			engine.current = null
			instance.dispose()
		}
	}, [onStatus])
	useImperativeHandle(
		apiRef,
		() => ({
			save: () => engine.current?.save(),
			reset: () => {
				engine.current?.reset()
			},
		}),
		[],
	)
	const unavailable = status !== "ready"
	async function fullscreen() {
		try {
			if (document.fullscreenElement) await document.exitFullscreen()
			else await section.current.requestFullscreen()
		} catch {
			/* Normal viewer remains usable if fullscreen is refused. */
		}
	}
	return (
		<section
			ref={section}
			className="sticky top-5 h-[650px] min-w-0 overflow-hidden border border-[#e8e5db] bg-[radial-gradient(ellipse_at_50%_40%,#fff_0,#f4f2ec_56%,#ebe9e1_100%)] data-[light=warm]:bg-[radial-gradient(ellipse_at_50%_40%,#fbf2e1,#e7dac5)] max-[760px]:relative max-[760px]:top-auto max-[760px]:h-[460px] min-[1450px]:h-[720px] [&:fullscreen]:h-screen [&:fullscreen]:w-screen"
			data-light={light}
			aria-label="Visualizador da joia em 3D"
		>
			<div className="pointer-events-none absolute top-[27px] right-7 left-[30px] z-2 flex items-start justify-between max-[760px]:top-5 max-[760px]:right-[17px] max-[1050px]:left-5 max-[760px]:[&_h2]:text-[27px]">
				<div>
					<span className="mt-0 mb-2.5 font-[550] text-[#737a6b] text-[10px] tracking-[1.6px]">
						{families[state.family].label}
					</span>
					<h2>{families[state.family].models[state.model]}</h2>
				</div>
				<span className="flex items-center gap-[7px] text-[#65735d] text-[10px] tracking-[1.1px] max-[1050px]:text-[9px] max-[760px]:text-[8px] [&_i]:size-[5px] [&_i]:rounded-full [&_i]:bg-[#798b6a]">
					<i />
					{status === "error"
						? "REFERÊNCIA FOTOGRÁFICA"
						: status === "loading"
							? "CARREGANDO 3D"
							: "3D INTERATIVO"}
				</span>
			</div>
			<div
				id="canvas-host"
				className="h-[calc(100%_-_40px)] w-full touch-none [&_canvas]:block [&_canvas]:size-full"
				ref={host}
				hidden={status === "error"}
				role="img"
				aria-label="Joia em 3D. Arraste para girar e use a roda do mouse para aproximar."
			/>
			{status === "error" && (
				<div
					id="fallback"
					className="absolute inset-x-20 top-[110px] bottom-[145px] text-center [&_img]:h-3/4 [&_img]:max-w-full [&_img]:object-contain [&_p]:text-[12px]"
				>
					<Image
						src={`/assets/reference-${families[state.family].photo}.jpg`}
						width={320}
						height={320}
						alt={`Referência: ${families[state.family].name}`}
					/>
					<p>
						O 3D não está disponível neste dispositivo. Esta fotografia é uma
						referência do acervo e não representa suas escolhas.
					</p>
				</div>
			)}
			<div className="absolute top-[43%] right-[22px] flex flex-col items-center gap-[7px] max-[760px]:top-[34%] max-[760px]:right-[13px] max-[760px]:gap-1.5 [&>span]:h-2 [&_button]:size-9 [&_button]:rounded-full [&_button]:border [&_button]:border-[#dcded4] [&_button]:bg-[#ffffff99] [&_button]:font-normal [&_button]:text-[22px] max-[760px]:[&_button]:size-[31px] max-[760px]:[&_button]:text-[20px]">
				<button
					type="button"
					disabled={unavailable}
					aria-label="Aproximar"
					onClick={() => engine.current.zoom(0.85)}
				>
					＋
				</button>
				<button
					type="button"
					disabled={unavailable}
					aria-label="Afastar"
					onClick={() => engine.current.zoom(1.15)}
				>
					−
				</button>
				<span />
				<button
					type="button"
					disabled={unavailable}
					aria-label="Restaurar ângulo"
					onClick={() => engine.current.reset()}
				>
					↺
				</button>
				<button
					type="button"
					disabled={unavailable}
					aria-label="Tela cheia"
					onClick={fullscreen}
				>
					⛶
				</button>
			</div>
			<div className="absolute right-[25px] bottom-[84px] left-[25px] flex items-center justify-between max-[1050px]:right-[15px] max-[760px]:bottom-[73px] max-[1050px]:left-[15px]">
				{/* biome-ignore lint/a11y/useSemanticElements: a <fieldset> carries UA borders and padding that would break the .light-switch pill */}
				<div
					className="flex gap-0.5 rounded-md bg-[#e7e7df] p-1 [&_button[aria-pressed=true]]:bg-white [&_button[aria-pressed=true]]:shadow-[0_1px_3px_#0000000a] [&_button]:rounded-sm [&_button]:px-[13px] [&_button]:py-[9px] [&_button]:text-[12px] max-[760px]:[&_button]:px-2.5 max-[760px]:[&_button]:py-2"
					role="group"
					aria-label="Iluminação"
				>
					{[
						["studio", "☼ Estúdio"],
						["warm", "◐ Ambiente"],
					].map(([value, label]) => (
						<button
							type="button"
							key={value}
							disabled={unavailable}
							aria-pressed={light === value}
							onClick={() => {
								setLight(value)
								engine.current.light(value)
							}}
						>
							{label}
						</button>
					))}
				</div>
				<button
					type="button"
					disabled={unavailable}
					className="flex items-center gap-[7px] text-[20px] aria-pressed:text-[#9b713c] [&_span]:text-[12px] max-[1050px]:[&_span]:hidden"
					aria-label="Giro automático"
					aria-pressed={rotate}
					onClick={() => {
						setRotate(!rotate)
						engine.current.rotate(!rotate)
					}}
				>
					↻ <span>Giro automático</span>
				</button>
			</div>
			<div className="absolute right-0 bottom-[57px] left-0 text-center text-[#929487] text-[12px] max-[760px]:bottom-[50px] max-[760px]:text-[11px] [&_span]:px-[7px]">
				Arraste para explorar <span>·</span> Role para aproximar
			</div>
			<div className="absolute right-0 bottom-0 left-0 flex justify-between border-[#ddded4] border-t bg-[#f0efe8bb] px-[23px] py-3.5 text-[#7b7f71] text-[11px] max-[1050px]:justify-center max-[1050px]:p-3.5 max-[760px]:px-3 max-[760px]:py-[13px] max-[1050px]:text-[10px] [&>span:first-child]:tracking-[1px] max-[1050px]:[&>span:first-child]:hidden">
				<span>ESTUDO DE DESIGN</span>
				<span>Representação ilustrativa · proporções aproximadas</span>
			</div>
		</section>
	)
}
