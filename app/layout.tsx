import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
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
    <html lang="en" className={plusJakartaSans.variable} style={{ backgroundColor: '#FFFFFF', color: '#0F172A' }}>
      <body
        style={{ backgroundColor: '#FFFFFF', color: '#0F172A', minHeight: '100vh', margin: 0 }}
        className="bg-[#FFFFFF] text-[#0F172A] font-[family-name:var(--font-sans)] antialiased selection:bg-[#2563EB]/20 selection:text-[#0F172A]"
      >
        {children}
      </body>
    </html>
  );
}
