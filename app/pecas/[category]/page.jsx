import Link from 'next/link';
import { notFound } from 'next/navigation';
import { collections } from '@/lib/collections';
import PhotoGallery from '@/components/gallery/PhotoGallery';
export function generateStaticParams() { return Object.keys(collections).map(category => ({ category })); }
export default async function CollectionPage({ params }) { const { category } = await params; if (!Object.hasOwn(collections, category))
    notFound(); const collection = collections[category]; return <section className="portfolio"><Link className="gallery-back" href="/pecas">← Todas as categorias</Link><h1>{collection.name}</h1><p className="gallery-note">{collection.description}</p><PhotoGallery collection={collection}/><p className="gallery-disclaimer">Peças do acervo. As simulações 3D são estudos visuais e não réplicas destas fotografias.</p></section>; }
