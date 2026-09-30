import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import "@/registry/foundation.css";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const newsreader = Newsreader({ variable: "--font-serif", subsets: ["latin"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "Undertone",
  description: "See how your message will land before you send it.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-accent="blue" className={`${inter.variable} ${newsreader.variable}`}>
      <body>{children}</body>
    </html>
  );
}
