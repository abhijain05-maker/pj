import { Layout } from "@/components/layout";
import { Switch, Route, Redirect } from "wouter";
import Dashboard from "./pages/dashboard";
import Students from "./pages/students";
import Attendance from "./pages/attendance";
import Fees from "./pages/fees";
import Parent from "./pages/parent";
import Login from "./pages/login";
import NotFound from "./pages/not-found";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ReactNode } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedAdmin({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Redirect to="/login" />;
  return <Layout>{children}</Layout>;
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Parent} />
      <Route path="/login" component={Login} />
      <Route path="/admin">
        <ProtectedAdmin>
          <Dashboard />
        </ProtectedAdmin>
      </Route>
      <Route path="/admin/students">
        <ProtectedAdmin>
          <Students />
        </ProtectedAdmin>
      </Route>
      <Route path="/admin/attendance">
        <ProtectedAdmin>
          <Attendance />
        </ProtectedAdmin>
      </Route>
      <Route path="/admin/fees">
        <ProtectedAdmin>
          <Fees />
        </ProtectedAdmin>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouter />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
