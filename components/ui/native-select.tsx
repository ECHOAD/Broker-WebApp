import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const nativeSelectVariants = cva(
  "flex h-12 w-full min-w-0 rounded-[18px] border px-4 py-3 text-sm outline-none transition-[border-color,background-color,box-shadow] focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      tone: {
        default: "border-outline bg-surface text-foreground",
        inverse: "border-white/18 bg-white/8 text-white",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  },
);

function NativeSelect({
  className,
  tone,
  children,
  ...props
}: React.ComponentProps<"select"> & VariantProps<typeof nativeSelectVariants>) {
  return (
    <select data-slot="native-select" className={cn(nativeSelectVariants({ tone }), className)} {...props}>
      {children}
    </select>
  );
}

export { NativeSelect, nativeSelectVariants };
