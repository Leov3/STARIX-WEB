import type { Metadata } from "next";
import GapExperience from "@/app/components/gap-experience";

export const metadata: Metadata = {
  title: "Diagnóstico | STARIX",
  description: "Un diagnóstico breve para preparar una conversación útil sobre tu proyecto.",
};

export default function DiagnosticPage() {
  return <GapExperience />;
}
