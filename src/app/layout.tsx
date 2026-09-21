import type { Metadata } from "next";
import { Lora, Poppins } from "next/font/google";
import "./globals.css";

const lora = Lora({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-lora" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-poppins" });

export const metadata: Metadata = {
  title: "BONJOUR IA — Quiz interactif",
  description: "Évaluations IA pour les collaborateurs des entreprises clientes de BONJOUR IA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${lora.variable} ${poppins.variable}`}>
      <body>{children}</body>
    </html>
  );
}
