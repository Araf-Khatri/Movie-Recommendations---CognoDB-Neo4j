import { Link } from "@tanstack/react-router";
import { Film } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-surface/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <Film className="h-5 w-5 text-primary" />
          <span className="font-display text-lg font-bold tracking-tight">MovieGraph</span>
        </Link>
        <p className="text-sm text-muted-foreground">
          Graph-powered movie discovery. Demo data for now.
        </p>
      </div>
    </footer>
  );
}
