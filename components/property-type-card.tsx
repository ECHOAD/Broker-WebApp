import Link from "next/link";
import { cn } from "@/lib/utils";

type PropertyTypeCardProps = {
  type: {
    slug: string;
    labelEs: string;
    labelEn?: string | null;
  };
  count: number;
  imageHint: string;
  className?: string;
};

export function PropertyTypeCard({ type, count, imageHint, className }: PropertyTypeCardProps) {
  return (
    <Link href={`/catalogo?tipo=${type.slug}`} className={cn("property-type-card", className)}>
      <div className="property-type-card__visual">
        <span className="property-type-card__hint">{imageHint}</span>
      </div>
      <div className="property-type-card__body">
        <h3 className="property-type-card__title">{type.labelEs}</h3>
        <p className="property-type-card__count">
          {count} {count === 1 ? "inmueble" : "inmuebles"}
        </p>
      </div>
    </Link>
  );
}
