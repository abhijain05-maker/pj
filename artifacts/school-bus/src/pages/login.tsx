import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Bus, Lock, User, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const ok = login(username.trim(), password);
    if (ok) {
      setLocation("/admin");
    } else {
      setError("Incorrect username or password");
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#fdfbf7] flex flex-col">
      <div className="bg-primary text-primary-foreground py-6 px-4 md:px-8 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Bus className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Route Mate Admin</h1>
              <p className="text-primary-foreground/80 text-xs font-medium">Sign in to manage operations</p>
            </div>
          </div>
          <Link href="/">
            <button className="flex items-center gap-2 text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Parent View
            </button>
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md border border-border/50">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-3 rounded-full">
              <Lock className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-foreground">Admin Login</h2>
          <p className="text-center text-sm text-muted-foreground mt-1 mb-6">
            Restricted access for school staff
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="pl-9"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
