import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ConfigurationProvider } from '@/components/atelier/ConfigurationProvider';
import './globals.css';
export const metadata: Metadata = { title: 'Ateliê virtual · Lara Lobo Joias', description: 'Experimente modelos, gemas e metais no ateliê virtual Lara Lobo Joias.', icons: { icon: '/assets/logo.png' } };
export default function RootLayout({ children }: {
    children: React.ReactNode;
}) { return <html lang="pt-BR"><body><ConfigurationProvider><Header /><main>{children}<Footer /></main></ConfigurationProvider></body></html>; }
