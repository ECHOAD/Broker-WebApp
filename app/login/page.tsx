import { redirect } from "next/navigation";
import { AuthMagicLinkForm } from "@/components/auth-magic-link-form";
import { SitePage } from "@/components/layout/site-page";
import { createClient } from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

function normalizeNextPath(next?: string) {
  if (!next || !next.startsWith("/")) {
    return "/favoritos";
  }

  return next;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, next } = await searchParams;
  const nextPath = normalizeNextPath(next);
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
        <AuthMagicLinkForm initialError={error ?? null} nextPath={nextPath} />
      </section>
    </SitePage>
  );
}
