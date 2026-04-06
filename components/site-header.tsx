"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const syncUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      setUser(currentUser);
    };

    void syncUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    setIsPending(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsPending(false);
    router.refresh();
    router.push("/");
  }

  return (
    <header className="site-header">
      <div className="site-header__bar">
        <Link className="brand-lockup" href="/">
          <span className="brand-lockup__eyebrow">Broker inmobiliario</span>
          <span className="brand-lockup__name">Carlos Realto</span>
        </Link>

        <nav className="site-nav" aria-label="Primary">
          <Link href="/">Inicio</Link>
          <Link href="/catalogo">Catalogo</Link>
          <Link href="/catalogo">Comprar</Link>
          <Link href="/#broker">Broker</Link>
          <Link href="/favoritos">Favoritos</Link>
          {user ? (
            <Button variant="secondary" disabled={isPending} onClick={handleLogout} type="button">
              {isPending ? "Saliendo..." : "Salir"}
            </Button>
          ) : (
            <Button asChild>
              <Link href="/#broker">Contactar</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
