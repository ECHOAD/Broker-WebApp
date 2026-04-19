"use client";

import { FormEvent, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Phone,
  Check,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Globe
} from "lucide-react";

type AuthMode = "login" | "signup";
type AuthState = { mode: AuthMode; step: number };

type AuthPasswordFormProps = {
  nextPath: string;
  authState: AuthState;
  onAuthStateChange: (state: AuthState) => void;
};

export function AuthPasswordForm({
  nextPath,
  authState,
  onAuthStateChange
}: AuthPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [language, setLanguage] = useState("es");
  const [interestType, setInterestType] = useState("Inversión");

  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const nextStep = () => onAuthStateChange({ ...authState, step: authState.step + 1 });
  const prevStep = () => onAuthStateChange({ ...authState, step: authState.step - 1 });
  const toggleMode = () => {
    const newMode: AuthMode = authState.mode === "login" ? "signup" : "login";
    onAuthStateChange({ mode: newMode, step: 1 });
    setMessage(null);
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (authState.mode === "signup" && authState.step < 3) {
      nextStep();
      return;
    }

    setIsPending(true);
    const supabase = createClient();

    if (authState.mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage("Credenciales no reconocidas.");
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

      setMessage("Registro completado. Verifique su email.");
      setIsPending(false);
      return;
    }

    window.location.assign(nextPath);
  }

  const InputLabel = ({ children }: { children: string }) => (
    <label className="block eyebrow text-[10px] text-primary/40 uppercase tracking-[0.3em] mb-2 font-bold">
      {children}
    </label>
  );

  return (
    <div className="animate-fade-in w-full">
      {/* DINAMISMO TOTAL: Títulos y Speeches según Modo */}
      <div className="mb-10 lg:mb-12">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="h-[1px] w-8 bg-accent/30" />
          <span className="eyebrow text-[9px] text-accent font-bold uppercase tracking-[0.35em]">
            {authState.mode === "login" ? "Sesión Privada" : `Registro · Paso ${authState.step} de 3`}
          </span>
        </div>

        <h1 className="font-serif text-[2.8rem] xl:text-[3.5rem] text-primary leading-[1] tracking-tight mb-5 italic">
          {authState.mode === "login" ? "Bienvenido de vuelta." : (
            <>
              {authState.step === 1 && "¿Cuál es su objetivo?"}
              {authState.step === 2 && "Sus datos de contacto."}
              {authState.step === 3 && "Configure su acceso."}
            </>
          )}
        </h1>

        <p className="text-muted text-[15px] max-w-[360px] leading-[1.6]">
          {authState.mode === "login"
            ? "Ingrese sus credenciales para acceder a su entorno privado de gestión inmobiliaria."
            : (
              <>
                {authState.step === 1 && "Seleccione el tipo de propiedad que busca para personalizar su experiencia."}
                {authState.step === 2 && "Proporciónenos su información de contacto para establecer comunicación directa."}
                {authState.step === 3 && "Establezca su email y contraseña para crear su cuenta de acceso privado."}
              </>
            )}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-10">
        <div className="min-h-[220px]">
          {authState.mode === "login" ? (
            <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="grid gap-2">
                <InputLabel>Email</InputLabel>
                <input required type="email" placeholder="su@email.com" className="w-full px-6 py-4 bg-surface-soft/60 border border-outline/5 rounded-[18px] text-sm focus:outline-none focus:bg-white transition-all shadow-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <InputLabel>Contraseña</InputLabel>
                <input required type="password" placeholder="••••••••••" className="w-full px-6 py-4 bg-surface-soft/60 border border-outline/5 rounded-[18px] text-sm focus:outline-none focus:bg-white transition-all shadow-sm" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>
          ) : (
            <div className="flex-1">
              {authState.step === 1 && (
                <div className="grid gap-4 animate-in fade-in slide-in-from-right-3 duration-500">
                  <div className="grid gap-3">
                    {[
                      { id: 'Inversión', icon: TrendingUp, title: 'Inversión & Renta', desc: 'Generar patrimonio' },
                      { id: 'Compra', icon: Sparkles, title: 'Residencia Principal', desc: 'Establecer hogar' },
                      { id: 'Renta', icon: ShieldCheck, title: 'Segunda Residencia', desc: 'Uso ocasional' }
                    ].map((item) => (
                      <button key={item.id} type="button" onClick={() => setInterestType(item.id)} className={`flex items-center gap-5 p-5 rounded-[20px] border-2 transition-all duration-300 ${interestType === item.id ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white border-outline/5 text-primary/60 hover:border-primary/20'}`}>
                        <item.icon size={20} className={interestType === item.id ? 'text-white' : 'text-primary/30'} />
                        <div className="text-left">
                          <p className="text-[12px] font-bold uppercase tracking-widest m-0">{item.title}</p>
                          <p className={`text-[11px] m-0 ${interestType === item.id ? 'text-white/70' : 'text-primary/30'}`}>{item.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {authState.step === 2 && (
                <div className="grid gap-6 animate-in fade-in slide-in-from-right-3 duration-500">
                  <div className="grid gap-2">
                    <InputLabel>Nombre Completo</InputLabel>
                    <input required className="w-full px-6 py-4 bg-surface-soft/60 border border-outline/5 rounded-[18px] text-sm focus:outline-none focus:bg-white transition-all shadow-sm" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <InputLabel>Teléfono / WhatsApp</InputLabel>
                    <input required type="tel" className="w-full px-6 py-4 bg-surface-soft/60 border border-outline/5 rounded-[18px] text-sm focus:outline-none focus:bg-white transition-all shadow-sm" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>
              )}

              {authState.step === 3 && (
                <div className="grid gap-6 animate-in fade-in slide-in-from-right-3 duration-500">
                  <div className="grid gap-2">
                    <InputLabel>Email</InputLabel>
                    <input required type="email" placeholder="su@email.com" className="w-full px-6 py-4 bg-surface-soft/60 border border-outline/5 rounded-[18px] text-sm focus:outline-none focus:bg-white transition-all shadow-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <InputLabel>Contraseña</InputLabel>
                    <input required type="password" placeholder="Mínimo 8 caracteres" className="w-full px-6 py-4 bg-surface-soft/60 border border-outline/5 rounded-[18px] text-sm focus:outline-none focus:bg-white transition-all shadow-sm" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {message && (
          <div className="p-4 bg-accent/5 border border-accent/10 rounded-[18px] animate-in zoom-in-95 duration-300">
            <p className="text-[11px] text-center font-bold text-accent m-0 uppercase tracking-widest leading-tight">{message}</p>
          </div>
        )}

        {/* ACCIÓN PRINCIPAL DINÁMICA */}
        <div className="grid gap-8">
          <div className="flex gap-3">
            {authState.mode === "signup" && authState.step > 1 && (
              <button type="button" onClick={prevStep} className="w-14 h-14 rounded-full flex items-center justify-center border border-outline/10 text-primary/30 hover:text-primary transition-all"><ArrowLeft size={18} /></button>
            )}
            <Button className="flex-1 rounded-full h-14 lg:h-16 bg-primary text-white shadow-xl font-bold tracking-[0.2em] uppercase text-[10px] group transition-all duration-500" disabled={isPending} type="submit">
              {isPending ? "Procesando..." : (
                <span className="flex items-center gap-2">
                  {authState.mode === "login" ? "Iniciar Sesión" : (authState.step === 3 ? "Crear Cuenta" : "Continuar")}
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </div>

          <div className="pt-4 border-t border-outline/5 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="group inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/30 hover:text-primary transition-all"
            >
              {authState.mode === "login" ? (
                <>¿Nuevo aquí? <span className="font-serif italic normal-case text-[12px] tracking-normal underline decoration-primary/10 group-hover:decoration-primary">Crear cuenta</span></>
              ) : (
                <>¿Ya tiene cuenta? <span className="font-serif italic normal-case text-[12px] tracking-normal underline decoration-primary/10 group-hover:decoration-primary">Iniciar sesión</span></>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
