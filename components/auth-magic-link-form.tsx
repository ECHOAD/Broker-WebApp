"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthMagicLinkFormProps = {
  nextPath: string;
  initialError: string | null;
};

export function AuthMagicLinkForm({ nextPath, initialError }: AuthMagicLinkFormProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(
    initialError === "auth_callback"
      ? "No pudimos confirmar el acceso desde el correo. Intenta solicitar un nuevo enlace."
      : null,
  );
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setMessage(null);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/confirm?next=${encodeURIComponent(nextPath)}`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    setIsPending(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Revisa tu correo. El enlace te devolvera a esta app con la sesion activa.");
  }

  return (
    <div className="auth-shell">
      <Card className="auth-panel border-0 bg-[linear-gradient(145deg,rgba(0,51,54,0.96),rgba(0,75,80,0.86))] text-white shadow-[0_28px_60px_rgba(0,51,54,0.2)]">
        <CardContent className="grid gap-4 p-8">
          <p className="eyebrow">Acceso cliente</p>
          <h1 className="section-title">Ingresa con magic link y guarda tus propiedades.</h1>
          <p className="muted">
            No usamos contrasena en este MVP. El acceso por correo activa sesion, favoritos y rutas
            protegidas.
          </p>
        </CardContent>
      </Card>

      <Card className="auth-card">
        <CardContent className="p-6">
          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-form__field">
              <Label>Email</Label>
              <Input
                name="email"
                placeholder="nombre@correo.com"
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            {message ? <p className="auth-form__message">{message}</p> : null}

            <Button className="auth-form__submit" disabled={isPending} type="submit">
              {isPending ? "Enviando enlace..." : "Enviar magic link"}
            </Button>

            <p className="auth-form__meta">
              Redireccion objetivo despues del acceso: <strong>{nextPath}</strong>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
