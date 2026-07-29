import { Compass, GitBranch, Leaf, ScrollText, Star } from "lucide-react";
import type { LucideProps } from "lucide-react";

type IconProps = LucideProps & { title?: string };

function withTitle(
  title: string | undefined,
  props: Omit<IconProps, "title">,
): LucideProps {
  return {
    "aria-hidden": title ? undefined : true,
    "aria-label": title,
    strokeWidth: 1.25,
    ...props,
  };
}

/** Hoja Lucide - marca de Imladris. */
export function LeafIcon({ title, ...props }: IconProps) {
  return <Leaf {...withTitle(title, props)} />;
}

export function StarIcon({ title, ...props }: IconProps) {
  return <Star {...withTitle(title, props)} />;
}

export function CompassIcon({ title, ...props }: IconProps) {
  return <Compass {...withTitle(title, props)} />;
}

export function ScrollIcon({ title, ...props }: IconProps) {
  return <ScrollText {...withTitle(title, props)} />;
}

export function BranchIcon({ title, ...props }: IconProps) {
  return <GitBranch {...withTitle(title, props)} />;
}
