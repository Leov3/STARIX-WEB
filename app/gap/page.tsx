import type { Metadata } from "next";
import GapExperience from "@/app/components/gap-experience";

export const metadata: Metadata = {
  title: "Diagnóstico | STARIX",
  description: "Diagnóstico inicial para preparar tu proyecto con STARIX.",
};

export default function GapPage() {
  return <GapExperience />;
}
