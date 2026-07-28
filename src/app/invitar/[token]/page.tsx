import { AcceptInviteForm } from "@/components/auth/accept-invite-form";
import { ReglamentoPreview } from "@/components/auth/reglamento-preview";
import { Logo } from "@/components/brand/logo";
import { isRitualSealed, RITUAL_SEAL_MESSAGE } from "@/lib/constants";
import {
  getInvitationByToken,
  invitationIsAcceptable,
} from "@/lib/invitations";
import { resolveReglamento } from "@/lib/reglamento";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  const invitation = await getInvitationByToken(token);

  if (!invitationIsAcceptable(invitation) || !invitation) {
    notFound();
  }

  const council = await prisma.council.findUnique({
    where: { id: invitation.councilId },
    select: { phase: true, name: true, reglamento: true },
  });

  if (isRitualSealed(council?.phase)) {
    return (
      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
        <Logo size="md" withWordmark className="mb-5" />
        <h1 className="font-display text-parchment text-3xl sm:text-4xl">
          {council?.name ?? invitation.council.name}
        </h1>
        <p className="font-body text-parchment/55 text-sm mt-6 max-w-[28ch]">
          {RITUAL_SEAL_MESSAGE}
        </p>
      </div>
    );
  }

  const reglamento = resolveReglamento(council?.reglamento);

  return (
    <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
      <Logo size="md" withWordmark className="mb-5" />
      <h1 className="font-display text-parchment text-3xl sm:text-4xl">
        {invitation.council.name}
      </h1>
      <p className="font-subtitle text-parchment/60 text-lg mt-3">
        {invitation.invitedBy.name}
      </p>
      <p className="font-body text-parchment/45 text-sm mt-4 max-w-[28ch]">
        Al entrar, formas parte del círculo y su reglamento.
      </p>
      <div className="mt-4 w-full flex justify-center">
        <ReglamentoPreview text={reglamento} />
      </div>
      <div className="mt-8 w-full max-w-sm">
        <AcceptInviteForm email={invitation.email} />
      </div>
    </div>
  );
}
