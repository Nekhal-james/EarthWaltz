import type { Metadata } from 'next';
import { Bricolage_Grotesque, Atkinson_Hyperlegible } from 'next/font/google';
import './globals.css';

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const atkinsonHyperlegible = Atkinson_Hyperlegible({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'EarthWaltz: Global SAR Observatory',
  description:
    'An interactive application that uses radar remote sensing data from the NASA-ISRO NISAR mission to track and visualize surface changes at locations around the world.',
  keywords: ['SAR', 'NISAR', 'NASA', 'ISRO', 'radar', 'remote sensing', 'earth observation'],
  other: {
    'si-acknowledgment':
      'Code architecture, TypeScript UI components, and Python DEM/SAR data-processing pipelines were developed with the assistance of Super Intelligence (SI) coding tools under human scientific and engineering direction. No NASA logos or branding elements were generated or modified.',
    repository: 'https://github.com/Nekhal-james/EarthWaltz',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bricolageGrotesque.variable} ${atkinsonHyperlegible.variable}`}
      style={{ backgroundColor: '#F6F5F0', color: '#121417' }}
    >
      <body
        style={{ backgroundColor: '#F6F5F0', color: '#121417', minHeight: '100vh', margin: 0 }}
        className={`${bricolageGrotesque.variable} ${atkinsonHyperlegible.variable} bg-[#F6F5F0] text-[#121417] font-sans antialiased selection:bg-[#0047AB]/20 selection:text-[#121417]`}
      >
        {children}
      </body>
    </html>
  );
}
