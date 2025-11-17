import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    default: "FIDE World Cup 2025 Stats - Comprehensive Tournament Analytics",
    template: "%s | FIDE World Cup 2025 Stats"
  },
  description: "Deep statistical analysis and insights for the FIDE World Cup 2025. Track game statistics, player performance, tactical patterns, Stockfish analysis, and awards across all rounds.",
  keywords: [
    "FIDE",
    "World Cup",
    "chess",
    "statistics",
    "tournament",
    "chess analytics",
    "game analysis",
    "stockfish",
    "chess tactics",
    "knockout tournament",
    "Goa 2025"
  ],
  authors: [{ name: "FIDE World Cup Stats" }],
  creator: "FIDE World Cup Stats",
  publisher: "FIDE World Cup Stats",
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
    url: 'https://fide-worldcup-stats.vercel.app',
    siteName: 'FIDE World Cup 2025 Stats',
    title: 'FIDE World Cup 2025 Stats - Tournament Analytics',
    description: 'Comprehensive statistical analysis for the FIDE World Cup 2025 in Goa, India',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FIDE World Cup 2025 Stats',
    description: 'Comprehensive statistical analysis for the FIDE World Cup 2025 in Goa, India',
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
