import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  BookOpen,
  CalendarDays,
  CalendarClock,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
  TrendingUp,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/sonner";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/subjects", label: "Subjects", icon: BookOpen },
  { to: "/assignments", label: "Assignments", icon: ClipboardList },
  { to: "/exams", label: "Exams", icon: CalendarClock },
  { to: "/planner", label: "Planner", icon: CalendarDays },
  { to: "/progress", label: "Progress", icon: TrendingUp },
];

function Brand() {
  return (
    <a href="/" className="flex items-center gap-2.5 px-1" aria-label="School Tracker home">
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <GraduationCap className="size-5" aria-hidden />
      </span>
      <span>
        <span className="block font-display text-[17px] font-bold leading-none tracking-tight">
          School Tracker
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          semester notebook
        </span>
      </span>
    </a>
  );
}

function NavList() {
  return (
    <nav className="flex flex-col gap-1" aria-label="Main">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            )
          }
        >
          {({ isActive }) => (
            <>
              <item.icon
                className={cn("size-[18px]", isActive && "text-primary")}
                aria-hidden
              />
              {item.label}
              {isActive && (
                <span
                  aria-hidden
                  className="ml-auto size-1.5 rounded-full bg-primary"
                />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export default function AppLayout() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <div className="min-h-dvh">
      {/* Ruled paper sheet */}
      <div className="mx-auto flex min-h-dvh max-w-[1200px] flex-col lg:flex-row">
        <aside
          id="sidebar"
          className="sticky top-0 z-30 hidden shrink-0 border-r bg-sidebar/80 px-4 py-6 backdrop-blur lg:flex lg:w-60 lg:flex-col lg:justify-between"
        >
          <div className="flex flex-col gap-8">
            <Brand />
            <NavList />
          </div>
          <div className="flex flex-col gap-3">
            {user && (
              <div className="flex items-center gap-2.5 rounded-lg px-3 py-2">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">
                  {user.username.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{user.username}</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    student
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {theme === "dark" ? (
                <Sun className="size-[18px]" aria-hidden />
              ) : (
                <Moon className="size-[18px]" aria-hidden />
              )}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="size-[18px]" aria-hidden />
              Log out
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile header */}
          <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/85 px-4 py-3 backdrop-blur lg:hidden">
            <Brand />
            <div className="flex items-center gap-2">
              {user && (
                <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              )}
              <button
                onClick={toggleTheme}
                className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="size-[18px]" aria-hidden />
                ) : (
                  <Moon className="size-[18px]" aria-hidden />
                )}
              </button>
              <button
                onClick={logout}
                className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground"
                aria-label="Log out"
              >
                <LogOut className="size-[18px]" aria-hidden />
              </button>
            </div>
          </header>

          <main className="flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-10">
            <RouteTransition key={location.pathname}>
              <Outlet />
            </RouteTransition>
          </main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t bg-background/92 py-2 backdrop-blur lg:hidden"
        aria-label="Main mobile"
      >
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex min-w-[52px] flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
            aria-label={item.label}
          >
            <item.icon className="size-5" aria-hidden />
            {item.label.split(" ")[0]}
          </NavLink>
        ))}
      </nav>

      <Toaster position="top-center" richColors />
    </div>
  );
}

function RouteTransition({ children, ...props }) {
  return <PageWrap {...props}>{children}</PageWrap>;
}

function PageWrap({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;
    const tween = gsap.fromTo(
      ref.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
    );
    return () => tween.kill();
  }, []);
  return (
    <div ref={ref}>
      {children}
    </div>
  );
}