import Image from "next/image"
import Link from "next/link"
export default function Header() {
	return (
		<header className="topbar">
			<Link className="brand" href="/" aria-label="Lara Lobo Joias, início">
				<Image
					className="brand-symbol"
					src="/assets/brand-mark.png"
					width={43}
					height={43}
					alt=""
				/>
				<Image
					className="brand-wordmark"
					src="/assets/wordmark.png"
					width={169}
					height={48}
					alt="Lara Lobo Joias"
				/>
			</Link>
			<div className="header-center">
				ATELIÊ VIRTUAL <span>Uma joia, à sua maneira.</span>
			</div>
			<Link className="text-button" href="/pecas">
				Peças realizadas <span>↗</span>
			</Link>
		</header>
	)
}
