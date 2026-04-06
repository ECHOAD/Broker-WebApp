import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FormFieldProps = {
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "inverse";
};

export function FormField({ label, children, className, tone = "default" }: FormFieldProps) {
  return (
    <label className={cn("admin-editor-form__field", className)}>
      <Label tone={tone}>{label}</Label>
      {children}
    </label>
  );
}
