import { redirect } from "next/navigation";
import { AuthPasswordForm } from "@/components/auth-magic-link-form";
import { SitePage } from "@/components/layout/site-page";
import { createClient } from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
    pendingFavorite?: string;
  }>;
};

function normalizeNextPath(next?: string, pendingFavorite?: string) {
  if (pendingFavorite) {
    return "/favoritos";
  }

  if (!next || !next.startsWith("/")) {
    return "/favoritos";
  }

  return next;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, next, pendingFavorite } = await searchParams;
  const nextPath = normalizeNextPath(next, pendingFavorite);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(nextPath);
  }

  return (
    <SitePage>
      <section className="section">
        <AuthPasswordForm
          initialError={error ?? null}
          nextPath={nextPath}
          pendingFavorite={pendingFavorite ?? null}
        />
      </section>
    </SitePage>
  );
}
