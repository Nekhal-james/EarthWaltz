import type { Metadata } from 'next';
import { Inter, Newsreader, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
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
    <html lang="en" className={`${inter.variable} ${newsreader.variable} ${jetbrainsMono.variable}`} style={{ backgroundColor: '#0D0E0C', color: '#F4F3EF' }}>
      <body
        style={{ backgroundColor: '#0D0E0C', color: '#F4F3EF', minHeight: '100vh', margin: 0 }}
        className="bg-[#0D0E0C] text-[#F4F3EF] font-[family-name:var(--font-sans)] antialiased selection:bg-[#E54D2E]/30 selection:text-[#F4F3EF]"
      >
        {children}
      </body>
    </html>
  );
}
