import Link from "next/link";
import { notFound } from "next/navigation";
import { FavoriteToggle } from "@/components/favorite-toggle";
import { PropertyLeadForm } from "@/components/property-lead-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getPublicPropertyBySlug, getPublicPropertySlugs } from "@/lib/properties";
import { ArrowLeft, MapPin, Share2 } from "lucide-react";

type PropertyDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getPublicPropertySlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { slug } = await params;
  const property = await getPublicPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const projectHref = property.projectSlug ? `/proyectos/${property.projectSlug}` : "/catalogo";
  const projectBackLabel = property.projectSlug ? `Volver a ${property.project}` : "Volver al catálogo";

  return (
    <>
      <SiteHeader />
      <main className="relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[60rem] bg-[radial-gradient(circle_at_top_right,rgba(150,209,214,0.12),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(73,35,6,0.05),transparent_40%)]" />

        <div className="page-shell pt-8 pb-20">
          {/* Navigation Bar */}
          <div className="mb-10 flex items-center justify-between animate-fade-in" style={{ animationDelay: '100ms' }}>
            <Link href={projectHref} className="group flex items-center gap-2 eyebrow text-primary/60 hover:text-primary transition-colors">
              <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
              {projectBackLabel}
            </Link>
            <div className="flex items-center gap-4">
               <button className="p-2 rounded-full border border-outline/20 hover:bg-surface-soft transition-colors text-primary/60 hover:text-primary" title="Compartir">
                 <Share2 size={18} />
               </button>
               <FavoriteToggle propertyId={property.id} />
            </div>
          </div>

          <section className="grid lg:grid-cols-[1.3fr_0.7fr] gap-12 lg:gap-20">
            {/* Left Column: Visuals & Narrative */}
            <div className="grid gap-12 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="relative overflow-hidden rounded-[2.5rem] bg-surface-deep shadow-2xl shadow-primary/5">
                <img 
                  src="/property-placeholder.jpg" 
                  alt={property.title}
                  className="w-full aspect-[16/10] object-cover"
                />
                <div className="absolute inset-0 border-[1px] border-white/10 rounded-[2.5rem] pointer-events-none" />
                
                <div className="absolute bottom-8 left-8 flex gap-2">
                  <Badge className="bg-primary text-white border-none px-4 py-2 text-[10px] tracking-widest uppercase">{property.badge}</Badge>
                  <Badge variant="outline" className="bg-white/80 backdrop-blur-md border-none text-primary px-4 py-2 text-[10px] tracking-widest uppercase font-bold">{property.status}</Badge>
                </div>
              </div>

              <div className="grid gap-8 pt-4">
                <div className="grid gap-4">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-primary/45">
                    <Link href="/catalogo" className="transition-colors hover:text-primary">
                      Catálogo
                    </Link>
                    <span>/</span>
                    {property.projectSlug ? (
                      <Link href={projectHref} className="transition-colors hover:text-primary">
                        {property.project}
                      </Link>
                    ) : (
                      <span>{property.project}</span>
                    )}
                    <span>/</span>
                    <span className="text-primary/70">{property.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="h-px w-8 bg-primary/30" />
                    <p className="eyebrow m-0 text-primary/60 tracking-[0.25em]">{property.project}</p>
                  </div>
                  <h1 className="m-0 font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.92] tracking-[-0.04em] text-balance text-primary">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-2 text-muted mt-2">
                    <MapPin size={16} className="text-primary/40" />
                    <span className="text-lg font-serif italic opacity-80">{property.location}</span>
                  </div>
                </div>

                <div className="prose prose-luxury">
                  <p className="font-serif text-[1.4rem] leading-relaxed text-primary/90 italic tracking-tight opacity-90 text-balance mb-8">
                    &ldquo;{property.story}&rdquo;
                  </p>
                  
                  <div className="h-px w-full bg-outline/10 my-10" />
                  
                  <h2 className="eyebrow text-primary/40 tracking-[0.3em] mb-6">La Propuesta</h2>
                  <p className="text-lg leading-relaxed text-muted text-balance mb-6">
                    {property.pitch}
                  </p>
                  <p className="text-base leading-[1.8] text-muted opacity-80">
                    {property.description}
                  </p>
                </div>

                <div className="grid gap-6 pt-8">
                  <h2 className="eyebrow text-primary/40 tracking-[0.3em]">Características destacadas</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {property.highlights.map((feature) => (
                      <div key={feature} className="flex items-start gap-3 p-4 rounded-2xl bg-surface-soft/50 border border-outline/5 hover:border-primary/10 transition-colors group">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/20 mt-2 transition-colors group-hover:bg-primary" />
                        <span className="text-[0.95rem] text-muted font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Ficha & Lead Form */}
            <aside className="animate-fade-in" style={{ animationDelay: '350ms' }}>
              <div className="sticky top-[7.5rem] grid gap-8">
                {property.projectSlug && (
                  <div className="rounded-[2.5rem] border border-outline/10 bg-white/70 p-8 shadow-xl shadow-primary/5 backdrop-blur-xl">
                    <p className="eyebrow m-0 text-primary/40 tracking-[0.3em] mb-4">Contexto del proyecto</p>
                    <h3 className="font-serif text-2xl leading-tight text-primary mb-3">{property.project}</h3>
                    <p className="text-muted leading-relaxed mb-6">
                      Esta propiedad forma parte de un inventario más amplio. Si quieres comparar otras unidades,
                      vuelve al proyecto y sigue la exploración desde ahí.
                    </p>
                    <Button asChild variant="secondary" className="w-full justify-center rounded-full">
                      <Link href={projectHref}>Ver proyecto completo</Link>
                    </Button>
                  </div>
                )}

                {/* Financial Summary Card */}
                <div className="luxury-card p-10 bg-white border-outline/10 shadow-xl shadow-primary/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                  <p className="eyebrow m-0 text-primary/40 tracking-[0.3em] mb-4">Inversión Estimada</p>
                  <h3 className="font-serif text-[2.8rem] leading-none tracking-tight mb-2 text-primary">
                    {property.priceLabel}
                  </h3>
                  <p className="text-muted text-sm italic-serif opacity-80 border-t border-outline/10 pt-6 mt-6">
                    Consultar términos de cierre y financiamiento disponible según proyecto.
                  </p>
                </div>

                {/* Technical Sheet */}
                <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-outline/10 p-8 shadow-xl shadow-primary/5">
                  <h3 className="eyebrow text-primary/40 tracking-[0.3em] mb-8">Ficha Técnica</h3>
                  <div className="grid gap-6">
                    <div className="flex justify-between items-end border-b border-outline/10 pb-4">
                      <span className="text-xs eyebrow opacity-50 lowercase tracking-widest">Área total</span>
                      <span className="font-serif text-lg text-primary">{property.area}</span>
                    </div>
                    {property.bedrooms && (
                      <div className="flex justify-between items-end border-b border-outline/10 pb-4">
                        <span className="text-xs eyebrow opacity-50 lowercase tracking-widest">Dormitorios</span>
                        <span className="font-serif text-lg text-primary">{property.bedrooms}</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex justify-between items-end border-b border-outline/10 pb-4">
                        <span className="text-xs eyebrow opacity-50 lowercase tracking-widest">Baños</span>
                        <span className="font-serif text-lg text-primary">{property.bathrooms}</span>
                      </div>
                    )}
                    {property.parkingSpaces && (
                      <div className="flex justify-between items-end border-b border-outline/10 pb-4">
                        <span className="text-xs eyebrow opacity-50 lowercase tracking-widest">Parqueos</span>
                        <span className="font-serif text-lg text-primary">{property.parkingSpaces}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-end border-b border-outline/10 pb-4">
                      <span className="text-xs eyebrow opacity-50 lowercase tracking-widest">Tipología</span>
                      <span className="font-serif text-lg text-primary">{property.type}</span>
                    </div>
                  </div>
                </div>

                {/* Lead Capture Trigger */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20 rounded-[2.6rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <PropertyLeadForm
                    propertyId={property.id}
                    propertySlug={property.slug}
                    propertyTitle={property.title}
                    propertyType={property.type}
                    whatsappPhone={property.whatsappPhone}
                    user={user}
                  />
                </div>
              </div>
            </aside>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
