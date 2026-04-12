"use client";

import * as React from "react";
import { ChevronDown, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectFieldProps extends React.ComponentProps<"select"> {
  label: string;
  icon?: LucideIcon;
}

export function SelectField({ label, icon: Icon, className, children, ...props }: SelectFieldProps) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 ml-1">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </label>
      <div className="relative">
        <select
          {...props}
          className={cn(
            "w-full h-12 px-4 bg-white/50 backdrop-blur-sm border border-primary/10 hover:border-primary/20 focus:border-primary/40 rounded-2xl text-primary font-serif text-[1.1rem] transition-all focus:outline-none focus:ring-0 appearance-none cursor-pointer",
            className
          )}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 pointer-events-none" />
      </div>
    </div>
  );
}
