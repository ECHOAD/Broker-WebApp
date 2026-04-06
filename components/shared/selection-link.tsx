import Link from "next/link";
import * as React from "react";
import { cn } from "@/lib/utils";

type SelectionLinkProps = {
  href: string;
  active?: boolean;
  title: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
};

export function SelectionLink({ href, active = false, title, description, meta }: SelectionLinkProps) {
  return (
    <Link className={cn("admin-lead-link", active && "is-active")} href={href}>
      <div>
        <strong>{title}</strong>
        {description ? <p className="muted" style={{ margin: "0.25rem 0 0" }}>{description}</p> : null}
      </div>
      {meta ? <div className="admin-list-item__meta">{meta}</div> : null}
    </Link>
  );
}
