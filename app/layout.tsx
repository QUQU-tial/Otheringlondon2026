import type { Metadata } from "next";
import { Caveat, Inter, Poppins } from "next/font/google";
import "./globals.css";
import RouteGuard from "./components/RouteGuard";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Othering · SPIRA9",
  description: "Art Takes Place",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} ${caveat.variable} antialiased`}
      >
        <RouteGuard>
          {children}
        </RouteGuard>
      </body>
    </html>
  );
}
