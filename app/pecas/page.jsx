import Image from "next/image"
import Link from "next/link"
import GalleryDisclaimer from "@/components/gallery/GalleryDisclaimer"
import { collections, photoSource } from "@/lib/collections"

export const metadata = { title: "Peças realizadas · Lara Lobo" }

export default function Portfolio() {
	return (
		<section className="mx-auto max-w-[1000px] pt-8 [&_h1]:my-5">
			<Link className="py-2.5 text-[14px]" href="/">
				← Voltar ao ateliê
			</Link>
			<h1>Peças realizadas</h1>
			<p className="mt-0 mb-6 max-w-[700px] text-[#747d6c] text-[15px] leading-[1.6] max-[650px]:text-[14px] [&_span]:whitespace-nowrap">
				Uma seleção do acervo Lara Lobo. Escolha uma categoria para descobrir as
				peças.
			</p>
			<div className="mt-6 grid grid-cols-2 gap-6 max-[340px]:grid-cols-1 max-[650px]:gap-3.5">
				{Object.entries(collections).map(([id, collection]) => (
					<CollectionCard key={id} id={id} collection={collection} />
				))}
			</div>
			<GalleryDisclaimer />
		</section>
	)
}

/** One category tile, fronted by the first photo of the collection. */
function CollectionCard({ id, collection }) {
	const [cover, , coverAlt] = collection.photos[0]
	return (
		<Link
			className="overflow-hidden rounded-[5px] border border-[#dee1d7] bg-white p-0 text-left transition-[transform,border-color] duration-200 hover:-translate-y-[3px] hover:border-[#658571] [&>img]:block [&>img]:aspect-square [&>img]:h-auto [&>img]:w-full [&>img]:object-contain"
			href={`/pecas/${id}`}
		>
			<Image src={photoSource(cover)} alt={coverAlt} width={320} height={320} />
			<span className="flex items-center justify-between gap-2.5 px-[18px] py-[17px] max-[650px]:px-[9px] max-[650px]:py-3 [&>span:last-child]:text-[23px] max-[650px]:[&>span:last-child]:hidden [&_small]:mt-[5px] [&_small]:block [&_small]:text-[#788370] [&_small]:text-[13px] max-[650px]:[&_small]:text-[12px] [&_strong]:block [&_strong]:font-medium [&_strong]:text-[17px] max-[650px]:[&_strong]:text-[14px]">
				<span>
					<strong>{collection.name}</strong>
					<small>{collection.photos.length} fotos selecionadas</small>
				</span>
				<span>↗</span>
			</span>
		</Link>
	)
}
