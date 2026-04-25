import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Bus, Users, CalendarCheck, CreditCard, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: Bus },
    { href: "/students", label: "Students", icon: Users },
    { href: "/attendance", label: "Attendance", icon: CalendarCheck },
    { href: "/fees", label: "Fees", icon: CreditCard },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-sidebar border-b md:border-b-0 md:border-r border-sidebar-border text-sidebar-foreground flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground p-2 rounded-lg">
            <Bus className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">RouteMate</h1>
        </div>

        <nav className="flex-1 px-4 pb-4 space-y-1 overflow-y-auto flex md:flex-col gap-2 md:gap-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors cursor-pointer",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="hidden md:block">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <Link href="/parent">
            <div className="flex items-center gap-3 px-3 py-3 rounded-md bg-secondary/10 text-secondary-foreground hover:bg-secondary/20 transition-colors cursor-pointer border border-secondary/20 shadow-sm">
              <Search className="w-5 h-5" />
              <div className="hidden md:block text-sm">
                <p className="font-semibold leading-none mb-1">Parent View</p>
                <p className="text-xs opacity-80">Public lookup portal</p>
              </div>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
