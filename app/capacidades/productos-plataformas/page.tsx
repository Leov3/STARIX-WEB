import type { Metadata } from "next";
import ProductsPlatformsPage from "@/app/components/products-platforms-page";

export const metadata: Metadata = {
  title: "Productos y plataformas digitales | STARIX",
  description: "Diseñamos y desarrollamos sitios, plataformas, aplicaciones y productos digitales conectados con los objetivos y sistemas de tu negocio.",
};

export default function ProductsPlatformsRoute() {
  return <ProductsPlatformsPage />;
}
