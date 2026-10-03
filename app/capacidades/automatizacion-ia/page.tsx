import type { Metadata } from "next";
import AutomationAiPage from "@/app/components/automation-ai-page";

export const metadata: Metadata = { title: "Automatización e IA | STARIX", description: "Automatizamos procesos e implementamos IA para que tu operación avance con menos trabajo manual." };
export default function AutomationRoute() { return <AutomationAiPage />; }
