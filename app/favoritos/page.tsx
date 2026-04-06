import { redirect } from "next/navigation";
import { SitePage } from "@/components/layout/site-page";
import { PropertyCard } from "@/components/property-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageIntro } from "@/components/shared/page-intro";
import { listPublicPropertiesByIds } from "@/lib/properties";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function FavoritosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/favoritos");
  }

  const { data: favorites, error } = await supabase
    .from("favorites")
    .select("property_id")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const properties = await listPublicPropertiesByIds(
    (favorites ?? []).map((favorite) => favorite.property_id),
  );
  const safeProperties = properties.filter(
    (property): property is NonNullable<(typeof properties)[number]> => property !== undefined,
  );

  return (
    <SitePage>
      <section className="catalog-hero">
        <PageIntro
          eyebrow="Favoritos"
          title="Tu shortlist privada vive aqui, no en mensajes perdidos."
          description="Esta coleccion usa sesion real de Supabase y respeta RLS por usuario sobre `favorites`."
        />
      </section>

      <section className="section" style={{ paddingTop: "1rem" }}>
        {safeProperties.length === 0 ? (
          <EmptyState
            eyebrow="Todavia vacio"
            title="Aun no guardaste propiedades en tu shortlist."
            description="Desde el catalogo o la ficha podras marcar propiedades y volver aqui para compararlas."
          />
        ) : (
          <div className="property-grid">
            {safeProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </section>
    </SitePage>
  );
}
