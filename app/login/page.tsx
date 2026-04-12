"use client";

import { useState, useEffect } from "react";
import { AuthPasswordForm } from "@/components/auth-magic-link-form";
import { X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [mounted, setMounted] = useState(false);
  const [imageKey, setImageKey] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getAuthImage = () => {
    if (mode === "login") return "/auth-photo_1.jpg";
    if (currentStep === 1) return "/auth-photo_1.jpg";
    if (currentStep === 2) return "/auth-photo_2.jpg";
    return "/auth-photo_3.jpg";
  };

  // Trigger image transition when mode or step changes
  useEffect(() => {
    setImageKey(prev => prev + 1);
  }, [mode, currentStep]);

  if (!mounted) return null;

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      {/* GLOBAL GRAIN TEXTURE */}
      <div className="grain-overlay opacity-[0.025] pointer-events-none" aria-hidden="true" />

      {/* LEFT: EDITORIAL ASIDE WITH IMAGE (55%) */}
      <aside className="relative hidden w-[55%] lg:flex flex-col overflow-hidden bg-primary">
        {/* Background Image Layer with Crossfade */}
        <div className="absolute inset-0 z-0">
          <div className="relative w-full h-full">
            <Image
              key={imageKey}
              src={getAuthImage()}
              alt="Luxury Real Estate Carlos Morla"
              fill
              priority
              className="object-cover transition-opacity duration-[1200ms] ease-in-out"
              style={{ objectPosition: 'center' }}
            />
          </div>

          {/* Premium Overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#001A1C]/50 via-[#003336]/40 to-[#001A1C]/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#001A1C] via-[#003336]/20 to-transparent opacity-95" />

          {/* Subtle vignette */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[#001A1C]/40" />
        </div>

        {/* Content Layer */}
        <div className="relative z-10 mt-auto p-12 xl:p-20 animate-fade-in">
          {/* Decorative Line */}
          <div className="flex items-center gap-4 mb-10">
            <div className="h-[2px] w-16 bg-gradient-to-r from-white/40 to-transparent rounded-full" />
            <p className="eyebrow text-white/60 m-0 text-[10px] tracking-[0.45em] uppercase font-bold">
              Private Gateway Protocol
            </p>
          </div>

          {/* Dynamic Headline */}
          <h2 className="max-w-2xl font-serif text-[4rem] xl:text-[5rem] leading-[0.92] tracking-tight text-white italic text-balance mb-8">
            {mode === "login" ? (
              "El criterio define el patrimonio."
            ) : (
              <>
                {currentStep === 1 && "La intención precede al activo."}
                {currentStep === 2 && "Tu perfil, tu portfolio."}
                {currentStep === 3 && "El acceso es solo el principio."}
              </>
            )}
          </h2>

          {/* Subtle description */}
          <p className="max-w-md text-white/70 text-[15px] leading-[1.7] mb-12">
            {mode === "login" ? (
              "Acceso directo a oportunidades exclusivas en el mercado inmobiliario dominicano."
            ) : (
              <>
                {currentStep === 1 && "Define tu estrategia y descubre propiedades alineadas con tus objetivos."}
                {currentStep === 2 && "Creamos un perfil personalizado para conectarte con las mejores oportunidades."}
                {currentStep === 3 && "Tu membresía privada te abrirá puertas a inversiones de alto valor."}
              </>
            )}
          </p>

          {/* Step Indicators */}
          <div className="flex gap-2.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-[3px] rounded-full transition-all duration-700 ${
                  mode === 'signup' && i === currentStep
                    ? 'w-16 bg-white shadow-[0_0_12px_rgba(255,255,255,0.5)]'
                    : mode === 'signup' && i < currentStep
                    ? 'w-8 bg-white/50'
                    : 'w-8 bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </aside>

      {/* RIGHT: INTERACTION WIZARD (45%) */}
      <main className="flex w-full lg:w-[45%] flex-col bg-white h-full relative z-10">
        {/* Header with Brand Lockup */}
        <header className="flex items-center justify-between p-10 lg:p-14 flex-shrink-0 border-b border-outline/5">
          <Link href="/" className="brand-lockup group transition-transform hover:scale-[1.02] duration-300">
            <span className="brand-lockup__name text-[1.6rem] text-primary">
              <span className="brand-lockup__name-main font-serif tracking-tight">Carlos Morla</span>
              <span className="brand-lockup__name-dot bg-primary/25 inline-block w-1.5 h-1.5 rounded-full mx-2" />
              <span className="brand-lockup__name-accent italic font-serif lowercase text-primary/50 text-[0.95rem]">estates</span>
            </span>
          </Link>

          <Link
            href="/"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-outline/10 text-primary/40 transition-all hover:text-primary hover:bg-surface-soft hover:border-primary/20 hover:scale-110 duration-300"
            aria-label="Cerrar y volver al inicio"
          >
            <X size={18} strokeWidth={2} />
          </Link>
        </header>

        {/* Wizard Content Area */}
        <div className="flex-1 flex items-center justify-center p-10 lg:px-20 lg:py-16">
          <div className="w-full max-w-[480px]">
            <AuthPasswordForm
              initialError={null}
              nextPath="/favoritos"
              onStepChange={setCurrentStep}
              onModeChange={setMode}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
