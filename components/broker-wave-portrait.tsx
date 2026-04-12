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
          <linearGradient id="broker-wave-primary" x1="92" x2="518" y1="98" y2="624" gradientUnits="userSpaceOnUse">
            <stop stopColor="#bfe8e2" />
            <stop offset="1" stopColor="#6ea9a3" />
          </linearGradient>
          <linearGradient id="broker-wave-secondary" x1="124" x2="468" y1="84" y2="498" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f7f2e8" stopOpacity="0.92" />
            <stop offset="1" stopColor="#d1e7e2" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        <path
          d="M84 646C142 616 210 606 282 618C360 630 430 616 520 570V720H84V646Z"
          fill="url(#broker-wave-primary)"
          opacity="0.58"
        />
        <path
          d="M42 122C122 92 198 102 278 126C354 148 424 146 520 100L552 0H42V122Z"
          fill="url(#broker-wave-secondary)"
          opacity="0.52"
        />
        <path
          d="M110 174C196 154 282 154 378 172C438 182 490 180 546 164"
          fill="none"
          opacity="0.3"
          stroke="#c8ece6"
          strokeLinecap="round"
          strokeWidth="5"
        />
        <path
          d="M72 566C154 532 238 526 324 540C412 554 488 540 560 504"
          fill="none"
          opacity="0.22"
          stroke="#f6f3ea"
          strokeLinecap="round"
          strokeWidth="4"
        />
        <path
          d="M84 86C124 66 178 56 242 60"
          fill="none"
          opacity="0.18"
          stroke="#f6f3ea"
          strokeLinecap="round"
          strokeWidth="3"
        />
      </svg>

      <div className="broker-photo-shape__blob">
        <img
          alt="Carlos Realto"
          className="broker-photo-shape__photo"
          src={imageSrc}
        />
      </div>

      <div aria-hidden="true" className="broker-photo-shape__outline" />
    </div>
  );
}
