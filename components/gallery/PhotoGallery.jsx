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
			<div className="grid grid-cols-3 gap-x-[18px] gap-y-[22px] max-[340px]:grid-cols-1 max-[650px]:grid-cols-2 max-[650px]:gap-x-2.5 max-[650px]:gap-y-3.5">
				{collection.photos.map(([id, name, alt], i) => (
					<button
						type="button"
						key={id}
						className="min-w-0 overflow-hidden rounded-sm border border-[#e1e3db] bg-white p-0 text-left hover:border-[#60816a] [&>span]:flex [&>span]:items-center [&>span]:justify-between [&>span]:gap-2 [&>span]:px-3 [&>span]:py-[13px] [&>span]:text-[14px] [&>span]:leading-[1.4] max-[650px]:[&>span]:px-2 max-[650px]:[&>span]:py-2.5 max-[650px]:[&>span]:text-[13px] [&_i]:text-[#78866d] [&_i]:text-[20px] [&_i]:not-italic max-[650px]:[&_i]:hidden [&_img]:block [&_img]:aspect-square [&_img]:h-auto [&_img]:w-full [&_img]:object-contain"
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
				className="max-h-[90dvh] w-[min(640px,94vw)] overscroll-contain rounded-lg border border-[#ddd9cf] bg-[#fcfbf8] px-8 py-7 text-green backdrop:bg-[#182319aa] backdrop:backdrop-blur-[4px] max-[650px]:max-h-[92dvh] max-[650px]:w-[94vw] max-[650px]:p-[18px] [&_button:focus-visible]:outline-[#476e50] [&_button:focus-visible]:outline-offset-[3px]"
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
				<div className="mb-1.5 flex min-h-[38px] items-center justify-between">
					<button
						type="button"
						className="py-2.5 text-[14px]"
						onClick={() => dialog.current.close()}
					>
						← Voltar às fotos
					</button>
					<button
						type="button"
						id="close-gallery"
						className="size-10 rounded-full text-[30px] leading-none hover:bg-[#e8ede6]"
						aria-label="Fechar galeria"
						onClick={() => dialog.current.close()}
					>
						×
					</button>
				</div>
				<figure className="m-0 [&_h3]:mt-[18px] [&_h3]:mb-2 [&_h3]:font-medium [&_h3]:text-[20px] [&_p]:m-0 [&_p]:text-[#727a6a] [&_p]:text-[14px] [&_p]:leading-[1.6]">
					<div className="flex justify-center overflow-hidden rounded-sm bg-[#efeee8] [&>img]:aspect-square [&>img]:h-auto [&>img]:w-[min(100%,420px)] [&>img]:object-contain">
						<Image src={photoSource(id)} alt={alt} width={420} height={420} />
					</div>
					<figcaption>
						<h3>{name}</h3>
						<p>{alt}</p>
					</figcaption>
				</figure>
				<div className="mt-[22px] flex items-center justify-between gap-3 border-[#dfe2d7] border-t pt-4 [&>span]:text-[#738168] [&>span]:text-[14px] [&_button]:min-h-11 [&_button]:rounded-sm [&_button]:border [&_button]:border-[#d4dccc] [&_button]:p-3 [&_button]:text-[14px] max-[650px]:[&_button]:p-2.5">
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
