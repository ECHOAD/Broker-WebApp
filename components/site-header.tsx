"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Heart, House, Search, UserRound } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const syncUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      setUser(currentUser);
      setIsAdmin(currentUser?.app_metadata?.role === "broker_admin");
    };

    void syncUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsAdmin(currentUser?.app_metadata?.role === "broker_admin");
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const syncScrollState = () => {
      setIsScrolled(window.scrollY > 12);
    };

    syncScrollState();
    window.addEventListener("scroll", syncScrollState, { passive: true });

    return () => {
      window.removeEventListener("scroll", syncScrollState);
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

  const navLinkClass = (isActive: boolean) =>
    `site-nav__link${isActive ? " site-nav__link--active" : ""}`;
  const mobileNavLinkClass = (isActive: boolean) =>
    `site-mobile-nav__link${isActive ? " site-mobile-nav__link--active" : ""}`;

  const mobileNavItems = [
    { href: "/", label: "Inicio", active: pathname === "/", icon: House },
    { href: "/catalogo", label: "Catalogo", active: pathname?.startsWith("/catalogo") ?? false, icon: Search },
    ...(isAdmin ? [{ href: "/admin", label: "Admin", active: pathname?.startsWith("/admin") ?? false, icon: UserRound }] : []),
    {
      href: user ? "/favoritos" : "/login",
      label: user ? "Favoritos" : "Sesion",
      active: user ? pathname?.startsWith("/favoritos") ?? false : pathname?.startsWith("/login") ?? false,
      icon: user ? Heart : UserRound,
    },
  ];

  return (
    <>
    <header className={`site-header border-b border-transparent transition-all duration-500 ${isScrolled ? " site-header--scrolled border-outline/10" : ""}`}>
      <div className={`site-header__bar bg-transparent backdrop-blur-0 transition-all duration-500 ${isScrolled ? " !bg-white/80 !backdrop-blur-xl" : ""}`}>
        <div className="site-header__inner">
          <div className="site-header__brand">
            <Link className="brand-lockup group" href="/">
              <span className="brand-lockup__eyebrow transition-colors group-hover:text-primary">Carlos Morla</span>
              <span className="brand-lockup__name">
                <span className="brand-lockup__name-main">Realto</span>
                <span className="brand-lockup__name-dot animate-pulse" />
                <span className="brand-lockup__name-accent italic font-serif lowercase tracking-normal text-primary/40">estates</span>
              </span>
            </Link>

            <div className="site-header__locale flex items-center gap-2" aria-hidden="true">
              <div className="w-1 h-1 rounded-full bg-primary/20" />
              <span className="text-[10px] eyebrow tracking-[0.2em] opacity-40">RD</span>
            </div>
          </div>

          <nav className="site-nav" aria-label="Primary">
            <Link className={navLinkClass(pathname === "/")} href="/">
              Inicio
            </Link>
            <Link className={navLinkClass(pathname?.startsWith("/catalogo") ?? false)} href="/catalogo">
              Catálogo
            </Link>
            <Link className="site-nav__link hover-lift" href="/#broker">
              El Broker
            </Link>

            {isAdmin && (
              <Link className={navLinkClass(pathname?.startsWith("/admin") ?? false)} href="/admin">
                Panel Admin
              </Link>
            )}

            {user ? (
              <>
                <Link
                  className={navLinkClass(pathname?.startsWith("/favoritos") ?? false)}
                  href="/favoritos"
                >
                  Favoritos
                </Link>
                <Button
                  className="site-header__action rounded-full px-6"
                  variant="secondary"
                  disabled={isPending}
                  onClick={handleLogout}
                  type="button"
                >
                  {isPending ? "..." : "Salir"}
                </Button>
              </>
            ) : (
              <Button asChild className="site-header__action rounded-full px-8 shadow-lg shadow-primary/10">
                <Link href="/login">Acceso</Link>
              </Button>
            )}
          </nav>

          <div className="site-header__mobile-action">
            {user ? (
              <Button variant="secondary" disabled={isPending} onClick={handleLogout} type="button">
                {isPending ? "Saliendo..." : "Salir"}
              </Button>
            ) : (
              <Button asChild>
                <Link href="/login">Iniciar sesion</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <nav className="site-mobile-nav" aria-label="Mobile">
        <div className="site-mobile-nav__inner">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link key={item.label} className={mobileNavLinkClass(item.active)} href={item.href}>
                <Icon size={18} strokeWidth={1.9} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
    <div className="site-header__spacer" aria-hidden="true" />
    </>
  );
}
