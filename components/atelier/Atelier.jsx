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
		<section className="viewer viewer-loading">Preparando seu ateliê…</section>
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
			<section className="intro">
				<div>
					<p className="eyebrow">O SEU ATELIÊ</p>
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
			<nav className="families" aria-label="Família da joia">
				{Object.entries(families).map(([id, f]) => (
					<button
						type="button"
						key={id}
						className={`family ${state.family === id ? "active" : ""}`}
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
			<div className="workspace">
				<Viewer state={state} apiRef={viewer} onStatus={setStatus} />
				<aside className="configurator" aria-label="Personalize sua joia">
					<div className="config-title">
						<span className="eyebrow">CADA DETALHE É SEU</span>
						<button
							type="button"
							className="text-button"
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
					<div className="selection-summary">
						<span>SUA COMBINAÇÃO</span>
						<p aria-live="polite">{summary(state)}</p>
					</div>
					<button
						type="button"
						className="primary-button"
						disabled={status !== "ready" || saving}
						onClick={save}
					>
						{saving ? "Preparando imagem…" : "Salvar imagem da joia"}{" "}
						<span>↓</span>
					</button>
					<p className="save-note">
						Uma lembrança da sua criação, com a assinatura Lara Lobo.
					</p>
					<p role="status" className="save-note">
						{message}
					</p>
				</aside>
			</div>
		</>
	)
}
