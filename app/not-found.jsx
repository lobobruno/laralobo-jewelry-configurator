import Link from "next/link"
export default function NotFound() {
	return (
		<section className="flex items-center justify-between pt-8 pb-7 max-[760px]:pt-[25px] max-[760px]:pb-[17px] [&>p]:m-0 [&>p]:text-[14px] [&>p]:text-muted [&>p]:leading-[1.7] max-[760px]:[&>p]:hidden max-[1050px]:[&_h1]:text-[37px] max-[760px]:[&_h1]:text-[34px]">
			<div>
				<h1>Peça não encontrada</h1>
				<Link href="/pecas">Voltar ao acervo →</Link>
			</div>
		</section>
	)
}
