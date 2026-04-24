"use client";

import { useState } from "react";
import { AuthPasswordForm } from "@/components/auth-password-form";
import { X, UserPlus, LogIn } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "signup";
type AuthState = { mode: AuthMode; step: number };

export default function AuthPage() {
  const [authState, setAuthState] = useState<AuthState>({ mode: "login", step: 1 });
  const [imageKey, setImageKey] = useState(0);

  const getAuthImage = () => {
    if (authState.mode === "login") return "/auth-photo_1.jpg";
    if (authState.step === 1) return "/auth-photo_1.jpg";
    if (authState.step === 2) return "/auth-photo_2.jpg";
    return "/auth-photo_3.jpg";
  };

  const handleStateChange = (newState: AuthState) => {
    if (newState.mode !== authState.mode || newState.step !== authState.step) {
      setImageKey(prev => prev + 1);
    }
    setAuthState(newState);
  };

  const toggleMode = () => {
    const newMode: AuthMode = authState.mode === "login" ? "signup" : "login";
    handleStateChange({ mode: newMode, step: 1 });
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      {/* GLOBAL GRAIN TEXTURE */}
      <div className="grain-overlay opacity-[0.025] pointer-events-none" aria-hidden="true" />

      {/* LEFT: EDITORIAL ASIDE - FULL DYNAMIC SPEECH */}
      <aside className="relative hidden w-[55%] lg:flex flex-col overflow-hidden bg-primary">
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
          <div className="absolute inset-0 bg-gradient-to-br from-[#001A1C]/50 via-[#003336]/40 to-[#001A1C]/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#001A1C] via-[#003336]/20 to-transparent opacity-95" />
        </div>

        <div className="relative z-10 mt-auto p-12 xl:p-20 animate-fade-in">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-[2px] w-16 bg-gradient-to-r from-white/40 to-transparent rounded-full" />
            <p className="eyebrow text-white/60 m-0 text-[10px] tracking-[0.45em] uppercase font-bold">
              {authState.mode === "login" ? "Portal Privado" : "Protocolo de Registro"}
            </p>
          </div>

          <h2 className="max-w-2xl font-serif text-[4rem] xl:text-[4.5rem] leading-[0.92] tracking-tight text-white italic text-balance mb-8">
            {authState.mode === "login" ? (
              "El criterio define el patrimonio."
            ) : (
              <>
                {authState.step === 1 && "La intención precede al activo."}
                {authState.step === 2 && "Su visión, nuestro catálogo."}
                {authState.step === 3 && "El acceso es solo el principio."}
              </>
            )}
          </h2>

          <p className="max-w-md text-white/70 text-[15px] leading-[1.7] mb-12">
            {authState.mode === "login" ? (
              "Acceda a su entorno privado de inversión inmobiliaria y gestión de activos seleccionados."
            ) : (
              <>
                {authState.step === 1 && "Comience definiendo su perfil de inversión para recibir oportunidades alineadas con sus objetivos."}
                {authState.step === 2 && "Compartanos sus datos de contacto para establecer un canal de comunicación directo y profesional."}
                {authState.step === 3 && "Configure sus credenciales de acceso para entrar al círculo exclusivo de Carlos Realtor."}
              </>
            )}
          </p>

          {/* Step Indicators - Only visible in Signup */}
          <div className={cn("flex gap-2.5 transition-opacity duration-500", authState.mode === "login" ? "opacity-0" : "opacity-100")}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-[3px] rounded-full transition-all duration-700",
                  i === authState.step ? 'w-16 bg-white shadow-lg' : i < authState.step ? 'w-8 bg-white/50' : 'w-8 bg-white/20'
                )}
              />
            ))}
          </div>
        </div>
      </aside>

      {/* RIGHT: INTERACTION WIZARD */}
      <main className="flex w-full lg:w-[45%] flex-col bg-white h-full relative z-10">
        <header className="flex items-center justify-between p-8 lg:px-14 lg:py-10 flex-shrink-0 border-b border-outline/5">
          <Link href="/" className="brand-lockup group">
            <span className="brand-lockup__name text-[1.3rem] text-primary font-serif tracking-tight">
              Carlos Morla <span className="italic text-primary/30 text-[0.8rem]">estates</span>
            </span>
          </Link>

          <div className="flex items-center gap-8">
            <button
              onClick={toggleMode}
              className="group flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 hover:text-primary transition-all"
            >
              {authState.mode === "login" ? (
                <>
                  <UserPlus size={14} strokeWidth={2.5} className="text-primary/20 group-hover:text-accent transition-colors" />
                  <span>Crear Cuenta</span>
                </>
              ) : (
                <>
                  <LogIn size={14} strokeWidth={2.5} className="text-primary/20 group-hover:text-accent transition-colors" />
                  <span>Iniciar Sesión</span>
                </>
              )}
            </button>

            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-soft text-primary/30 hover:text-primary transition-all hover:rotate-90"
              aria-label="Cerrar"
            >
              <X size={18} strokeWidth={2} />
            </Link>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-8 lg:px-20 overflow-y-auto">
          <div className="w-full max-w-[440px] py-10">
            <AuthPasswordForm
              nextPath="/favoritos"
              authState={authState}
              onAuthStateChange={handleStateChange}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
