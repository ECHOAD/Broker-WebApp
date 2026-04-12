import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { HelpCircle } from "lucide-react";

type FormFieldProps = {
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "inverse";
  hint?: string;
};

export function FormField({ label, children, className, tone = "default", hint }: FormFieldProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex items-center gap-2">
        <Label tone={tone} className="m-0">{label}</Label>
        {hint && (
          <div className="group relative">
            <HelpCircle className="w-3.5 h-3.5 text-slate-300 hover:text-blue-500 transition-colors cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-slate-900 text-white text-[10px] leading-relaxed rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none shadow-xl">
              {hint}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
            </div>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
