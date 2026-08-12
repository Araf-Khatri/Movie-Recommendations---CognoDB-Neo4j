import { createFileRoute, Link } from "@tanstack/react-router";
import { Film } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Sign Up Disabled — MovieGraph" },
      { name: "description", content: "MovieGraph no longer uses sign-up forms. Continue with just your email address instead." },
      { property: "og:title", content: "Sign Up Disabled — MovieGraph" },
      { property: "og:description", content: "Continue with just your email address on MovieGraph." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-20">
      <div className="rounded-3xl border border-border/60 bg-card p-8 text-center shadow-[0_30px_80px_-50px_rgba(0,0,0,1)]">
        <Film className="mx-auto h-8 w-8 text-primary" />
        <h1 className="mt-3 font-display text-2xl font-bold">No sign-up needed</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Account creation is disabled. Just enter your email address to continue — your watched
          and liked movies sync automatically.
        </p>
        <Button asChild size="lg" className="mt-6 w-full rounded-full">
          <Link to="/login">Continue with email</Link>
        </Button>
      </div>
    </div>
  );
}
