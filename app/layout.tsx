import type { Metadata } from "next"
import { ConfigurationProvider } from "@/components/atelier/ConfigurationProvider"
import Footer from "@/components/layout/Footer"
import Header from "@/components/layout/Header"
import "./globals.css"

export const metadata: Metadata = {
	title: "Ateliê virtual · Lara Lobo Joias",
	description:
		"Experimente modelos, gemas e metais no ateliê virtual Lara Lobo Joias.",
	icons: { icon: "/assets/logo.png" },
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="pt-BR">
			<body className="bg-[#fcfbf8] font-sans text-[#303c32] [font-synthesis:none]">
				{/* The provider sits above the router, so a piece being configured
                    survives a detour through the portfolio and back. */}
				<ConfigurationProvider>
					<Header />
					<main className="mx-auto max-w-[1700px] px-[4.4%] max-[1050px]:px-[3%] max-[760px]:px-[5%]">
						{children}
						<Footer />
					</main>
				</ConfigurationProvider>
			</body>
		</html>
	)
}
