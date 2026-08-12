import { Link, useNavigate } from "@tanstack/react-router";
import { Film, LogOut, Menu, Search, Sparkles, User2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useUser } from "@/lib/user-state";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/movies", label: "Movies" },
  { to: "/recommendations", label: "Recommendations" },
] as const;

function NavSearch({ onDone }: { onDone?: () => void }) {
  const [value, setValue] = useState("");
  const navigate = useNavigate();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        navigate({ to: "/search", search: { q: value } });
        onDone?.();
      }}
      className="relative w-full"
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search movies, actors, directors..."
        aria-label="Search"
        className="h-10 rounded-full border-border/70 bg-surface pl-9"
      />
    </form>
  );
}

function UserMenu() {
  const { user, signOut } = useUser();

  if (!user) {
    return (
      <Button asChild size="sm" className="rounded-full">
        <Link to="/login">Sign in</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="User menu"
          className="rounded-full border border-border/70 bg-surface"
        >
          <User2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="truncate">{user.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/recommendations">
            <Sparkles className="mr-2 h-4 w-4" /> Recommendations
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 md:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <Film className="h-6 w-6 shrink-0 text-primary" />
          <span className="truncate font-display text-lg font-extrabold tracking-tight">
            MovieGraph
          </span>
        </Link>

        <nav className="hidden items-center justify-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              activeProps={{ className: "text-primary" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="rounded-full px-3 py-2 text-sm font-medium transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2">
          <div className="hidden w-56 xl:block">
            <NavSearch />
          </div>
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Search"
            className="rounded-full xl:hidden"
          >
            <Link to="/search" search={{ q: "" }}>
              <Search className="h-4 w-4" />
            </Link>
          </Button>
          <div className="hidden sm:block">
            <UserMenu />
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-surface">
              <div className="mt-8 flex flex-col gap-2">
                <NavSearch onDone={() => setOpen(false)} />
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-accent"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-4 sm:hidden">
                  <UserMenu />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
