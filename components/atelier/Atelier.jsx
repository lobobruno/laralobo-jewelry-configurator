"use client"
import dynamic from "next/dynamic"
import { useRef, useState } from "react"
import { families, initial, summary } from "@/lib/catalog"
import { useConfiguration } from "./ConfigurationProvider"
import Controls from "./Controls"
import Icon from "./Icon"

const Viewer = dynamic(() => import("./Viewer"), {
	ssr: false,
	loading: () => (
		<section className="sticky top-5 grid h-[610px]! h-[650px] min-w-0 place-items-center overflow-hidden border border-[#e8e5db] bg-[radial-gradient(ellipse_at_50%_40%,#fff_0,#f4f2ec_56%,#ebe9e1_100%)] text-muted data-[light=warm]:bg-[radial-gradient(ellipse_at_50%_40%,#fbf2e1,#e7dac5)] max-[760px]:relative max-[760px]:top-auto max-[760px]:h-[460px] min-[1450px]:h-[720px] [&:fullscreen]:h-screen [&:fullscreen]:w-screen">
			Preparando seu ateliê…
		</section>
	),
})
export default function Atelier() {
	const [state, setState] = useConfiguration()
	const [status, setStatus] = useState("loading"),
		[saving, setSaving] = useState(false),
		[message, setMessage] = useState("")
	const viewer = useRef(null)
	function choose(key, value) {
		setState((prev) => {
			const next = { ...prev, [key]: value }
			if (key === "model" && value === "duo") next.metal = "duo"
			if (key === "metal" && prev.model === "duo" && value !== "duo")
				next.model = "classic"
			return next
		})
	}
	async function save() {
		setSaving(true)
		try {
			await viewer.current.save()
			setMessage("Imagem da sua combinação pronta para salvar.")
		} catch {
			setMessage("Não foi possível salvar agora. Tente novamente.")
		} finally {
			setSaving(false)
		}
	}
	return (
		<>
			<section className="flex items-center justify-between pt-8 pb-7 max-[760px]:pt-[25px] max-[760px]:pb-[17px] [&>p]:m-0 [&>p]:text-[14px] [&>p]:text-muted [&>p]:leading-[1.7] max-[760px]:[&>p]:hidden max-[1050px]:[&_h1]:text-[37px] max-[760px]:[&_h1]:text-[34px]">
				<div>
					<p className="mt-0 mb-2.5 font-[550] text-[#737a6b] text-[11px] tracking-[2px] max-[760px]:text-[10px]">
						O SEU ATELIÊ
					</p>
					<h1>
						Encontre a sua <em>combinação.</em>
					</h1>
				</div>
				<p>
					Escolha os detalhes.
					<br />
					Veja a sua joia ganhar forma.
				</p>
			</section>
			<nav
				className="mb-[22px] flex gap-8 border-line border-b max-[760px]:mb-[17px] max-[1050px]:gap-6 max-[760px]:gap-[23px] max-[760px]:overflow-x-auto max-[760px]:whitespace-nowrap"
				aria-label="Família da joia"
			>
				{Object.entries(families).map(([id, f]) => (
					<button
						type="button"
						key={id}
						className="-mb-px flex items-center gap-2.5 border-transparent border-b-2 pt-3.5 pb-[17px] text-[#74786f] text-[14px] aria-pressed:border-green aria-pressed:font-semibold aria-pressed:text-green max-[760px]:gap-1.5 max-[760px]:py-3 max-[760px]:text-[12px] [&_svg]:size-6 [&_svg]:fill-none [&_svg]:stroke-[1.15] [&_svg]:stroke-current max-[760px]:[&_svg]:w-[19px]"
						aria-pressed={state.family === id}
						onClick={() =>
							setState({
								...initial,
								family: id,
								model: Object.keys(f.models)[0],
							})
						}
					>
						<Icon name={id} />
						{f.name}
					</button>
				))}
			</nav>
			<div className="grid grid-cols-[minmax(0,1fr)_370px] items-start gap-9 max-[1050px]:grid-cols-[minmax(0,1fr)_320px] max-[760px]:grid-cols-1 max-[1050px]:gap-[22px] min-[1450px]:grid-cols-[minmax(0,1fr)_400px]">
				<Viewer state={state} apiRef={viewer} onStatus={setStatus} />
				<aside
					className="py-0.5 max-[760px]:pt-0 max-[760px]:pb-[5px]"
					aria-label="Personalize sua joia"
				>
					<div className="mb-[9px] flex items-center justify-between max-[760px]:mb-0 [&>button]:text-[#828477] [&>button]:text-[12px] [&>span]:m-0 [&>span]:text-[12px] [&>span]:tracking-[1.5px] max-[760px]:[&>span]:text-[11px]">
						<span className="mt-0 mb-2.5 font-[550] text-[#737a6b] text-[11px] tracking-[2px] max-[760px]:text-[10px]">
							CADA DETALHE É SEU
						</span>
						<button
							type="button"
							className="py-2 text-[13px] [&_span]:ml-4"
							onClick={() => {
								setState({ ...initial })
								viewer.current?.reset()
								setMessage("Sua criação voltou ao início.")
							}}
						>
							Recomeçar ↺
						</button>
					</div>
					<Controls state={state} choose={choose} />
					<div className="pt-5 pb-[13px] [&>span]:text-[#8a8d7f] [&>span]:text-[11px] [&>span]:tracking-[1.7px] [&_p]:mt-2 [&_p]:mb-0 [&_p]:text-[#626b59] [&_p]:text-[12px] [&_p]:leading-[1.65]">
						<span>SUA COMBINAÇÃO</span>
						<p aria-live="polite">{summary(state)}</p>
					</div>
					<button
						type="button"
						className="flex w-full items-center justify-between rounded-[3px] bg-green px-[18px] py-4 text-[14px] text-white transition-colors duration-200 hover:bg-[#4a5947] [&_span]:text-[19px]"
						disabled={status !== "ready" || saving}
						onClick={save}
					>
						{saving ? "Preparando imagem…" : "Salvar imagem da joia"}{" "}
						<span>↓</span>
					</button>
					<p className="my-2.5 text-center text-[#898d80] text-[12px] leading-[1.6]">
						Uma lembrança da sua criação, com a assinatura Lara Lobo.
					</p>
					<p
						role="status"
						className="my-2.5 text-center text-[#898d80] text-[12px] leading-[1.6]"
					>
						{message}
					</p>
				</aside>
			</div>
		</>
	)
}
