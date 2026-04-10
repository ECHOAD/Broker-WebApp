"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SitePage } from "@/components/layout/site-page";
import { PropertyCard } from "@/components/property-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageIntro } from "@/components/shared/page-intro";
import { listPublicPropertiesByIds, PropertyCardData } from "@/lib/properties";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export default function FavoritosPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [properties, setProperties] = useState<PropertyCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const loadFavorites = async () => {
      setIsLoading(true);
      setError(null);

      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        setError("No fue posible verificar tu sesión. Intenta de nuevo.");
        setIsLoading(false);
        return;
      }

      if (!currentUser) {
        router.push("/login?next=/favoritos");
        return;
      }

      setUser(currentUser);

      const { data: favorites, error: favoritesError } = await supabase
        .from("favorites")
        .select("property_id")
        .eq("profile_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (favoritesError) {
        setError("No fue posible cargar tus favoritos. Intenta nuevamente.");
        setIsLoading(false);
        return;
      }

      const propertyIds = (favorites ?? []).map((favorite) => favorite.property_id);
      const loadedProperties = await listPublicPropertiesByIds(propertyIds);
      setProperties(loadedProperties);
      setIsLoading(false);
    };

    void loadFavorites();
  }, [router]);

  return (
    <SitePage>
      <section className="catalog-hero">
        <PageIntro
          eyebrow="Favoritos"
          title="Tu shortlist privada vive aqui, no en mensajes perdidos."
          description="Esta colección muestra las propiedades que ya guardaste desde el catálogo."
        />
      </section>

      <section className="section" style={{ paddingTop: "1rem" }}>
        {isLoading ? (
          <p>Cargando tus favoritos...</p>
        ) : error ? (
          <p className="muted">{error}</p>
        ) : properties.length === 0 ? (
          <EmptyState
            eyebrow="Todavía vacío"
            title="Aún no guardaste propiedades en tu shortlist."
            description="Desde el catálogo o la ficha podrás marcar propiedades y volver aquí para compararlas."
          />
        ) : (
          <div className="property-grid">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </section>
    </SitePage>
  );
}
