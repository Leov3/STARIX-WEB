import type { Metadata } from "next";
import MeetingExperience from "@/app/components/meeting-experience";

export const metadata: Metadata = {
  title: "Tu videollamada | STARIX",
  description: "Un espacio para conversar sobre tu proyecto con STARIX.",
  robots: { index: false, follow: false },
};

export default function MeetingPage() {
  return <MeetingExperience />;
}
