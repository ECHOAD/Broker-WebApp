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
        setMessage("Error al leer favoritos.");
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
      router.push(`/login?next=/favoritos&pendingFavorite=${encodeURIComponent(propertyId)}`);
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
      if (error) return setMessage("Error al quitar.");
      setIsFavorite(false);
      router.refresh();
      return;
    }

    const { error } = await supabase.from("favorites").insert({
      profile_id: user.id,
      property_id: propertyId,
    });

    setIsPending(false);
    if (error) return setMessage("Error al guardar.");
    setIsFavorite(true);
    router.refresh();
  }

  return (
    <div className="relative group">
      <Button
        className={cn(
          "justify-start transition-all duration-500 active:scale-90 h-10 px-5 border-none shadow-none",
          isFavorite 
            ? "bg-accent/10 text-accent hover:bg-accent/20" 
            : "bg-primary/5 text-primary/40 hover:bg-primary/10 hover:text-primary"
        )}
        disabled={isPending}
        type="button"
        variant="ghost"
        onClick={handleToggle}
      >
        <HeartIcon className={cn(
          "size-4 transition-all duration-500", 
          isFavorite ? "fill-accent stroke-accent scale-110" : "fill-transparent stroke-current"
        )} />
        <span className="text-[10px] font-bold uppercase tracking-widest ml-1">
          {isFavorite ? "Guardado" : "Guardar"}
        </span>
      </Button>
      
      {message && (
        <span className="absolute top-full left-0 mt-2 text-[8px] font-bold uppercase text-accent animate-pulse whitespace-nowrap bg-white px-2 py-1 rounded shadow-sm border border-accent/10 z-20">
          {message}
        </span>
      )}
    </div>
  );
}
