"use client";

import { HeartIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FavoriteToggleProps = {
  propertyId: string;
};

export function FavoriteToggle({ propertyId }: FavoriteToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const syncFavoriteState = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      setUser(currentUser);
      setMessage(null);

      if (!currentUser) {
        setIsFavorite(false);
        return;
      }

      const { data, error } = await supabase
        .from("favorites")
        .select("property_id")
        .eq("profile_id", currentUser.id)
        .eq("property_id", propertyId)
        .maybeSingle();

      if (error) {
        setMessage("No pudimos leer tus favoritos.");
        return;
      }

      setIsFavorite(Boolean(data));
    };

    void syncFavoriteState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void syncFavoriteState();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [propertyId]);

  async function handleToggle() {
    const supabase = createClient();

    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    setIsPending(true);
    setMessage(null);

    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("profile_id", user.id)
        .eq("property_id", propertyId);

      setIsPending(false);

      if (error) {
        setMessage("No pudimos quitar este favorito.");
        return;
      }

      setIsFavorite(false);
      router.refresh();
      return;
    }

    const { error } = await supabase.from("favorites").insert({
      profile_id: user.id,
      property_id: propertyId,
    });

    setIsPending(false);

    if (error) {
      setMessage("No pudimos guardar este favorito.");
      return;
    }

    setIsFavorite(true);
    router.refresh();
  }

  return (
    <div className="favorite-stack">
      <Button
        className={cn(
          "justify-start",
          isFavorite && "border-primary/20 bg-primary/10 text-primary",
        )}
        disabled={isPending}
        type="button"
        variant="secondary"
        onClick={handleToggle}
      >
        <HeartIcon className={cn("size-4", isFavorite && "fill-current")} />
        <span>{isFavorite ? "Guardado" : "Guardar"}</span>
      </Button>
      {message ? <small className="favorite-toggle__message">{message}</small> : null}
    </div>
  );
}
