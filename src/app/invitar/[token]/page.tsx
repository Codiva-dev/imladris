import { AcceptInviteForm } from "@/components/auth/accept-invite-form";
import { Logo } from "@/components/brand/logo";
import {
  getInvitationByToken,
  invitationIsAcceptable,
} from "@/lib/invitations";
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

  return (
    <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
      <Logo size="md" withWordmark className="mb-5" />
      <h1 className="font-display text-parchment text-3xl sm:text-4xl">
        {invitation.council.name}
      </h1>
      <p className="font-subtitle text-parchment/60 text-lg mt-3">
        {invitation.invitedBy.name}
      </p>
      <div className="mt-10 w-full max-w-sm">
        <AcceptInviteForm email={invitation.email} />
      </div>
    </div>
  );
}
