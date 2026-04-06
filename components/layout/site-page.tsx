import * as React from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { cn } from "@/lib/utils";

type SitePageProps = {
  children: React.ReactNode;
  shellClassName?: string;
  mainClassName?: string;
};

export function SitePage({ children, shellClassName, mainClassName }: SitePageProps) {
  return (
    <>
      <SiteHeader />
      <main className={cn("page-shell", shellClassName, mainClassName)}>{children}</main>
      <SiteFooter />
    </>
  );
}
