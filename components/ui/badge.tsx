import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-3 py-2 text-[0.72rem] uppercase tracking-[0.18em] transition-colors",
  {
    variants: {
      variant: {
        chip: "bg-surface-soft text-primary",
        metric: "bg-primary/8 text-foreground",
        inverse: "bg-white/10 text-white ring-1 ring-white/10",
        outline: "border border-outline bg-white/50 text-muted backdrop-blur-md",
      },
    },
    defaultVariants: {
      variant: "chip",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
