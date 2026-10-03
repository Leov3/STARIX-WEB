import type { Metadata } from "next";
import { Inter, Michroma, Space_Grotesk } from "next/font/google";
import { MotionConfig } from "motion/react";
import AppShell from "@/app/components/app-shell";
import "./globals.css";

const space = Space_Grotesk({ variable: "--font-space", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const michroma = Michroma({ variable: "--font-michroma", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "STARIX — Sistemas digitales para un futuro real",
  description: "Tecnología, creatividad y negocio convertidos en sistemas que conectan, automatizan y hacen avanzar empresas.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${space.variable} ${inter.variable} ${michroma.variable}`}>
      <body>
        <MotionConfig reducedMotion="never"><AppShell>{children}</AppShell></MotionConfig>
      </body>
    </html>
  );
}
