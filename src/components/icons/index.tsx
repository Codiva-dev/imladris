import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

function base(props: IconProps) {
  const { title, ...rest } = props;
  return { title, rest };
}

export function LeafIcon(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} {...rest}>
      {title ? <title>{title}</title> : null}
      <path
        d="M12 21c0-6 4-10 9-12-1 7-5 11-9 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 21C12 15 8 11 3 9c1 7 5 11 9 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M12 21V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function StarIcon(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} {...rest}>
      {title ? <title>{title}</title> : null}
      <path
        d="M12 3.5 13.8 9h5.7l-4.6 3.4 1.8 5.6L12 14.8 7.3 18l1.8-5.6L4.5 9h5.7L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CompassIcon(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} {...rest}>
      {title ? <title>{title}</title> : null}
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="m14.8 9.2-1.6 4.6-4.6 1.6 1.6-4.6 4.6-1.6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ScrollIcon(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} {...rest}>
      {title ? <title>{title}</title> : null}
      <path
        d="M7 5.5c0-1.4 1.1-2.5 2.5-2.5H18a1 1 0 0 1 1 1v13.5c0 1.4-1.1 2.5-2.5 2.5H8.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7 5.5v13A2.5 2.5 0 0 0 9.5 21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M10 8h6M10 12h6M10 16h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function BranchIcon(props: IconProps) {
  const { title, rest } = base(props);
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} {...rest}>
      {title ? <title>{title}</title> : null}
      <path
        d="M5 19c4-2 6-5 7-9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 10c2-1 4-.5 6 1M12 10c1 2 .5 4-1 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
