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
  const [loginDialogOpen, setLoginDialogOpen] = useState(true);
  const [roleDialogOpen, setRoleDialogOpen] = useState(true);
  const [signUpMode, setSignUpMode] = useState(false);
  const { toast } = useToast();

  // Login form setup
  const loginForm = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Sign up form setup
  const signUpForm = useForm({
    defaultValues: {
      username: "",
      password: "",
      email: "",
      fullName: "",
      phone: "",
      type: "customer", // Default type
    },
  });
  
  // Check for stored user on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setLoginDialogOpen(false);
        setRoleDialogOpen(false);
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
  
  // Handle login
  const handleLogin = async (values: { username: string; password: string }) => {
    try {
      const response = await apiRequest("POST", "/api/users/login", values);
      const userData = await response.json();

      if (userData && userData.id) {
        setUser(userData);
        setLoginDialogOpen(false);
        toast({
          title: "Success",
          description: "You've successfully logged in.",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "Invalid username or password. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle sign up
  const handleSignUp = async (values: any) => {
    try {
      const response = await apiRequest("POST", "/api/users/register", values);
      const userData = await response.json();

      if (userData && userData.id) {
        setUser(userData);
        setLoginDialogOpen(false);
        toast({
          title: "Success",
          description: "Your account has been created successfully.",
        });
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Select user role (admin or customer)
  const selectRole = (role: string) => {
    signUpForm.setValue("type", role);
    setRoleDialogOpen(false);
    setLoginDialogOpen(true);
  };

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
          
          {/* Role Selection Dialog */}
          <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Select Your Role</DialogTitle>
                <DialogDescription>
                  Please select your role to continue.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4 py-4">
                <Button 
                  onClick={() => selectRole("customer")}
                  className="h-24 text-lg flex flex-col space-y-2"
                >
                  <span className="text-xl">Customer</span>
                  <span className="text-xs">Book photography services</span>
                </Button>
                <Button 
                  onClick={() => selectRole("admin")}
                  variant="outline"
                  className="h-24 text-lg flex flex-col space-y-2"
                >
                  <span className="text-xl">Admin</span>
                  <span className="text-xs">Manage the platform</span>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Login/Sign Up Dialog */}
          <Dialog open={loginDialogOpen && !roleDialogOpen} onOpenChange={setLoginDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {signUpMode ? "Create an Account" : "Login to Continue"}
                </DialogTitle>
                <DialogDescription>
                  {signUpMode
                    ? "Please create an account to use our services."
                    : "Please login to continue."}
                </DialogDescription>
              </DialogHeader>

              {signUpMode ? (
                <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" {...signUpForm.register("fullName")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" {...signUpForm.register("phone")} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...signUpForm.register("email")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" {...signUpForm.register("username")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" {...signUpForm.register("password")} />
                  </div>

                  <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
                    <Button type="button" variant="outline" onClick={() => setSignUpMode(false)}>
                      Already have an account? Login
                    </Button>
                    <Button type="submit">Sign Up</Button>
                  </DialogFooter>
                </form>
              ) : (
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" {...loginForm.register("username")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" {...loginForm.register("password")} />
                  </div>

                  <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
                    <Button type="button" variant="outline" onClick={() => setSignUpMode(true)}>
                      Don't have an account? Sign Up
                    </Button>
                    <Button type="submit">Login</Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>
          
          <Toaster />
        </TooltipProvider>
      </UserContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
