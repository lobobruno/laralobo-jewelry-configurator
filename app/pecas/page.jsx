import Image from "next/image"
import Link from "next/link"
import GalleryDisclaimer from "@/components/gallery/GalleryDisclaimer"
import { collections, photoSource } from "@/lib/collections"

export const metadata = { title: "Peças realizadas · Lara Lobo" }

export default function Portfolio() {
	return (
		<section className="portfolio">
			<Link className="gallery-back" href="/">
				← Voltar ao ateliê
			</Link>
			<h1>Peças realizadas</h1>
			<p className="gallery-note">
				Uma seleção do acervo Lara Lobo. Escolha uma categoria para descobrir as
				peças.
			</p>
			<div className="gallery-categories">
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
		<Link className="collection-card" href={`/pecas/${id}`}>
			<Image src={photoSource(cover)} alt={coverAlt} width={320} height={320} />
			<span className="collection-caption">
				<span>
					<strong>{collection.name}</strong>
					<small>{collection.photos.length} fotos selecionadas</small>
				</span>
				<span>↗</span>
			</span>
		</Link>
	)
}
