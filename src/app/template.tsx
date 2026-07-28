import { RouteTransition } from "@/components/atmosphere/route-transition";

/**
 * Remonta el slot en cada navegación — mismo velo que los cambios de fase.
 */
export default function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RouteTransition>{children}</RouteTransition>;
}
