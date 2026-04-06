import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  eyebrow: string;
  title?: string;
  description: React.ReactNode;
  className?: string;
};

export function EmptyState({ eyebrow, title, description, className }: EmptyStateProps) {
  return (
    <Card className={cn("copy-card", className)}>
      <CardContent className="grid gap-3 p-6">
        <p className="eyebrow">{eyebrow}</p>
        {title ? <h2 className="section-title text-[2rem]">{title}</h2> : null}
        <p className="muted m-0">{description}</p>
      </CardContent>
    </Card>
  );
}
