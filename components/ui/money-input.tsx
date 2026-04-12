"use client";

import * as React from "react";
import { DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MoneyInputProps extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  value: number | string;
  onChange: (value: number) => void;
  label?: string;
}

export function MoneyInput({ value, onChange, label, className, ...props }: MoneyInputProps) {
  const [displayValue, setDisplayValue] = React.useState("");

  React.useEffect(() => {
    if (value === 0 || value === "") {
      setDisplayValue("");
    } else {
      setDisplayValue(Number(value).toLocaleString("en-US"));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    const numericValue = parseInt(rawValue, 10) || 0;
    onChange(numericValue);
  };

  return (
    <div className={cn("grid gap-1.5", className)}>
      {label && (
        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60 group-focus-within:text-primary transition-colors z-10 pointer-events-none" />
        <Input
          {...props}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          className="pl-9 h-12 bg-white/80 backdrop-blur-sm border-primary/10 hover:border-primary/20 focus:border-primary/40 rounded-2xl transition-all relative"
        />
      </div>
    </div>
  );
}
