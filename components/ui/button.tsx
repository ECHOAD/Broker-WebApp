import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(135deg,var(--primary)_0%,var(--primary-soft)_100%)] text-primary-foreground shadow-editorial hover:-translate-y-px",
        secondary:
          "border border-outline bg-white/70 text-primary shadow-[0_18px_45px_rgba(27,28,25,0.04)] backdrop-blur-md hover:-translate-y-px",
        tertiary:
          "rounded-none border-b border-current px-0 py-0 text-accent hover:-translate-y-px",
        ghost: "text-foreground hover:bg-surface-soft",
        surface:
          "border border-white/70 bg-white/80 text-foreground shadow-editorial backdrop-blur-md hover:-translate-y-px",
        inverse:
          "border border-white/20 bg-white/10 text-white backdrop-blur-md hover:-translate-y-px",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-6",
        icon: "size-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
