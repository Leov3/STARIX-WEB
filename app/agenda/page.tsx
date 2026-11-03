import type { Metadata } from "next";
import AgendaExperience from "@/app/components/agenda-experience";

export const metadata: Metadata = {
  title: "Agenda tu videollamada | STARIX",
  description: "Elige un horario para conversar con STARIX sobre tu proyecto.",
};

export default function AgendaPage() {
  return <AgendaExperience />;
}
