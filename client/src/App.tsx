import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollToTop from "./components/ScrollToTop";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useEffect } from "react";

// Public Pages
import Home from "./pages/Home";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Profile from "./pages/Profile";
import BecomeSeller from "./pages/BecomeSeller";
import CreateService from "./pages/CreateService";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Admin from "./pages/Admin";
import PublicProjects from "./pages/PublicProjects";
import ProjectDetail from "./pages/ProjectDetail";
import CreateProject from "./pages/CreateProject";

// Legal & Support Pages
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";
import Help from "./pages/Help";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import HowItWorks from "./pages/HowItWorks";

// Dashboard Pages
import DashboardLayout from "./pages/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import DashboardServices from "./pages/DashboardServices";
import DashboardOrders from "./pages/DashboardOrders";
import DashboardMessages from "./pages/DashboardMessages";
import DashboardSettings from "./pages/DashboardSettings";
import Projects from "./pages/Projects";
import Wallet from "./pages/Wallet";
import Favorites from "./pages/Favorites";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminKYC from "./pages/AdminKYC";
import AdminUsers from "./pages/AdminUsers";

// Dashboard wrapper component
function DashboardPage({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <DashboardLayout title={title}>
      {children}
    </DashboardLayout>
  );
}

// Redirect component for legacy routes
function Redirect({ to }: { to: string }) {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    setLocation(to);
  }, [to, setLocation]);
  
  return null;
}

function Router() {
  return (
    <>
      {/* ScrollToTop ensures page scrolls to top on route change */}
      <ScrollToTop />
      
      <Switch>
        {/* Public Routes */}
        <Route path="/" component={Home} />
        <Route path="/services" component={Services} />
        <Route path="/services/:slug" component={ServiceDetail} />
        <Route path="/profile/:id" component={Profile} />
        <Route path="/become-seller" component={BecomeSeller} />
        
        {/* Auth Routes */}
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/admin" component={Admin} />
        
        {/* Legal & Support Routes */}
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/cookies" component={Cookies} />
        <Route path="/help" component={Help} />
        <Route path="/faq" component={FAQ} />
        <Route path="/contact" component={Contact} />
        <Route path="/how-it-works" component={HowItWorks} />
        
        {/* Public Projects */}
        <Route path="/projects" component={PublicProjects} />
        <Route path="/projects/:id" component={ProjectDetail} />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard">
          <DashboardPage title="Tableau de bord">
            <Dashboard />
          </DashboardPage>
        </Route>
        
        <Route path="/dashboard/services">
          <DashboardPage title="Mes Services">
            <DashboardServices />
          </DashboardPage>
        </Route>
        
        <Route path="/dashboard/services/new">
          <DashboardPage title="Créer un service">
            <CreateService />
          </DashboardPage>
        </Route>
        
        <Route path="/dashboard/services/:id/edit">
          <DashboardPage title="Modifier le service">
            <CreateService />
          </DashboardPage>
        </Route>
        
        <Route path="/dashboard/projects">
          <DashboardPage title="Projets">
            <Projects />
          </DashboardPage>
        </Route>
        
        <Route path="/dashboard/projects/new" component={CreateProject} />
        
        <Route path="/dashboard/projects/:id/edit" component={CreateProject} />
        
        <Route path="/dashboard/orders">
          <DashboardPage title="Commandes">
            <DashboardOrders />
          </DashboardPage>
        </Route>
        
        <Route path="/dashboard/messages">
          <DashboardPage title="Messages">
            <DashboardMessages />
          </DashboardPage>
        </Route>
        
        <Route path="/dashboard/wallet">
          <DashboardPage title="Portefeuille">
            <Wallet />
          </DashboardPage>
        </Route>
        
        <Route path="/dashboard/settings">
          <DashboardPage title="Paramètres">
            <DashboardSettings />
          </DashboardPage>
        </Route>
        
        {/* Favorites Route */}
        <Route path="/favorites">
          <DashboardPage title="Mes Favoris">
            <Favorites />
          </DashboardPage>
        </Route>
        
        {/* Admin Dashboard Routes */}
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/kyc" component={AdminKYC} />
        <Route path="/admin/users" component={AdminUsers} />
        
        {/* Legacy routes - redirect to dashboard */}
        <Route path="/orders">
          <Redirect to="/dashboard/orders" />
        </Route>
        
        <Route path="/messages">
          <Redirect to="/dashboard/messages" />
        </Route>
        
        <Route path="/settings">
          <Redirect to="/dashboard/settings" />
        </Route>
        
        {/* 404 */}
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#FFFDFB',
                border: '1px solid #E8E2D9',
                color: '#1A1714',
              },
            }}
          />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
