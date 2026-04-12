"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export function Switch({ label, description, icon, className, ...props }: SwitchProps) {
  return (
    <label className={cn(
      "flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer group",
      props.checked || props.defaultChecked
        ? "bg-primary/5 border-primary/20" 
        : "bg-surface border-transparent hover:border-outline",
      className
    )}>
      <div className="flex items-center gap-4">
        {icon && (
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
            (props.checked || props.defaultChecked) ? "bg-primary text-white shadow-lg" : "bg-slate-100 text-slate-400"
          )}>
            {icon}
          </div>
        )}
        <div className="space-y-0.5">
          <span className="text-xs font-bold uppercase tracking-widest block text-foreground">{label}</span>
          {description && <span className="text-[10px] text-muted font-medium">{description}</span>}
        </div>
      </div>
      <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50">
        <input 
          {...props}
          type="checkbox" 
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/10 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      </div>
    </label>
  );
}
