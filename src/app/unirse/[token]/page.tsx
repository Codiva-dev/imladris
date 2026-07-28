import { Logo } from "@/components/brand/logo";
import { JoinCouncilForm } from "@/components/auth/join-council-form";
import { getCouncilByJoinToken } from "@/lib/invitations";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function JoinPage({ params }: Props) {
  const { token } = await params;
  const council = await getCouncilByJoinToken(token);

  if (!council) {
    notFound();
  }

  return (
    <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
      <Logo size="md" withWordmark className="mb-5" />
      <h1 className="font-display text-parchment text-3xl sm:text-4xl max-w-[14ch]">
        {council.name}
      </h1>
      <div className="mt-10 w-full max-w-sm">
        <JoinCouncilForm token={token} />
      </div>
    </div>
  );
}
