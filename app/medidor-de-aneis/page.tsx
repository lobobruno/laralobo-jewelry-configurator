import type { Metadata } from 'next';
import Link from 'next/link';
import RingSizer from '@/components/sizing/RingSizer';

export const metadata: Metadata = {
    title: 'Medidor de anéis · Lara Lobo Joias',
    description: 'Calibre sua tela e descubra uma estimativa do aro comparando um anel que já serve em você.',
};

export default function RingSizingPage() {
    return <section className="mx-auto max-w-[1100px] py-8 sm:py-12">
        <Link href="/" className="inline-block py-2 text-sm hover:underline">← Voltar ao ateliê</Link>
        <p className="mb-3 mt-6 text-sm tracking-[.16em] text-green">GUIA DE MEDIDAS</p>
        <h1>Seu anel, <em>na medida.</em></h1>
        <p className="mb-8 max-w-[650px] text-base leading-relaxed text-[#5d685e]">Use um anel que já fica confortável no dedo desejado. Uma régua e dois passos ajudam você a descobrir o aro.</p>
        <RingSizer />
    </section>;
}
