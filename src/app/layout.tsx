import type { Metadata, Viewport } from "next";
import { Cinzel, Cormorant_Garamond, Inter } from "next/font/google";
import { AppFrame } from "@/components/atmosphere/app-frame";
import { Providers } from "@/components/providers";
import { RegisterSW } from "@/components/pwa/register-sw";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "El Consejo de Elrond",
  description:
    "Imladris - la puerta de entrada a un lugar que solo cobra vida cuando el Consejo está por reunirse.",
  applicationName: "El Consejo de Elrond",
  metadataBase: new URL("https://imladris.online"),
  appleWebApp: {
    capable: true,
    title: "El Consejo",
    statusBarStyle: "black-translucent",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#20372E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${cinzel.variable} ${cormorant.variable} ${inter.variable}`}
    >
      <body className="font-body antialiased">
        <Providers>
          <RegisterSW />
          <AppFrame>{children}</AppFrame>
        </Providers>
      </body>
    </html>
  );
}
