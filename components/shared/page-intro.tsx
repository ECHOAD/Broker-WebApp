import * as React from "react";
import { cn } from "@/lib/utils";

type PageIntroProps = {
  eyebrow: string;
  title: string;
  description?: React.ReactNode;
  className?: string;
  titleClassName?: string;
};

export function PageIntro({ eyebrow, title, description, className, titleClassName }: PageIntroProps) {
  return (
    <div className={cn(className)}>
      <p className="eyebrow">{eyebrow}</p>
      <h1 className={cn("section-title", titleClassName)}>{title}</h1>
      {description ? <p className="lede">{description}</p> : null}
    </div>
  );
}
