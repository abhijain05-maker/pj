import { Layout } from "@/components/layout";
import { Switch, Route } from "wouter";
import Dashboard from "./pages/dashboard";
import Students from "./pages/students";
import Attendance from "./pages/attendance";
import Fees from "./pages/fees";
import Parent from "./pages/parent";
import NotFound from "./pages/not-found";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function AppRouter() {
  return (
    <Switch>
      <Route path="/parent" component={Parent} />
      <Route path="/">
        <Layout>
          <Dashboard />
        </Layout>
      </Route>
      <Route path="/students">
        <Layout>
          <Students />
        </Layout>
      </Route>
      <Route path="/attendance">
        <Layout>
          <Attendance />
        </Layout>
      </Route>
      <Route path="/fees">
        <Layout>
          <Fees />
        </Layout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
