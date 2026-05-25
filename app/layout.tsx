import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Ruta Segura Santa Cruz',
  description:
    'Plataforma geoespacial para análisis de rutas urbanas con detección de baches y estimación de consumo de combustible',
  keywords: ['rutas', 'baches', 'Santa Cruz', 'combustible', 'mapa'],
  authors: [{ name: 'Ruta Segura Santa Cruz' }],
  openGraph: {
    title: 'Ruta Segura Santa Cruz',
    description:
      'Plataforma geoespacial para análisis de rutas urbanas con detección de baches y estimación de consumo de combustible',
    type: 'website',
    locale: 'es_BO',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
