import type { Metadata } from "next";
import ThankYouExperience from "@/app/components/thank-you-experience";

export const metadata: Metadata = {
  title: "Gracias | STARIX",
  description: "Continúa con tu diagnóstico personalizado de STARIX.",
};

export default function ThankYouPage() {
  return <ThankYouExperience />;
}
