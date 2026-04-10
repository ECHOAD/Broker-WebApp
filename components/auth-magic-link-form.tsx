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
  pendingFavorite?: string | null;
};

export function AuthPasswordForm({ nextPath, initialError, pendingFavorite }: AuthMagicLinkFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(
    initialError === "auth_callback"
      ? "No pudimos confirmar el acceso. Intenta nuevamente."
      : null,
  );
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setMessage(null);

    const supabase = createClient();

    const signInResult = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInResult.error) {
      const userNotFound =
        signInResult.error.message.includes("User not found") ||
        signInResult.error.message.includes("No user found") ||
        signInResult.error.message.includes("Invalid login credentials");

      if (userNotFound) {
        const confirmUrl = new URL(`${window.location.origin}/auth/confirm`);
        confirmUrl.searchParams.set("next", "/favoritos");
        if (pendingFavorite) {
          confirmUrl.searchParams.set("pendingFavorite", pendingFavorite);
        }

        const signUpResult = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: confirmUrl.toString(),
          },
        });

        if (signUpResult.error) {
          if (signUpResult.error.message.includes("already registered")) {
            setMessage("Este correo ya está registrado. Ingresa tu contraseña correctamente.");
          } else if (signUpResult.error.message.toLowerCase().includes("rate limit") || signUpResult.error.message.toLowerCase().includes("email rate")) {
            setMessage("Supabase alcanzó el límite de envío de correos. Espera unos minutos e intenta de nuevo, o confirma tu cuenta desde el panel de administración.");
          } else {
            setMessage(signUpResult.error.message);
          }
          setIsPending(false);
          return;
        }

        // Auto-confirm activo: el signUp devuelve sesión inmediatamente
        const newUser = signUpResult.data.session?.user ?? signUpResult.data.user;
        if (newUser && signUpResult.data.session) {
          if (pendingFavorite) {
            await supabase.from("favorites").upsert({
              profile_id: newUser.id,
              property_id: pendingFavorite,
            });
          }
          window.location.assign(nextPath);
          return;
        }

        // Email confirmation requerida: el favorito viaja en el link del correo
        setMessage(
          "Registro exitoso. Revisa tu correo y haz clic en el enlace para confirmar tu cuenta y ver tus favoritos.",
        );
        setIsPending(false);
        return;
      }

      if (signInResult.error.message.includes("rate limit")) {
        setMessage("Demasiados intentos. Espera unos minutos e intenta de nuevo.");
      } else {
        setMessage("Correo o contraseña incorrectos.");
      }
      setIsPending(false);
      return;
    }

    const user = signInResult.data.user || signInResult.data.session?.user;
    if (!user) {
      setMessage("No pudimos iniciar sesion. Intenta nuevamente.");
      setIsPending(false);
      return;
    }

    if (pendingFavorite) {
      const { error: favoriteError } = await supabase.from("favorites").upsert({
        profile_id: user.id,
        property_id: pendingFavorite,
      });

      if (favoriteError) {
        console.error(favoriteError);
      }
    }

    window.location.assign(nextPath);
  }

  return (
    <div className="auth-shell">
      <Card className="auth-panel border-0 bg-[linear-gradient(145deg,rgba(0,51,54,0.96),rgba(0,75,80,0.86))] text-white shadow-[0_28px_60px_rgba(0,51,54,0.2)]">
        <CardContent className="grid gap-4 p-8">
          <p className="eyebrow">Acceso cliente</p>
          <h1 className="section-title">Ingresa con correo y contraseña.</h1>
          <p className="muted">
            Si no tienes cuenta, te enviaremos un correo para confirmar tu cuenta. Si ya existe, ingresa con tu contraseña.
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

            <label className="auth-form__field">
              <Label>Contraseña</Label>
              <Input
                name="password"
                placeholder="Escribe una contraseña segura"
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {message ? <p className="auth-form__message">{message}</p> : null}

            <Button className="auth-form__submit" disabled={isPending} type="submit">
              {isPending ? "Procesando..." : "Ingresar / Registrar"}
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
