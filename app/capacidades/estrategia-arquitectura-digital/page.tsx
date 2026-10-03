import type { Metadata } from "next";
import StrategyArchitecturePage from "@/app/components/strategy-architecture-page";

export const metadata: Metadata = { title: "Estrategia y arquitectura digital | STARIX", description: "Definimos la estrategia y arquitectura digital antes de elegir una herramienta o construir una solución." };
export default function StrategyRoute() { return <StrategyArchitecturePage />; }
