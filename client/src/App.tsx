import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Photographers from "@/pages/photographers";
import Photographer from "@/pages/photographer";
import Services from "@/pages/services";
import Booking from "@/pages/booking";
import Checkout from "@/pages/checkout";
import Confirmation from "@/pages/confirmation";
import Dashboard from "@/pages/dashboard";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useState, useEffect, createContext } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";

// Create user context
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
}

export interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/photographers" component={Photographers} />
      <Route path="/photographer/:id" component={Photographer} />
      <Route path="/services" component={Services} />
      <Route path="/booking" component={Booking} />
      <Route path="/checkout/:bookingId" component={Checkout} />
      <Route path="/confirmation/:bookingId" component={Confirmation} />
      <Route path="/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  
  // Check for stored user on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Update localStorage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const userContextValue = {
    user,
    setUser,
    isAuthenticated: !!user
  };

  return (
    <QueryClientProvider client={queryClient}>
      <UserContext.Provider value={userContextValue}>
        <TooltipProvider>
          <div className="flex flex-col min-h-screen bg-neutral-50">
            <Header />
            <main className="flex-grow">
              <Router />
            </main>
            <Footer />
          </div>
          <Toaster />
        </TooltipProvider>
      </UserContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
