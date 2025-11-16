import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    default: "Lichess 4545 Stats - Comprehensive Chess League Analytics",
    template: "%s | Lichess 4545 Stats"
  },
  description: "Deep statistical analysis and insights for the Lichess 4545 Team League. Track game statistics, player performance, tactical patterns, and team awards across all seasons and rounds.",
  keywords: [
    "lichess",
    "4545",
    "chess",
    "statistics",
    "team league",
    "chess analytics",
    "game analysis",
    "stockfish",
    "chess tactics",
    "tournament stats"
  ],
  authors: [{ name: "Lichess 4545 Community" }],
  creator: "Lichess 4545 Stats",
  publisher: "Lichess 4545 Stats",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://lichess4545-stats.vercel.app',
    siteName: 'Lichess 4545 Stats',
    title: 'Lichess 4545 Stats - Chess League Analytics',
    description: 'Comprehensive statistical analysis for the Lichess 4545 Team League',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lichess 4545 Stats',
    description: 'Comprehensive statistical analysis for the Lichess 4545 Team League',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full font-syne antialiased bg-background text-foreground">
        <div className="min-h-full flex flex-col">
          <Navigation />
          <main className="flex-grow pb-10">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
