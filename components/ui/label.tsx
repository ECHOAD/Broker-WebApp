import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const labelVariants = cva("text-sm font-medium leading-none", {
  variants: {
    tone: {
      default: "text-foreground",
      muted: "text-muted",
      inverse: "text-white/88",
    },
    tracking: {
      default: "",
      eyebrow: "text-[0.68rem] uppercase tracking-[0.28em]",
    },
  },
  defaultVariants: {
    tone: "default",
    tracking: "default",
  },
});

function Label({
  className,
  tone,
  tracking,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof labelVariants>) {
  return <span data-slot="label" className={cn(labelVariants({ tone, tracking }), className)} {...props} />;
}

export { Label, labelVariants };
