"use client";

import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Calendar, Languages, MessageSquare, Phone, User as UserIcon, X, ArrowRight } from "lucide-react";

type PropertyLeadFormProps = {
  propertyId: string;
  propertySlug: string;
  propertyTitle: string;
  propertyType: string;
  whatsappPhone: string | null;
  user: User | null;
};

type FieldErrors = {
  fullName?: string;
  phone?: string;
  email?: string;
  consentContact?: string;
};

export function PropertyLeadForm({
  propertyId,
  propertySlug,
  propertyTitle,
  propertyType,
  whatsappPhone,
  user,
}: PropertyLeadFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  
  const [values, setValues] = useState({
    fullName: user?.user_metadata?.full_name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    language: "Español",
    message: "",
    visitDate: "",
    consentContact: true,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setFieldErrors({});
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    
    if (user) {
      formData.append("fullName", values.fullName);
      formData.append("email", values.email);
    }

    const response = await fetch("/api/public-leads", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json()) as {
      ok: boolean;
      redirectUrl?: string;
      message?: string;
      fieldErrors?: FieldErrors;
    };

    if (!response.ok || !payload.ok || !payload.redirectUrl) {
      setFieldErrors(payload.fieldErrors ?? {});
      setMessage(payload.message ?? "No pudimos procesar la solicitud.");
      setIsPending(false);
      return;
    }

    window.location.assign(payload.redirectUrl);
  }

  const modalContent = isOpen && (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={() => !isPending && setIsOpen(false)}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 ease-out">
        <div className="luxury-card overflow-hidden bg-white shadow-2xl shadow-primary/20">
          {/* Close Button */}
          <button 
            onClick={() => !isPending && setIsOpen(false)}
            className="absolute top-6 right-6 z-20 p-2 rounded-full hover:bg-surface-soft transition-colors text-primary/40"
          >
            <X size={20} />
          </button>

          <div className="p-8 md:p-12">
            <div className="grid gap-10">
              <div className="max-w-md">
                <p className="eyebrow text-primary/40 m-0 tracking-[0.3em]">Propuesta de Interés</p>
                <h2 className="font-serif text-[2.5rem] mt-4 text-primary leading-[0.9] tracking-tight">
                  {user ? `Hola ${user.user_metadata?.full_name?.split(' ')[0] || 'de nuevo'},` : 'Hablemos de tu próximo paso'}
                </h2>
                <p className="text-muted text-base mt-4 text-balance leading-relaxed">
                  {user 
                    ? 'Confirmaremos tu interés usando tu perfil de inversor. El broker Carlos Morla recibirá tu solicitud de inmediato.' 
                    : `Estás a un paso de recibir el dossier completo y atención personalizada sobre ${propertyTitle}.`}
                </p>
              </div>

              <form className="grid gap-8" onSubmit={handleSubmit}>
                <input type="hidden" name="propertyId" value={propertyId} />
                <input type="hidden" name="propertySlug" value={propertySlug} />
                
                {!user ? (
                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <label className="eyebrow text-[9px] opacity-40 ml-1">Nombre completo</label>
                      <div className="relative group">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within:text-primary transition-colors" size={16} />
                        <input
                          name="fullName"
                          required
                          placeholder="Tu nombre"
                          className="w-full pl-11 pr-4 py-4 bg-surface-soft border border-outline/5 rounded-2xl font-sans text-sm focus:outline-none focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
                          value={values.fullName}
                          onChange={(e) => setValues({...values, fullName: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="grid gap-2">
                        <label className="eyebrow text-[9px] opacity-40 ml-1">Teléfono</label>
                        <div className="relative group">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within:text-primary transition-colors" size={16} />
                          <input
                            name="phone"
                            required
                            type="tel"
                            placeholder="+1..."
                            className="w-full pl-11 pr-4 py-4 bg-surface-soft border border-outline/5 rounded-2xl font-sans text-sm focus:outline-none focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
                            value={values.phone}
                            onChange={(e) => setValues({...values, phone: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <label className="eyebrow text-[9px] opacity-40 ml-1">Email</label>
                        <input
                          name="email"
                          type="email"
                          placeholder="nombre@correo.com"
                          className="w-full px-5 py-4 bg-surface-soft border border-outline/5 rounded-2xl font-sans text-sm focus:outline-none focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
                          value={values.email}
                          onChange={(e) => setValues({...values, email: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <label className="eyebrow text-[9px] opacity-40 ml-1 text-primary">Idioma de contacto</label>
                    <div className="relative group">
                      <Languages className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/20 pointer-events-none group-focus-within:text-primary transition-colors" size={16} />
                      <select 
                        name="language"
                        className="w-full pl-11 pr-4 py-4 bg-surface-soft border border-outline/5 rounded-2xl font-sans text-sm appearance-none focus:outline-none focus:border-primary/20 focus:bg-white transition-all"
                        value={values.language}
                        onChange={(e) => setValues({...values, language: e.target.value})}
                      >
                        <option>Español</option>
                        <option>Inglés</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <label className="eyebrow text-[9px] opacity-40 ml-1 text-primary">Fecha de interés (opcional)</label>
                    <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/20 pointer-events-none group-focus-within:text-primary transition-colors" size={16} />
                      <input 
                        name="visitDate"
                        type="date"
                        className="w-full pl-11 pr-4 py-4 bg-surface-soft border border-outline/5 rounded-2xl font-sans text-sm focus:outline-none focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
                        value={values.visitDate}
                        onChange={(e) => setValues({...values, visitDate: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="eyebrow text-[9px] opacity-40 ml-1">Contexto o mensaje</label>
                  <div className="relative group">
                    <MessageSquare className="absolute left-4 top-5 text-primary/20 group-focus-within:text-primary transition-colors" size={16} />
                    <textarea
                      name="message"
                      rows={3}
                      placeholder="Háblanos sobre tu búsqueda o interés específico..."
                      className="w-full pl-11 pr-4 py-4 bg-surface-soft border border-outline/5 rounded-2xl font-sans text-sm focus:outline-none focus:border-primary/20 focus:bg-white transition-all resize-none"
                      value={values.message}
                      onChange={(e) => setValues({...values, message: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid gap-6 pt-2">
                  <label className="flex items-start gap-4 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      name="consentContact"
                      className="mt-1 h-4 w-4 rounded border-outline/20 text-primary focus:ring-primary/20"
                      checked={values.consentContact}
                      onChange={(e) => setValues({...values, consentContact: e.target.checked})}
                    />
                    <span className="text-[11px] leading-relaxed text-muted opacity-60 group-hover:opacity-100 transition-opacity">
                      Autorizo el procesamiento de mis datos para recibir atención personalizada de Carlos Morla Estates y el registro en el CRM de la propiedad.
                    </span>
                  </label>

                  <Button 
                    className="w-full rounded-full py-8 shadow-2xl shadow-primary/10 font-bold tracking-widest uppercase text-xs" 
                    disabled={isPending}
                    type="submit"
                  >
                    {isPending ? "Procesando..." : user ? "Confirmar Interés Inmediato" : "Enviar Datos y Conectar"}
                  </Button>
                  
                  {message && <p className="text-center text-xs text-red-400 font-medium">{message}</p>}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* High-Contrast Boutique Action Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="group relative w-full rounded-[2rem] bg-white border border-primary/10 px-8 py-7 text-primary shadow-2xl shadow-primary/5 transition-all duration-500 hover:border-primary/20 hover:bg-surface-soft active:scale-[0.99]"
      >
        <div className="relative z-10 flex items-center justify-between">
          <div className="text-left">
            <span className="block text-[10px] eyebrow tracking-[0.25em] text-primary/40 mb-1.5 uppercase font-bold">Próximo paso</span>
            <span className="block font-serif text-[1.35rem] italic leading-none text-primary">
              Me interesa esta {propertyType.toLowerCase()}
            </span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/20 transition-transform duration-500 group-hover:scale-110">
            <ArrowRight size={18} className="text-white" />
          </div>
        </div>
      </button>

      {/* Render modal in portal to escape parent transforms */}
      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}
