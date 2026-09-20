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
			<body>
				{/* The provider sits above the router, so a piece being configured
                    survives a detour through the portfolio and back. */}
				<ConfigurationProvider>
					<Header />
					<main>
						{children}
						<Footer />
					</main>
				</ConfigurationProvider>
			</body>
		</html>
	)
}
