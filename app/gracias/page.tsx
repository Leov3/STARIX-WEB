import type { Metadata } from "next";
import ThankYouExperience from "@/app/components/thank-you-experience";

export const metadata: Metadata = {
  title: "Gracias | STARIX",
  description: "Hemos recibido tu información.",
};

export default function ThankYouPage() {
  return <ThankYouExperience />;
}
