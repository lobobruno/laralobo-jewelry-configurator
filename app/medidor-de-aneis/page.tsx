import type { Metadata } from "next"
import Link from "next/link"
import RingSizer from "@/components/sizing/RingSizer"

export const metadata: Metadata = {
	title: "Medidor de anéis · Lara Lobo Joias",
	description:
		"Calibre sua tela e descubra uma estimativa do aro comparando um anel que já serve em você.",
}

export default function RingSizingPage() {
	return (
		<section className="mx-auto max-w-[1100px] pt-3 pb-8 sm:py-12">
			<Link href="/" className="inline-block py-2 text-sm hover:underline">
				← Voltar ao ateliê
			</Link>
			<p className="mt-3 mb-2 text-green text-sm tracking-[.16em] sm:mt-6">
				GUIA DE MEDIDAS
			</p>
			<h1 className="max-sm:text-[34px]">
				Seu anel, <em>na medida.</em>
			</h1>
			<p className="mb-5 max-w-[650px] text-[#5d685e] text-base leading-relaxed sm:mb-8">
				Separe uma régua e um anel que fica confortável no dedo desejado.
			</p>
			<RingSizer />
		</section>
	)
}
