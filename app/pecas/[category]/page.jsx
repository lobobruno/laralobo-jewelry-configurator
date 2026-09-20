import Link from "next/link"
import { notFound } from "next/navigation"
import GalleryDisclaimer from "@/components/gallery/GalleryDisclaimer"
import PhotoGallery from "@/components/gallery/PhotoGallery"
import { collections } from "@/lib/collections"

// One prerendered page per collection; any other category is a 404.
export function generateStaticParams() {
	return Object.keys(collections).map((category) => ({ category }))
}

export default async function CollectionPage({ params }) {
	const { category } = await params
	if (!Object.hasOwn(collections, category)) notFound()
	const collection = collections[category]

	return (
		<section className="mx-auto max-w-[1000px] pt-8 [&_h1]:my-5">
			<Link className="py-2.5 text-[14px]" href="/pecas">
				← Todas as categorias
			</Link>
			<h1>{collection.name}</h1>
			<p className="mt-0 mb-6 max-w-[700px] text-[#747d6c] text-[15px] leading-[1.6] max-[650px]:text-[14px] [&_span]:whitespace-nowrap">
				{collection.description}
			</p>
			<PhotoGallery collection={collection} />
			<GalleryDisclaimer />
		</section>
	)
}
