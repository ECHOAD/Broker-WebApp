import { cn } from "@/lib/utils";

type BrokerWavePortraitProps = {
  className?: string;
  imageSrc?: string;
};

export function BrokerWavePortrait({
  className,
  imageSrc = "/broker-photo.jpeg",
}: BrokerWavePortraitProps) {
  return (
    <div className={cn("broker-photo-shape", className)}>
      <svg
        aria-hidden="true"
        className="broker-photo-shape__waves"
        viewBox="0 0 620 720"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="broker-wave-primary" x1="70" x2="552" y1="128" y2="610" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a1fff0" />
            <stop offset="1" stopColor="#2fa89b" />
          </linearGradient>
          <linearGradient id="broker-wave-secondary" x1="112" x2="488" y1="102" y2="512" gradientUnits="userSpaceOnUse">
            <stop stopColor="#dffff9" stopOpacity="0.95" />
            <stop offset="1" stopColor="#b4efe6" stopOpacity="0.18" />
          </linearGradient>
        </defs>

        <path
          d="M26 596C98 550 164 540 232 568C298 594 372 598 452 548C516 508 564 500 596 512V718H26V596Z"
          fill="url(#broker-wave-primary)"
          opacity="0.9"
        />
        <path
          d="M0 146C78 94 156 102 236 142C312 180 386 182 470 128C532 88 580 92 620 126V0H0V146Z"
          fill="url(#broker-wave-secondary)"
          opacity="0.56"
        />
        <path
          d="M34 466C104 422 162 424 238 458C314 492 388 498 470 456C532 424 578 424 620 446"
          fill="none"
          opacity="0.34"
          stroke="#d7fff8"
          strokeLinecap="round"
          strokeWidth="8"
        />
        <path
          d="M14 516C88 480 152 482 234 520C314 556 392 560 476 520C540 490 586 492 620 506"
          fill="none"
          opacity="0.2"
          stroke="#f3fffd"
          strokeLinecap="round"
          strokeWidth="5"
        />
        <circle cx="470" cy="126" fill="#d8fff7" opacity="0.18" r="72" />
        <circle cx="134" cy="166" fill="#dcfff8" opacity="0.12" r="46" />
        <circle cx="476" cy="132" fill="none" opacity="0.28" r="108" stroke="#d9fff7" strokeWidth="2" />
      </svg>

      <div className="broker-photo-shape__blob">
        <img
          alt="Carlos Realto"
          className="broker-photo-shape__photo"
          src={imageSrc}
        />
      </div>
    </div>
  );
}
