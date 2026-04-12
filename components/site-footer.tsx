import Link from "next/link";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="page-shell mt-32 pb-16">
      <div className="relative border-t border-primary/10 pt-16 overflow-hidden">
        {/* Decorative Watermark - Large scale editorial type */}
        <div className="absolute -bottom-10 -left-10 pointer-events-none select-none">
          <span className="font-serif text-[12rem] leading-none text-primary/[0.02] italic tracking-tighter">
            Realto
          </span>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-16 md:gap-24">
          <div className="flex flex-col justify-between gap-12">
            <div className="grid gap-6">
              <Link className="brand-lockup inline-flex" href="/">
                <span className="brand-lockup__name text-2xl">
                  <span className="brand-lockup__name-main">Carlos Morla</span>
                  <span className="brand-lockup__name-dot bg-primary/20" />
                </span>
              </Link>
              <p className="eyebrow m-0 opacity-40 text-[10px] tracking-[0.3em] max-w-sm leading-relaxed">
                Borker inmobiliario | inversión en República Dominicana.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] eyebrow tracking-[0.2em] opacity-60">Disponible para consultas</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="grid gap-6">
              <p className="eyebrow m-0 text-primary opacity-30 text-[9px]">Navegación</p>
              <nav className="grid gap-4">
                <Link href="/catalogo" className="font-serif italic text-lg hover:text-primary/60 transition-colors">Catálogo</Link>
                <Link href="/favoritos" className="font-serif italic text-lg hover:text-primary/60 transition-colors">Favoritos</Link>
                <Link href="/" className="font-serif italic text-lg hover:text-primary/60 transition-colors">Inicio</Link>
              </nav>
            </div>

            <div className="grid gap-6">
              <p className="eyebrow m-0 text-primary opacity-30 text-[9px]">Contacto</p>
              <div className="grid gap-4">
                <a href="https://wa.me/your-number" target="_blank" rel="noopener noreferrer" className="font-serif italic text-lg hover:text-primary/60 transition-colors">WhatsApp</a>
                <span className="font-serif italic text-lg opacity-40">Instagram</span>
                <span className="font-serif italic text-lg opacity-40">Email</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 pt-8 flex flex-col md:flex-row justify-between items-end gap-4 border-t border-primary/[0.05]">
          <p className="text-[9px] eyebrow opacity-20 m-0">© {currentYear} Realto Estates · Todos los derechos reservados</p>

        </div>
      </div>
    </footer>
  );
}
