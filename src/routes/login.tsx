import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Film } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/lib/user-state";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — MovieGraph" },
      { name: "description", content: "Continue to MovieGraph with just your email address to track movies and get personalized recommendations." },
      { property: "og:title", content: "Sign In — MovieGraph" },
      { property: "og:description", content: "Access your watchlist and personalized picks with just your email." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn } = useUser();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-20">
      <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-[0_30px_80px_-50px_rgba(0,0,0,1)]">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Film className="h-8 w-8 text-primary" />
          <h1 className="font-display text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to continue. No password needed.
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const value = email.trim().toLowerCase();
            if (!value) return;
            signIn({ name: value.split("@")[0] || "Cinephile", email: value });
            toast.success("Signed in");
            navigate({ to: "/" });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" size="lg" className="w-full rounded-full">
            Continue
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Your email is stored on this device and used to sync your watched and liked movies.
        </p>
      </div>
    </div>
  );
}
