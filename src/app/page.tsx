import { MistBackground } from "@/components/atmosphere/mist-background";
import { CouncilShell } from "@/components/council/council-shell";

export default function Home() {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <MistBackground />
      <CouncilShell />
    </main>
  );
}
