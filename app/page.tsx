import Link from "next/link";
import { ArrowRight, CheckCircle, MessageCircle } from "lucide-react";
import { PropertyCard } from "@/components/property-card";
import { ProjectCard } from "@/components/project-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildWhatsAppUrl } from "@/lib/contact";
import { getFeaturedPublicProperties, getFeaturedPublicProjects } from "@/lib/properties";

export const revalidate = 300;

export default async function HomePage() {
  const featuredProperties = await getFeaturedPublicProperties(3);
  const featuredProjects = await getFeaturedPublicProjects(3);

  const brokerWhatsApp = buildWhatsAppUrl(
    "Hola Carlos, me interesa conversar sobre propiedades premium en República Dominicana.",
  );

  return (
    <>
      <div className="grain-overlay" />
      <SiteHeader />

      <main className="relative">
        {/* HERO SECTION - Modern with Shapes */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#fbf9f4] via-[#f5f3ee] to-[#fbf9f4] py-16 lg:py-20">

          {/* Floating abstract shapes - Background layer */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Large circle blob - top right */}
            <div className="absolute -top-24 -right-24 w-[32rem] h-[32rem] rounded-full bg-gradient-to-br from-primary/8 to-transparent blur-3xl" />

            {/* Medium organic shape - bottom left */}
            <div className="absolute -bottom-20 -left-20 w-[28rem] h-[28rem] rounded-full bg-gradient-to-tr from-accent/6 to-transparent blur-3xl" />

            {/* Small accent circles */}
            <div className="absolute top-1/3 left-[15%] w-3 h-3 rounded-full bg-primary/20" />
            <div className="absolute top-[45%] right-[20%] w-2 h-2 rounded-full bg-accent/30" />
            <div className="absolute bottom-[30%] left-[25%] w-4 h-4 rounded-full bg-primary/15" />
          </div>

          <div className="page-shell relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

              {/* Hero Copy - Left Side */}
              <div className="grid gap-8 order-2 lg:order-1 animate-fade-in" style={{ animationDelay: "100ms" }}>
                <div className="grid gap-6">
                  <div className="inline-flex items-center gap-3">
                    <span className="h-px w-12 bg-primary/30" />
                    <p className="eyebrow m-0 text-primary">Broker Inmobiliario</p>
                  </div>

                  <h1 className="m-0 font-serif text-[clamp(2.6rem,5.5vw,4.8rem)] leading-[0.92] tracking-[-0.05em] text-balance max-w-[16ch]">
                    Tu broker personal para inversiones
                  </h1>

                  <p className="m-0 text-muted text-[1.1rem] leading-[1.85] max-w-[36rem] text-balance">
                    Acceso exclusivo a propiedades seleccionadas en República Dominicana. Asesoría directa,
                    criterio claro, y transacciones respaldadas por experiencia comprobada.
                  </p>
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap gap-4">
                  {brokerWhatsApp && (
                    <Button
                      asChild
                      size="lg"
                      className="!text-white shadow-lg rounded-full px-8 py-6 text-base font-semibold"
                    >
                      <a href={brokerWhatsApp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5">
                        <MessageCircle className="w-5 h-5" />
                        Conversemos por WhatsApp
                      </a>
                    </Button>
                  )}
                  <Button
                    asChild
                    size="lg"
                    variant="secondary"
                    className="bg-white/80 backdrop-blur-sm rounded-full px-8 py-6 text-base"
                  >
                    <Link href="/catalogo" className="inline-flex items-center gap-2">
                      Explorar proyectos
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Hero Visual - Carlos with Modern Shapes */}
              <div className="relative order-1 lg:order-2 min-h-[32rem] lg:min-h-[40rem] animate-fade-in" style={{ animationDelay: "200ms" }}>

                {/* Floating geometric shapes around image */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Rounded square - top left */}
                  <div className="absolute top-8 left-4 w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/12 to-primary/5 rotate-12 blur-sm" />

                  {/* Circle - top right */}
                  <div className="absolute top-12 right-8 w-20 h-20 rounded-full bg-gradient-to-br from-accent/15 to-accent/5 blur-sm" />

                  {/* Pill shape - middle left */}
                  <div className="absolute top-1/3 -left-6 w-16 h-32 rounded-full bg-gradient-to-b from-primary/10 to-transparent rotate-45" />

                  {/* Small square - bottom right */}
                  <div className="absolute bottom-20 right-12 w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary/12 to-transparent -rotate-12" />

                  {/* Thin line accent - bottom */}
                  <div className="absolute bottom-8 left-12 w-24 h-1 bg-gradient-to-r from-primary/20 to-transparent rounded-full" />
                </div>

                {/* Main image container with subtle elevation */}
                <div className="relative h-full flex items-center justify-center">

                  {/* Shadow base */}
                  <div className="absolute inset-8 bg-primary/5 rounded-[3rem] blur-2xl" />

                  {/* Image wrapper with rounded corners */}
                  <div className="relative w-full max-w-md mx-auto">
                    <img
                      src="/broker-photo-2.jpg"
                      alt="Carlos Morla - Broker Inmobiliario Premium"
                      className="relative w-full h-auto rounded-[2rem] shadow-2xl"
                      style={{ aspectRatio: '3/4' }}
                    />

                    {/* Subtle gradient overlay on image */}
                    <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none" />
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* FEATURED PROPERTIES SECTION */}
        <section className="pt-16 pb-20 lg:pb-28 bg-[#fbf9f4]">
          <div className="page-shell">
            {/* Section Header */}
            <div className="mb-12 lg:mb-16 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-3 mb-4">
                <span className="h-px w-8 bg-primary/30" />
                <p className="eyebrow m-0 text-primary">Selección Dentro De Proyectos</p>
                <span className="h-px w-8 bg-primary/30" />
              </div>
              <h2 className="m-0 font-serif text-[clamp(2.5rem,5vw,4rem)] leading-[0.95] tracking-[-0.04em] mb-4">
                Oportunidades que se descubren desde su proyecto
              </h2>
              <p className="text-lg text-muted leading-relaxed max-w-2xl mx-auto">
                Mostramos algunas unidades para abrir apetito, pero la exploración correcta empieza
                por el desarrollo: contexto, ubicación, inventario y luego la propiedad puntual.
              </p>
            </div>

            {/* Properties Grid */}
            {featuredProperties.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 mb-12">
                  {featuredProperties.map((property) => (
                    <div
                      key={property.id}
                      className="hover-lift animate-fade-in"
                      style={{ animationDelay: `${100 * featuredProperties.indexOf(property)}ms` }}
                    >
                      <PropertyCard property={property} navigationMode="project" />
                    </div>
                  ))}
                </div>

                {/* View All CTA */}
                <div className="text-center pt-8">
                  <Button asChild size="lg" className="!text-white shadow-lg rounded-full px-10">
                    <Link href="/catalogo" className="inline-flex items-center gap-2.5">
                      Explorar todos los proyectos
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted text-lg">El directorio de proyectos se actualizará próximamente con nuevas oportunidades.</p>
                {brokerWhatsApp && (
                  <Button asChild size="lg" className="mt-6 !text-white">
                    <a href={brokerWhatsApp} target="_blank" rel="noopener noreferrer">
                      Consultar disponibilidad
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* FEATURED PROJECTS SECTION */}
        {featuredProjects.length > 0 && (
          <section id="proyectos-destacados" className="py-20 lg:py-28 bg-white">
            <div className="page-shell">
              <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-3 mb-4">
                    <span className="h-px w-8 bg-primary/30" />
                    <p className="eyebrow m-0 text-primary">Nuevos Desarrollos</p>
                  </div>
                  <h2 className="m-0 font-serif text-[clamp(2.5rem,5vw,4rem)] leading-[0.95] tracking-[-0.04em] mb-4">
                    Proyectos en preventa y construcción
                  </h2>
                  <p className="text-lg text-muted leading-relaxed">
                    Explora los proyectos inmobiliarios más ambiciosos de la zona, seleccionados por su ubicación estratégica y calidad arquitectónica.
                  </p>
                </div>
                <Button asChild variant="tertiary" size="lg" className="group">
                  <Link href="/catalogo" className="inline-flex items-center gap-2">
                    Abrir directorio completo
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                {featuredProjects.map((project) => (
                  <div 
                    key={project.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${150 * featuredProjects.indexOf(project)}ms` }}
                  >
                    <ProjectCard project={project} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* WHY CARLOS SECTION */}
        <section className="py-20 lg:py-28 bg-surface-soft/40">
          <div className="page-shell">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
              {/* Image Side */}
              <div className="relative order-2 lg:order-1">
                <div className="absolute -inset-6 bg-primary/5 rounded-[3rem] blur-3xl" />
                <div className="relative luxury-card p-8 lg:p-10">
                  <div className="space-y-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-2">
                      <CheckCircle className="w-8 h-8 text-primary fill-primary" />
                    </div>
                    <h3 className="font-serif text-2xl lg:text-3xl leading-tight">
                      Sin presión. Con claridad.
                    </h3>
                    <p className="text-muted leading-relaxed text-base lg:text-lg">
                      Mi rol no es convencerte de todo lo que veas. Es ayudarte a reconocer rápido
                      cuándo una propiedad merece tu atención, una visita, o una negociación seria.
                    </p>
                  </div>
                </div>
              </div>

              {/* Copy Side */}
              <div className="grid gap-8 order-1 lg:order-2">
                <div className="grid gap-5">
                  <div className="inline-flex items-center gap-3">
                    <span className="h-px w-8 bg-primary/40" />
                    <p className="eyebrow m-0 text-primary">El Enfoque</p>
                  </div>
                  <h2 className="m-0 font-serif text-[clamp(2.5rem,5vw,4.2rem)] leading-[0.92] tracking-[-0.04em] max-w-[16ch]">
                    Por qué trabajar conmigo
                  </h2>
                </div>

                {/* Benefits List */}
                <div className="grid gap-5">
                  {[
                    {
                      title: "Inventario curado",
                      description: "Solo propiedades que cumplen estándares verificados de ubicación, construcción y documentación."
                    },
                    {
                      title: "Comunicación directa",
                      description: "Hablas conmigo, no con asistentes. Respuestas claras sin intermediarios innecesarios."
                    },
                    {
                      title: "Proceso transparente",
                      description: "Cada paso explicado. Cada costo desglosado. Sin sorpresas en el camino."
                    },
                    {
                      title: "Red de confianza",
                      description: "Acceso a abogados, inspectores y financieros con track record comprobado."
                    },
                  ].map((benefit, index) => (
                    <div key={index} className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                        <CheckCircle className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg mb-1">{benefit.title}</h4>
                        <p className="text-muted leading-relaxed">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  {brokerWhatsApp && (
                    <Button asChild size="lg" className="!text-white shadow-lg rounded-full">
                      <a href={brokerWhatsApp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5">
                        <MessageCircle className="w-5 h-5" />
                        Iniciemos conversación
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="py-20 lg:py-24">
          <div className="page-shell">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#003336] via-[#004b50] to-[#002e30] text-white p-12 lg:p-16">
              {/* Background decoration */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[30rem] h-[30rem] rounded-full bg-[radial-gradient(circle,rgba(225,162,124,0.18),transparent_70%)] blur-3xl" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[28rem] h-[28rem] rounded-full bg-[radial-gradient(circle,rgba(150,209,214,0.14),transparent_70%)] blur-3xl" />
              </div>

              <div className="relative z-10 text-center max-w-3xl mx-auto grid gap-8">
                <div className="grid gap-5">
                  <Badge variant="chip" className="mx-auto bg-white/10 text-white border-white/20">
                    Listo para comenzar
                  </Badge>
                  <h2 className="m-0 font-serif text-[clamp(2.5rem,5vw,4rem)] leading-[0.95] tracking-[-0.04em]">
                    Hablemos de tu próxima inversión
                  </h2>
                  <p className="text-white/85 text-lg leading-relaxed max-w-2xl mx-auto">
                    Ya sea que busques tu primera propiedad en República Dominicana o expandir tu portafolio,
                    el primer paso es una conversación sin compromiso.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                  {brokerWhatsApp && (
                    <Button
                      asChild
                      size="lg"
                      className="bg-white text-primary hover:bg-white/90 shadow-2xl shadow-black/20 rounded-full px-10 py-6 text-base font-semibold w-full sm:w-auto"
                    >
                      <a href={brokerWhatsApp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5">
                        <MessageCircle className="w-5 h-5" />
                        Contactar por WhatsApp
                      </a>
                    </Button>
                  )}
                  <Button
                    asChild
                    size="lg"
                    variant="secondary"
                    className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/15 rounded-full px-10 py-6 text-base w-full sm:w-auto"
                  >
                    <Link href="/catalogo">Explorar proyectos</Link>
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
