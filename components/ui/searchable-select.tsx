"use client";

import * as React from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  icon?: React.ElementType;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  label,
  icon: Icon,
  className,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("grid gap-1.5 w-full relative", className)} ref={containerRef}>
      {label && (
        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 ml-1">
          {Icon && <Icon className="w-3 h-3" />}
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-2xl border border-primary/10 bg-white/80 backdrop-blur-sm px-4 py-3 text-left transition-all hover:border-primary/25 hover:bg-white/90 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10",
          isOpen && "border-primary/40 bg-white/95 ring-2 ring-primary/10"
        )}
      >
        <span className={cn("font-serif text-[1.05rem] truncate", !selectedOption && "text-primary/40")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-primary/40 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] z-[100] w-full animate-in fade-in zoom-in-95 duration-200">
          <div className="overflow-hidden rounded-2xl border border-primary/10 bg-white/98 p-1.5 shadow-[0_24px_48px_-12px_rgba(0,51,54,0.2)] backdrop-blur-2xl">
            {/* Search Input */}
            <div className="relative mb-2 p-2">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/40" />
              <input
                autoFocus
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-xl bg-primary/5 border border-primary/10 pl-9 pr-9 text-sm outline-none placeholder:text-primary/40 focus:bg-primary/[0.08] focus:border-primary/20 transition-colors"
                onClick={(e) => e.stopPropagation()}
              />
              {searchQuery && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery("");
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-primary/10"
                >
                  <X className="h-3 w-3 text-primary/40" />
                </button>
              )}
            </div>

            {/* Options List */}
            <div className="max-h-[260px] overflow-y-auto scrollbar-hide px-1">
              {filteredOptions.length > 0 ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onChange("");
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className="flex w-full items-center rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-primary/5 mb-0.5"
                  >
                    <span className="font-serif italic text-primary/50">Sin filtro</span>
                  </button>
                  {filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                        setSearchQuery("");
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all hover:bg-primary/8 mb-0.5",
                        value === option.value && "bg-primary/12 text-primary font-semibold hover:bg-primary/15"
                      )}
                    >
                      <span className="font-serif text-[1rem]">{option.label}</span>
                      {value === option.value && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
                    </button>
                  ))}
                </>
              ) : (
                <div className="px-3 py-8 text-center">
                  <p className="font-serif text-sm italic text-primary/30">No se encontraron resultados</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
