import Link from "next/link";
import { BrokerWavePortrait } from "@/components/broker-wave-portrait";
import { FeaturedOpportunitiesSlider } from "@/components/featured-opportunities-slider";
import { HeroPropertyRotator } from "@/components/hero-property-rotator";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { buildWhatsAppUrl } from "@/lib/contact";
import { listPublicProperties } from "@/lib/properties";

export const revalidate = 300;

export default async function HomePage() {
  const publicProperties = await listPublicProperties();
  const featuredProperties = publicProperties.slice(0, 4);
  const heroProperties = featuredProperties.length > 0 ? featuredProperties : publicProperties.slice(0, 1);
  const brokerConversationUrl = buildWhatsAppUrl(
    "Hola Carlos, vengo desde la web y quiero conversar sobre una propiedad.",
  );

  return (
    <>
      <SiteHeader />
      <main className="relative overflow-hidden pb-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[44rem] bg-[radial-gradient(circle_at_top_left,rgba(150,209,214,0.18),transparent_42%),radial-gradient(circle_at_78%_16%,rgba(73,35,6,0.08),transparent_30%)]" />

        <section className="pt-6 pb-14">
          <div className="page-shell">
            <div className="grid gap-6 lg:grid-cols-[0.94fr_1.06fr]">
              <div className="grid gap-6 self-center pt-4 lg:pr-10 animate-fade-in" style={{ animationDelay: '100ms' }}>
                <div className="grid gap-4">
                  <div className="flex items-center gap-4">
                    <span className="h-px w-14 bg-primary/30" />
                    <p className="eyebrow m-0">Broker inmobiliario · Republica Dominicana</p>
                  </div>

                  <h1 className="m-0 max-w-[12ch] font-serif text-[clamp(2.7rem,6vw,5rem)] leading-[0.92] tracking-[-0.04em] text-balance text-primary">
                    Explora mejor. Decide mas claro.
                  </h1>

                  <p className="m-0 max-w-[36rem] text-[1.05rem] leading-[1.9] text-muted text-balance opacity-80">
                    Una entrada simple para ver propiedades con mejor criterio y hablar directo con el
                    broker cuando una oportunidad ya tenga sentido.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild size="lg" className="!text-white [&>a]:!text-white shadow-lg shadow-primary/10 rounded-full px-8">
                    <Link href="/catalogo">Explorar catálogo</Link>
                  </Button>
                  <Button asChild size="lg" variant="secondary" className="bg-white/60 backdrop-blur-sm rounded-full px-8">
                    <a href="#broker">Conocer al broker</a>
                  </Button>
                </div>
              </div>

              <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
                <HeroPropertyRotator properties={heroProperties} />
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-surface-soft/40">
          <div className="page-shell">
            <div className="mb-12">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-primary/40" />
                <p className="eyebrow m-0 text-primary">Seleccion</p>
              </div>
              <h2 className="mt-4 mb-0 font-serif text-[clamp(2.2rem,4vw,3.5rem)] leading-none tracking-[-0.04em]">
                Oportunidades con mejor lectura.
              </h2>
            </div>
            <FeaturedOpportunitiesSlider properties={featuredProperties} />
          </div>
        </section>

        <section className="py-28" id="broker">
          <div className="page-shell">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-24 items-center">
              <div className="relative group">
                <div className="absolute -inset-6 bg-primary/5 rounded-[3rem] blur-3xl group-hover:bg-primary/10 transition-all duration-700" />
                <div className="relative transition-transform duration-500 hover:scale-[1.01]">
                   <BrokerWavePortrait className="w-full max-w-lg mx-auto" imageSrc="/broker-photo-2.jpg" />
                </div>
              </div>

              <div className="grid gap-8">
                <div className="grid gap-5">
                  <div className="flex items-center gap-3">
                    <span className="h-px w-8 bg-primary/40" />
                    <p className="eyebrow m-0 text-primary">El Broker</p>
                  </div>
                  <h2 className="m-0 font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.9] tracking-[-0.05em] text-balance">
                    Carlos Morla. Directo y con criterio.
                  </h2>
                  <p className="m-0 max-w-[34rem] text-lg leading-relaxed text-muted text-balance lg:text-lg">
                    Mi enfoque no es convencerte de todo, sino ayudarte a reconocer rápido cuando una
                    propiedad ya merece una visita, una negociación o tu seguimiento. Sin vueltas innecesarias.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  {brokerConversationUrl && (
                    <Button asChild size="lg" className="!text-white [&>a]:!text-white shadow-xl shadow-primary/20">
                      <a href={brokerConversationUrl} target="_blank" rel="noopener noreferrer">
                        Hablemos por WhatsApp
                      </a>
                    </Button>
                  )}
                  <Button asChild size="lg" variant="secondary" className="bg-white/80 backdrop-blur-sm">
                    <Link href="/catalogo">Explorar catálogo completo</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
