import { SitePage } from "@/components/layout/site-page";
import { CatalogView } from "@/components/catalog/catalog-view";
import { listPublicProperties } from "@/lib/properties";

export const revalidate = 300;

export default async function CatalogoPage() {
  const properties = await listPublicProperties();

  return (
    <SitePage>
      <CatalogView properties={properties} />
    </SitePage>
  );
}
