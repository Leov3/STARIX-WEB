import type { Metadata } from "next";
import IntegrationsPage from "@/app/components/integrations-page";

export const metadata: Metadata = { title: "Implementaciones e integraciones | STARIX", description: "Implementamos Odoo, ERP, CRM e integraciones que conectan la operación de tu negocio." };
export default function IntegrationsRoute() { return <IntegrationsPage />; }
