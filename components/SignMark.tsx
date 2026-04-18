import type { SVGProps } from "react";

// brand glyph — five fingertips rising from a baseline, echoing the "high five"
// motion. not a generic waving-hand emoji; this is our own wordmark-adjacent
// shape so the brand reads instantly even when the wordmark is clipped.
export function SignMark({
  size = 28,
  className,
  ...rest
}: { size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="HighFive mark"
      className={className}
      {...rest}
    >
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="9"
        fill="currentColor"
        className="text-ink"
      />
      {/* five fingertips rising — short middle digits, taller index/ring */}
      <g stroke="#fbfaf7" strokeWidth="2.2" strokeLinecap="round">
        <line x1="7" y1="22" x2="7" y2="14" />
        <line x1="12" y1="22" x2="12" y2="10" />
        <line x1="17" y1="22" x2="17" y2="8" />
        <line x1="22" y1="22" x2="22" y2="11" />
        <line x1="26.5" y1="22" x2="26.5" y2="15" />
      </g>
      {/* palm baseline */}
      <rect x="5" y="22" width="23" height="3" rx="1.5" fill="#fbfaf7" />
      {/* brand accent dot */}
      <circle cx="17" cy="5" r="1.6" fill="#4b6eff" />
    </svg>
  );
}
