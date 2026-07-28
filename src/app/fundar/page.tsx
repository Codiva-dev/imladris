import { BootstrapOrganizerForm } from "@/components/auth/bootstrap-organizer-form";
import { Logo } from "@/components/brand/logo";

/**
 * Una sola vez: el primer usuario funda el Consejo como organizador.
 * Después, el acceso es solo por invitación.
 */
export default function FundarPage() {
  return (
    <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
      <Logo size="md" withWordmark className="mb-5" />
      <h1 className="font-display text-parchment text-3xl sm:text-4xl leading-tight max-w-[14ch]">
        Abrir el Consejo
      </h1>
      <BootstrapOrganizerForm />
    </div>
  );
}
