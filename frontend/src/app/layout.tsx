import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import * as SWP from "@/other/swp"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sticky Web Platform',
  description: 'Default Sticky Web Plaform index page',
  viewport: "width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no",
  robots: {
    index: true,
    follow: true
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon/favicon-16x16.png",
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: `/favicon/site.webmanifest`,
  other: {
    "mask-icon": "/favicon/safari-pinned-tab.svg",
    "msapplication-TileColor": "#ffffff",
    "msapplication-TileImage": "/favicon/mstile-150x150.png",
    "msapplication-config": "/favicon/browserconfig.xml",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": "yes",
  },
}


// <meta name="mobile-web-app-capable" content="yes" />
// <meta name="apple-touch-fullscreen" content="yes" />
// <meta name="apple-mobile-web-app-title" content="City Event Map" />
// <meta name="apple-mobile-web-app-capable" content="yes" />
// <meta name="apple-mobile-web-app-status-bar-style" content="default" />

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  fetch("/api/companies/")
      .then((response) => response.json())
      .then((data) => {
        console.log("Got companies: ", data);
        setCompanies(data.value.data);
      })
      .catch((error) => {
        console.error("Error fetching companies", error);
      });

  const stickyThings = await kv.hgetall('notes')
  let notesArray: Note[] = notes
    ? (Object.values(notes) as Note[]).sort(
        (a, b) => Number(a.id) - Number(b.id)
      )
    : []

  const html = (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );

  return html;
}
