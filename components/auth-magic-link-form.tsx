"use client";

import { FormEvent, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Home,
  Timer,
  Mail,
  Lock,
  User,
  Phone,
  Globe,
  Check
} from "lucide-react";

type AuthMagicLinkFormProps = {
  nextPath: string;
  initialError: string | null;
  pendingFavorite?: string | null;
  onStepChange?: (step: number) => void;
  onModeChange?: (mode: "login" | "signup") => void;
};

export function AuthPasswordForm({
  nextPath,
  onStepChange,
  onModeChange
}: AuthMagicLinkFormProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [language, setLanguage] = useState("es");
  const [interestType, setInterestType] = useState("Inversión");

  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);

  useEffect(() => {
    onModeChange?.(mode);
  }, [mode, onModeChange]);

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "signup" && step < 3) {
      nextStep();
      return;
    }

    setIsPending(true);
    const supabase = createClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage("Acceso no autorizado. Verifique sus datos.");
        setIsPending(false);
        return;
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            preferred_language: language,
            interest_type: interestType,
          }
        },
      });

      if (error) {
        setMessage(error.message);
        setIsPending(false);
        return;
      }

      if (data.session) {
        window.location.assign(nextPath);
        return;
      }

      setMessage("Onboarding completado. Active su cuenta vía email.");
      setIsPending(false);
      return;
    }

    window.location.assign(nextPath);
  }

  const InputLabel = ({ children }: { children: string }) => (
    <label className="block eyebrow text-[10px] text-primary/50 uppercase tracking-[0.3em] mb-3 font-bold">
      {children}
    </label>
  );

  return (
    <div className="animate-fade-in w-full">
      {/* Header Section */}
      <div className="mb-14">
        <div className="mb-6">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-[1px] w-8 bg-primary/20" />
            <span className="eyebrow text-[9px] text-primary/40 uppercase tracking-[0.35em] font-bold">
              {mode === "login" ? "Acceso Privado" : `Fase ${step} de 3`}
            </span>
          </div>

          <h1 className="font-serif text-[3.2rem] xl:text-[3.8rem] text-primary leading-[0.95] tracking-tight mb-5 italic">
            {mode === "login" ? "Bienvenido de vuelta." : (
              <>
                {step === 1 && "¿Qué te trae hoy?"}
                {step === 2 && "Queremos conocerte."}
                {step === 3 && "Último paso."}
              </>
            )}
          </h1>

          <p className="text-muted text-[15px] max-w-[380px] leading-[1.7]">
            {mode === "login"
              ? "Accede a tu portfolio exclusivo de inversiones y propiedades guardadas."
              : (
                <>
                  {step === 1 && "Personaliza tu experiencia según tus objetivos inmobiliarios."}
                  {step === 2 && "Completa tu perfil para recibir recomendaciones personalizadas."}
                  {step === 3 && "Crea tus credenciales de acceso seguro a la plataforma."}
                </>
              )}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-12">
        <div className="min-h-[320px]">
          {mode === "login" ? (
            <div className="grid gap-7 animate-in fade-in slide-in-from-bottom-3 duration-700">
              <div className="grid gap-3">
                <InputLabel>Correo Electrónico</InputLabel>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/30" size={18} />
                  <input
                    required
                    type="email"
                    placeholder="nombre@correo.com"
                    className="w-full pl-14 pr-6 py-4 bg-surface-soft/80 border border-outline/8 rounded-[20px] font-sans text-[15px] text-primary placeholder:text-primary/25 focus:outline-none focus:border-primary/25 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-3">
                <InputLabel>Contraseña</InputLabel>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/30" size={18} />
                  <input
                    required
                    type="password"
                    placeholder="••••••••••"
                    className="w-full pl-14 pr-6 py-4 bg-surface-soft/80 border border-outline/8 rounded-[20px] font-sans text-[15px] text-primary placeholder:text-primary/25 focus:outline-none focus:border-primary/25 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1">
              {step === 1 && (
                <div className="grid gap-5 animate-in fade-in slide-in-from-right-5 duration-700">
                  <InputLabel>Selecciona tu objetivo principal</InputLabel>
                  <div className="grid gap-4">
                    {[
                      {
                        id: 'Inversión',
                        icon: Briefcase,
                        title: 'Inversión',
                        desc: 'Busco plusvalía y rentabilidad a largo plazo.',
                        color: 'from-primary via-primary-soft to-primary'
                      },
                      {
                        id: 'Compra',
                        icon: Home,
                        title: 'Residencia Propia',
                        desc: 'Quiero comprar mi próximo hogar.',
                        color: 'from-accent/90 via-accent to-accent/80'
                      },
                      {
                        id: 'Renta',
                        icon: Timer,
                        title: 'Renta Temporal',
                        desc: 'Necesito una estancia por tiempo limitado.',
                        color: 'from-primary-soft via-primary to-primary-soft'
                      }
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = interestType === item.id;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setInterestType(item.id)}
                          className={`group relative flex items-start gap-6 p-6 rounded-[24px] border-2 transition-all duration-500 overflow-hidden ${
                            isSelected
                              ? 'bg-primary border-primary text-white shadow-[0_20px_60px_rgba(0,51,54,0.25)] scale-[1.02]'
                              : 'bg-white border-outline/10 text-primary/70 hover:border-primary/20 hover:shadow-lg hover:scale-[1.01]'
                          }`}
                        >
                          {/* Background gradient on hover/selected */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 transition-opacity duration-500 ${
                            isSelected ? 'opacity-100' : 'group-hover:opacity-5'
                          }`} />

                          {/* Icon Container */}
                          <div className={`relative flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                            isSelected
                              ? 'bg-white/20 backdrop-blur-sm'
                              : 'bg-surface-soft group-hover:bg-primary/5'
                          }`}>
                            <Icon size={24} strokeWidth={1.5} className={`transition-all duration-500 ${
                              isSelected ? 'text-white' : 'text-primary/60 group-hover:text-primary'
                            }`} />
                          </div>

                          {/* Content */}
                          <div className="relative flex-1 text-left">
                            <div className="flex items-center gap-3 mb-2">
                              <p className={`text-[13px] font-bold uppercase tracking-[0.15em] m-0 leading-none transition-colors duration-500 ${
                                isSelected ? 'text-white' : 'text-primary group-hover:text-primary'
                              }`}>
                                {item.title}
                              </p>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center animate-in zoom-in duration-300">
                                  <Check size={12} className="text-white" strokeWidth={3} />
                                </div>
                              )}
                            </div>
                            <p className={`text-[13px] m-0 leading-[1.6] transition-colors duration-500 ${
                              isSelected ? 'text-white/85' : 'text-primary/50 group-hover:text-primary/70'
                            }`}>
                              {item.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-7 animate-in fade-in slide-in-from-right-5 duration-700">
                  <div className="grid gap-3">
                    <InputLabel>Nombre Completo</InputLabel>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/30" size={18} />
                      <input
                        required
                        placeholder="Como aparecerá en tu perfil"
                        className="w-full pl-14 pr-6 py-4 bg-surface-soft/80 border border-outline/8 rounded-[20px] font-sans text-[15px] text-primary placeholder:text-primary/25 focus:outline-none focus:border-primary/25 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <InputLabel>Teléfono WhatsApp</InputLabel>
                    <div className="relative">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/30" size={18} />
                      <input
                        required
                        type="tel"
                        placeholder="+1 (809) 555-0123"
                        className="w-full pl-14 pr-6 py-4 bg-surface-soft/80 border border-outline/8 rounded-[20px] font-sans text-[15px] text-primary placeholder:text-primary/25 focus:outline-none focus:border-primary/25 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <InputLabel>Idioma Preferido</InputLabel>
                    <div className="relative">
                      <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/30 z-10" size={18} />
                      <div className="flex gap-3 p-1.5 bg-surface-soft/80 rounded-[20px] border border-outline/8">
                        {[
                          { code: 'es', label: 'Español', flag: '🇩🇴' },
                          { code: 'en', label: 'English', flag: '🇺🇸' }
                        ].map((lang) => (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => setLanguage(lang.code)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-[16px] text-[13px] font-bold uppercase tracking-[0.1em] transition-all duration-300 ${
                              language === lang.code
                                ? 'bg-primary text-white shadow-lg scale-[1.02]'
                                : 'text-primary/40 hover:text-primary/70 hover:bg-white/60'
                            }`}
                          >
                            <span className="text-lg">{lang.flag}</span>
                            <span>{lang.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="grid gap-7 animate-in fade-in slide-in-from-right-5 duration-700">
                  <div className="grid gap-3">
                    <InputLabel>Correo Electrónico</InputLabel>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/30" size={18} />
                      <input
                        required
                        type="email"
                        placeholder="tu@email.com"
                        className="w-full pl-14 pr-6 py-4 bg-surface-soft/80 border border-outline/8 rounded-[20px] font-sans text-[15px] text-primary placeholder:text-primary/25 focus:outline-none focus:border-primary/25 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <InputLabel>Contraseña Segura</InputLabel>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/30" size={18} />
                      <input
                        required
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        className="w-full pl-14 pr-6 py-4 bg-surface-soft/80 border border-outline/8 rounded-[20px] font-sans text-[15px] text-primary placeholder:text-primary/25 focus:outline-none focus:border-primary/25 focus:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <p className="text-[11px] text-primary/40 leading-[1.6] mt-1">
                      Usa una combinación de letras, números y símbolos para mayor seguridad.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {message && (
          <div className="p-5 bg-primary/8 border border-primary/15 rounded-[20px] animate-in zoom-in-95 duration-300">
            <p className="text-[12px] text-center font-semibold text-primary m-0 leading-[1.6]">
              {message}
            </p>
          </div>
        )}

        <div className="grid gap-10">
          <div className="flex gap-4">
            {mode === "signup" && step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-outline/15 text-primary/50 hover:text-primary hover:bg-surface-soft hover:border-primary/25 transition-all duration-300 bg-white shadow-sm hover:shadow-lg hover:scale-105"
              >
                <ArrowLeft size={20} strokeWidth={2} />
              </button>
            )}

            <Button
              className="flex-1 rounded-full h-16 bg-gradient-to-r from-primary via-primary-soft to-primary text-white hover:shadow-[0_20px_60px_rgba(0,51,54,0.3)] shadow-xl font-bold tracking-[0.15em] uppercase text-[11px] group transition-all duration-500 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              disabled={isPending}
              type="submit"
            >
              {isPending ? (
                <span className="flex items-center gap-3">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Procesando...
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  {mode === "login" ? "Acceder" : (step === 3 ? "Completar Registro" : "Siguiente")}
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} />
                </span>
              )}
            </Button>
          </div>

          <div className="pt-6 border-t border-outline/8 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setStep(1);
                setMessage(null);
              }}
              className="group inline-flex items-center gap-2 text-[11px] eyebrow tracking-[0.2em] text-primary/35 hover:text-primary transition-colors duration-300 uppercase font-bold"
            >
              {mode === "login" ? (
                <>
                  <span>¿Primera vez aquí?</span>
                  <span className="font-serif normal-case italic text-[13px] tracking-normal underline decoration-primary/20 group-hover:decoration-primary transition-colors">
                    Crear cuenta
                  </span>
                </>
              ) : (
                <>
                  <span>¿Ya tienes cuenta?</span>
                  <span className="font-serif normal-case italic text-[13px] tracking-normal underline decoration-primary/20 group-hover:decoration-primary transition-colors">
                    Iniciar sesión
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
