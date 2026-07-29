import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

function baseProps(title: string | undefined, props: Omit<IconProps, "title">) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.25,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": title ? undefined : true,
    "aria-label": title,
    ...props,
  };
}

/** Hoja - marca de Imladris. */
export function LeafIcon({ title, ...props }: IconProps) {
  return (
    <svg {...baseProps(title, props)}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

export function StarIcon({ title, ...props }: IconProps) {
  return (
    <svg {...baseProps(title, props)}>
      <path d="M12 2.5 13.9 8.4 20 9.1 15.5 13.4 16.8 19.5 12 16.6 7.2 19.5 8.5 13.4 4 9.1 10.1 8.4 12 2.5Z" />
    </svg>
  );
}

export function CompassIcon({ title, ...props }: IconProps) {
  return (
    <svg {...baseProps(title, props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2.2 6.3-6.3 2.2 2.2-6.3Z" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ScrollIcon({ title, ...props }: IconProps) {
  return (
    <svg {...baseProps(title, props)}>
      <path d="M8 4h9a2 2 0 0 1 2 2v12a1.5 1.5 0 0 1-1.5 1.5H8" />
      <path d="M8 4a2 2 0 0 0-2 2v13.5A1.5 1.5 0 0 0 7.5 21H8" />
      <path d="M10 9h6M10 13h6M10 17h3" />
    </svg>
  );
}

export function BranchIcon({ title, ...props }: IconProps) {
  return (
    <svg {...baseProps(title, props)}>
      <path d="M6 3v12" />
      <circle cx="6" cy="18" r="2.5" />
      <path d="M6 8c4 0 6 2 8 6" />
      <circle cx="16" cy="16" r="2.5" />
      <path d="M6 5c3 0 5-1.5 7-3" />
      <circle cx="15" cy="3.5" r="1.5" />
    </svg>
  );
}

export function PlusIcon({ title, ...props }: IconProps) {
  return (
    <svg {...baseProps(title, props)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function TrashIcon({ title, ...props }: IconProps) {
  return (
    <svg {...baseProps(title, props)}>
      <path d="M4 7h16" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6.5 7 7.5 19a1.5 1.5 0 0 0 1.5 1.4h6a1.5 1.5 0 0 0 1.5-1.4L17.5 7" />
      <path d="M10 11v5M14 11v5" />
    </svg>
  );
}
