import Image from "next/image"
import Link from "next/link"
export default function Header() {
	return (
		<header className="flex h-[100px] items-center justify-between border-[#a59b53] border-b-[3px] bg-[linear-gradient(115deg,#063d2a,#08603f_65%,#0d5036)] px-[4.4%] text-[#eee9dc] max-[760px]:h-[79px] max-[1050px]:px-[3%] max-[760px]:px-[5%]">
			<Link
				className="flex items-center gap-[15px] max-[760px]:gap-[9px]"
				href="/"
				aria-label="Lara Lobo Joias, início"
			>
				<Image
					className="size-[43px] object-contain max-[760px]:size-8 max-[400px]:size-6"
					src="/assets/brand-mark.png"
					width={43}
					height={43}
					alt=""
				/>
				<Image
					className="h-auto w-[169px] object-contain max-[760px]:w-[130px] max-[400px]:w-[100px]"
					src="/assets/wordmark.png"
					width={169}
					height={48}
					alt="Lara Lobo Joias"
				/>
			</Link>
			<div className="-ml-[50px] text-[12px] tracking-[2px] max-[1050px]:ml-0 max-[760px]:hidden [&_span]:mt-2 [&_span]:block [&_span]:text-[#c8dece] [&_span]:text-[12px] [&_span]:tracking-[.4px]">
				ATELIÊ VIRTUAL <span>Uma joia, à sua maneira.</span>
			</div>
			<nav aria-label="Navegação principal" className="flex shrink-0 items-center gap-6 max-[760px]:flex-col max-[760px]:items-end max-[760px]:gap-1">
			<Link href="/medidor-de-aneis" className="py-2 text-sm hover:underline max-[760px]:py-1">
				Medidor de anéis
			</Link>
			<Link
				className="border-[#8ebca1] border-b pt-2 pb-[9px] text-[13px] max-[760px]:text-[11px] [&_span]:ml-4 max-[760px]:[&_span]:ml-[7px]"
				href="/pecas"
			>
				Peças realizadas <span>↗</span>
			</Link>
			</nav>
		</header>
	)
}
