import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textareaVariants = cva(
  "flex min-h-28 w-full rounded-[18px] border px-4 py-3 text-sm outline-none transition-[border-color,background-color,box-shadow] placeholder:text-muted focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      tone: {
        default: "border-outline bg-surface text-foreground",
        inverse:
          "border-white/18 bg-white/8 text-white placeholder:text-white/50 focus-visible:border-white/40 focus-visible:bg-white/12",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  },
);

function Textarea({
  className,
  tone,
  ...props
}: React.ComponentProps<"textarea"> & VariantProps<typeof textareaVariants>) {
  return <textarea data-slot="textarea" className={cn(textareaVariants({ tone }), className)} {...props} />;
}

export { Textarea, textareaVariants };
