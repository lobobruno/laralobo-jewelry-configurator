"use client"
import Image from "next/image"
import { useRef, useState } from "react"
import { photoSource } from "@/lib/collections"
export default function PhotoGallery({ collection }) {
	const [current, setCurrent] = useState(0)
	const dialog = useRef(null),
		opener = useRef(null)
	const [id, name, alt] = collection.photos[current]
	const next = (direction) =>
		setCurrent(
			(value) =>
				(value + direction + collection.photos.length) %
				collection.photos.length,
		)
	return (
		<>
			<div className="gallery-photo-grid">
				{collection.photos.map(([id, name, alt], i) => (
					<button
						type="button"
						key={id}
						className="gallery-photo"
						aria-label={`Ampliar: ${name}`}
						onClick={(e) => {
							opener.current = e.currentTarget
							setCurrent(i)
							dialog.current.showModal()
						}}
					>
						<Image src={photoSource(id)} alt={alt} width={320} height={320} />
						<span>
							{name}
							<i>＋</i>
						</span>
					</button>
				))}
			</div>
			<dialog
				id="gallery"
				className="is-detail"
				ref={dialog}
				aria-label="Fotografia do acervo"
				onClose={() => opener.current?.focus()}
				onKeyDown={(e) => {
					if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
						e.preventDefault()
						next(e.key === "ArrowLeft" ? -1 : 1)
					}
				}}
				onClick={(e) => {
					if (e.target === dialog.current) {
						const r = dialog.current.getBoundingClientRect()
						if (
							e.clientX < r.left ||
							e.clientX > r.right ||
							e.clientY < r.top ||
							e.clientY > r.bottom
						)
							dialog.current.close()
					}
				}}
			>
				<div className="gallery-topline">
					<button
						type="button"
						className="gallery-back"
						onClick={() => dialog.current.close()}
					>
						← Voltar às fotos
					</button>
					<button
						type="button"
						id="close-gallery"
						aria-label="Fechar galeria"
						onClick={() => dialog.current.close()}
					>
						×
					</button>
				</div>
				<figure className="gallery-detail">
					<div className="gallery-image-stage">
						<Image src={photoSource(id)} alt={alt} width={420} height={420} />
					</div>
					<figcaption>
						<h3>{name}</h3>
						<p>{alt}</p>
					</figcaption>
				</figure>
				<div className="gallery-pagination">
					<button
						type="button"
						aria-label="Foto anterior"
						onClick={() => next(-1)}
					>
						← Anterior
					</button>
					<span aria-live="polite">
						{current + 1} de {collection.photos.length}
					</span>
					<button
						type="button"
						aria-label="Próxima foto"
						onClick={() => next(1)}
					>
						Próxima →
					</button>
				</div>
			</dialog>
		</>
	)
}
