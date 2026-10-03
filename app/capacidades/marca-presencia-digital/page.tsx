import type { Metadata } from "next";
import BrandPresencePage from "@/app/components/brand-presence-page";

export const metadata: Metadata = { title: "Marca y presencia digital | STARIX", description: "Construimos identidades y experiencias digitales que comunican con claridad el nivel de tu negocio." };
export default function BrandRoute() { return <BrandPresencePage />; }
