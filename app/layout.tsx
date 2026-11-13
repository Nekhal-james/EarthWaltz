import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'EarthWaltz: Global SAR Observatory',
  description:
    'An interactive application that uses radar remote sensing data from the NASA-ISRO NISAR mission to track and visualize surface changes at locations around the world.',
  keywords: ['SAR', 'NISAR', 'NASA', 'ISRO', 'radar', 'remote sensing', 'earth observation'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#090A0F] text-[#F1F5F9] font-[family-name:var(--font-inter)] antialiased">
        {children}
      </body>
    </html>
  );
}
