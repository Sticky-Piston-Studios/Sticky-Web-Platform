import type { Metadata, Viewport } from 'next'
import {  Inter, Montserrat, Poppins, Comfortaa } from 'next/font/google';

// --- Font setup ---

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

// Declare fonts using React fonts and expose them for tailwind definitions
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ['latin']
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ['100', '200', '300', '400', '500', '600'],
  subsets: ['latin']
});

const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ['latin']
});

// --- Metadata setup ---
export const viewport: Viewport = {
  themeColor: '#181818',
  colorScheme: 'dark'
}

export const metadata: Metadata = {
  title: 'Sticky Web Platform Frontend',
  description: 'Sample frontend app of Sticky Web Platform',
  keywords: ['Sticky', 'Web', 'Platform', 'Frontend', 'App'],
  manifest: '/favicons/site.webmanifest',
  icons: {
    shortcut: ['/favicons/favicon.ico'],
    icon: [
      { url: '/favicons/favicon.ico' },
      { url: '/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    other: [
      { rel: 'apple-touch-icon', url: '/favicons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { rel: 'mask-icon', url: '/favicons/safari-pinned-tab.svg', color: '#ff1dbb' },
    ],
  },
  other: {
    'msapplication-TileColor': '#00aba9',
    'msapplication-TileImage': '/mstile-150x150.png',
    'msapplication-config': '/favicons/browserconfig.xml',
    'msapplication-square150x150logo': '/mstile-150x150.png',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black',
    'apple-mobile-web-app-title': 'Sticky Web Platform Frontend',
  }
}

// --- Root ---

export default function RootLayout({
  children,
}:{
  children: React.ReactNode
}) {

  return (
    <html lang='en' className='scroll-smooth'>
      <body 
        // Fonts declaration
        className={`font-poppins bg-black ${inter.variable} ${montserrat.variable} ${poppins.variable} ${comfortaa.variable}`} 
        // Suppress "extra attributes from the server" error caused by some browser extensions (grammarly, ColorZilla, etc) altering final html code
        suppressHydrationWarning={true}
      > 
        {children}
      </body>
    </html>
  );
}
