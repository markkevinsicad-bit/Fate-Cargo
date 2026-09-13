import type { SVGProps } from "react";

export function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M13.5 21v-7.5h2.5l.5-3h-3V8.5c0-.9.25-1.5 1.55-1.5H16.5V4.3c-.27-.04-1.2-.12-2.28-.12-2.26 0-3.8 1.38-3.8 3.9V10.5H8v3h2.42V21h3.08Z" />
    </svg>
  );
}

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true" {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.7" />
      <circle cx="17.1" cy="6.9" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function MessengerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 3C6.9 3 3 6.6 3 11.4c0 2.6 1.2 4.9 3.1 6.5V21l2.9-1.6c.9.25 1.9.4 3 .4 5.1 0 9-3.6 9-8.4S17.1 3 12 3Zm1.03 10.4-2.3-2.45-4.5 2.45 4.95-5.25 2.35 2.45 4.45-2.45-4.95 5.25Z" />
    </svg>
  );
}
