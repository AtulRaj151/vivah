import { useState, useEffect, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams, Link } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { UserContext } from "@/App";
import BookingLayout from "@/components/layout/booking-layout";
import { PackageCard } from "@/components/ui/package-card";
import { PhotographerCard } from "@/components/ui/photographer-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CalendarIcon,
  CheckCircle,
  ChevronRight,
  MapPin,
  Package,
  Plus,
  Users,
} from "lucide-react";
import { EVENT_TYPES, POPULAR_LOCATIONS, TIME_SLOTS, formatCurrency } from "@/lib/constants";
import { 
  Package as PackageType, 
  Photographer,
  ServiceCategory, 
  Service,
  insertBookingSchema,
  InsertBooking
} from "@shared/schema";

// Enhanced booking schema with validation
const bookingFormSchema = insertBookingSchema.extend({
  eventDate: z.date({
    required_error: "Please select an event date.",
  }),
  userId: z.number(),
  photographerId: z.number({
    required_error: "Please select a photographer.",
  }),
  eventType: z.string({
    required_error: "Please select an event type.",
  }),
  location: z.string({
    required_error: "Please provide the event location.",
  }).min(3, "Location must be at least 3 characters."),
  services: z.any(), // This will be a JSON object with selected services
  totalAmount: z.number({
    required_error: "Total amount is required.",
  }).min(1, "Total amount must be greater than 0."),
  timeSlot: z.string().optional(),
  specialRequests: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export default function Booking() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const photographerId = params.get("photographer");
  const serviceId = params.get("service");
  const packageId = params.get("package");
  
  const { user, isAuthenticated } = useContext(UserContext);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [signUpMode, setSignUpMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedPhotographer, setSelectedPhotographer] = useState<number | null>(
    photographerId ? parseInt(photographerId) : null
  );
  const [selectedPackage, setSelectedPackage] = useState<number | null>(
    packageId ? parseInt(packageId) : null
  );
  const [selectedServices, setSelectedServices] = useState<Record<number, boolean>>({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [activeTab, setActiveTab] = useState("photographers");

  // Form setup
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      userId: user?.id || 0,
      photographerId: photographerId ? parseInt(photographerId) : 0,
      eventDate: undefined,
      eventType: "",
      location: "",
      services: {},
      totalAmount: 0,
      timeSlot: "",
      specialRequests: "",
    },
  });

  // Fetch photographers
  const { data: photographers, isLoading: loadingPhotographers } = useQuery<Photographer[]>({
    queryKey: ["/api/photographers"],
  });

  // Fetch packages
  const { data: packages, isLoading: loadingPackages } = useQuery<PackageType[]>({
    queryKey: ["/api/packages"],
  });

  // Fetch service categories
  const { data: categories, isLoading: loadingCategories } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/service-categories"],
  });

  // Fetch services
  const { data: services, isLoading: loadingServices } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  // Login form
  const loginForm = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Sign up form
  const signUpForm = useForm({
    defaultValues: {
      username: "",
      password: "",
      email: "",
      fullName: "",
      phone: "",
    },
  });

  // Update form when user changes
  useEffect(() => {
    if (user) {
      form.setValue("userId", user.id);
    }
  }, [user, form]);

  // Update form when photographer is selected
  useEffect(() => {
    if (selectedPhotographer) {
      form.setValue("photographerId", selectedPhotographer);
    }
  }, [selectedPhotographer, form]);

  // Initialize selected services if a service ID is provided
  useEffect(() => {
    if (serviceId && services) {
      const id = parseInt(serviceId);
      const service = services.find(s => s.id === id);
      if (service) {
        const newSelectedServices = { ...selectedServices, [id]: true };
        setSelectedServices(newSelectedServices);
        updateTotalAmount(newSelectedServices, selectedPackage);
        form.setValue("services", newSelectedServices);
        setActiveTab("services");
      }
    }
  }, [serviceId, services]);

  // Initialize selected package if a package ID is provided
  useEffect(() => {
    if (packageId && packages) {
      const id = parseInt(packageId);
      const pkg = packages.find(p => p.id === id);
      if (pkg) {
        setSelectedPackage(id);
        updateTotalAmount(selectedServices, id);
        setActiveTab("packages");
      }
    }
  }, [packageId, packages]);

  // Function to update the total amount based on selected services and package
  const updateTotalAmount = (
    services: Record<number, boolean> = selectedServices,
    packageId: number | null = selectedPackage
  ) => {
    let total = 0;

    // Add cost of selected services
    if (services && Object.keys(services).length > 0) {
      Object.entries(services).forEach(([id, selected]) => {
        if (selected) {
          const serviceId = parseInt(id);
          const service = window.services?.find(s => s.id === serviceId);
          if (service) {
            total += service.price;
          }
        }
      });
    }

    // If package is selected, use package price instead
    if (packageId) {
      const selectedPkg = packages?.find(p => p.id === packageId);
      if (selectedPkg) {
        total = selectedPkg.price;
      }
    }

    setTotalAmount(total);
    form.setValue("totalAmount", total);
  };

  // Handle service selection
  const handleServiceSelect = (serviceId: number, selected: boolean) => {
    const updatedServices = { ...selectedServices, [serviceId]: selected };
    setSelectedServices(updatedServices);
    form.setValue("services", updatedServices);
    updateTotalAmount(updatedServices);
  };

  // Handle package selection
  const handlePackageSelect = (packageId: number) => {
    setSelectedPackage(packageId);
    updateTotalAmount(selectedServices, packageId);
  };

  // Handle photographer selection
  const handlePhotographerSelect = (photographerId: number) => {
    setSelectedPhotographer(photographerId);
    form.setValue("photographerId", photographerId);
    setAvailabilityChecked(false);
  };

  // Check photographer availability
  const checkAvailability = async () => {
    const date = form.getValues("eventDate");
    const photographerId = form.getValues("photographerId");

    if (!date || !photographerId) {
      toast({
        title: "Error",
        description: "Please select a date and photographer",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `/api/availability?photographerId=${photographerId}&date=${date.toISOString()}`
      );
      const data = await response.json();
      setIsAvailable(data.available);
      setAvailabilityChecked(true);
      
      if (data.available) {
        toast({
          title: "Available!",
          description: "The photographer is available on this date.",
        });
      } else {
        toast({
          title: "Not Available",
          description: "The photographer is not available on this date. Please select another date.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      toast({
        title: "Error",
        description: "Failed to check availability. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle login
  const handleLogin = async (values: { username: string; password: string }) => {
    try {
      const response = await apiRequest("POST", "/api/users/login", values);
      const userData = await response.json();

      // Update user context
      if (userData && userData.id) {
        // Set user in context
        if (typeof setUserData === "function") {
          setUserData(userData);
        }
        setIsLoginDialogOpen(false);
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

      // Update user context
      if (userData && userData.id) {
        // Set user in context
        if (typeof setUserData === "function") {
          setUserData(userData);
        }
        setIsLoginDialogOpen(false);
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

  // Handle form submission
  const onSubmit = async (values: BookingFormValues) => {
    if (!isAuthenticated) {
      setIsLoginDialogOpen(true);
      return;
    }

    // Check availability again before submitting
    if (!availabilityChecked || !isAvailable) {
      toast({
        title: "Availability Not Confirmed",
        description: "Please check photographer availability for the selected date.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert services record to array for storage
      const bookingData: InsertBooking = {
        ...values,
        services: JSON.stringify(values.services),
        status: "pending",
        paymentStatus: "pending",
      };

      const response = await apiRequest("POST", "/api/bookings", bookingData);
      const booking = await response.json();

      if (booking && booking.id) {
        toast({
          title: "Booking Created",
          description: "Your booking has been created successfully.",
        });
        // Redirect to checkout
        setLocation(`/checkout/${booking.id}`);
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Helper function for user context (mock implementation)
  const setUserData = (userData: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(userData));
      window.location.reload();
    }
  };

  // Loading state
  const isLoading = loadingPhotographers || loadingPackages || loadingCategories || loadingServices;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <BookingLayout step={1}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">Book Your Wedding Photography</h1>
              <p className="text-neutral-600">Select your preferred photographer, services, and date to create your personalized wedding photography package.</p>
            </div>

            {/* Date and Location Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                  <CardDescription>Select your wedding date and event type</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="eventDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Event Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={`w-full pl-3 text-left font-normal ${
                                  !field.value ? "text-muted-foreground" : ""
                                }`}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Select date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date);
                                setSelectedDate(date);
                                setAvailabilityChecked(false);
                              }}
                              disabled={(date) => {
                                // Disable dates in the past
                                return date < new Date();
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eventType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {EVENT_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Location</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {POPULAR_LOCATIONS.map((location) => (
                              <SelectItem key={location.value} value={location.value}>
                                {location.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timeSlot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Slot</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time slot" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TIME_SLOTS.map((slot) => (
                              <SelectItem key={slot.value} value={slot.value}>
                                {slot.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                  <CardDescription>Your selected services and total</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Photographer:</span>
                    <span className="text-sm">
                      {selectedPhotographer
                        ? photographers?.find(p => p.id === selectedPhotographer)?.name || "Not selected"
                        : "Not selected"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Date:</span>
                    <span className="text-sm">
                      {selectedDate 
                        ? format(selectedDate, "PPP") 
                        : "Not selected"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Package:</span>
                    <span className="text-sm">
                      {selectedPackage
                        ? packages?.find(p => p.id === selectedPackage)?.name || "None"
                        : "None"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Selected Services:</span>
                    <span className="text-sm">
                      {Object.entries(selectedServices).filter(([_, selected]) => selected).length || 0} services
                    </span>
                  </div>
                  
                  <div className="border-t border-neutral-200 pt-4 mt-4">
                    <div className="flex items-center justify-between font-medium">
                      <span>Total Amount:</span>
                      <span className="text-lg text-primary">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Availability check button */}
                  {selectedPhotographer && selectedDate && (
                    <Button 
                      type="button" 
                      onClick={checkAvailability}
                      variant="outline"
                      className="w-full"
                    >
                      Check Availability
                    </Button>
                  )}

                  {availabilityChecked && (
                    <div className={`flex items-center ${isAvailable ? 'text-green-600' : 'text-red-600'} p-2 rounded-md`}>
                      {isAvailable ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          <span className="text-sm">Photographer is available!</span>
                        </>
                      ) : (
                        <>
                          <span className="text-sm">Photographer is not available on this date. Please select another date.</span>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Tabs for Photographers, Packages, and Services */}
            <Tabs 
              defaultValue={activeTab} 
              value={activeTab}
              onValueChange={setActiveTab}
              className="mt-6"
            >
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="photographers">Photographers</TabsTrigger>
                <TabsTrigger value="packages">Packages</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
              </TabsList>

              {/* Photographers Tab */}
              <TabsContent value="photographers" className="space-y-4">
                <h3 className="text-xl font-display font-semibold">Choose Your Photographer</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {photographers?.map((photographer) => (
                    <div 
                      key={photographer.id} 
                      className={`relative ${selectedPhotographer === photographer.id ? 'ring-2 ring-primary rounded-lg' : ''}`}
                      onClick={() => handlePhotographerSelect(photographer.id)}
                    >
                      <PhotographerCard
                        id={photographer.id}
                        name={photographer.name}
                        bio={photographer.bio}
                        profileImage={photographer.profileImage}
                        specialties={photographer.specialties}
                        experience={photographer.experience}
                        location={photographer.location}
                      />
                      {selectedPhotographer === photographer.id && (
                        <div className="absolute top-3 right-3 bg-primary text-white p-2 rounded-full">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Packages Tab */}
              <TabsContent value="packages" className="space-y-4">
                <h3 className="text-xl font-display font-semibold">Select a Package</h3>
                <p className="text-neutral-600 mb-4">Choose one of our carefully curated packages or customize with individual services.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {packages?.map((pkg) => (
                    <div 
                      key={pkg.id} 
                      className={`relative ${selectedPackage === pkg.id ? 'ring-2 ring-primary rounded-lg' : ''}`}
                      onClick={() => handlePackageSelect(pkg.id)}
                    >
                      <PackageCard
                        name={pkg.name}
                        description={pkg.description}
                        price={pkg.price}
                        features={pkg.features}
                        imageUrl={pkg.imageUrl}
                        popular={pkg.popular}
                        onSelect={() => handlePackageSelect(pkg.id)}
                      />
                      {selectedPackage === pkg.id && (
                        <div className="absolute top-3 right-3 bg-primary text-white p-2 rounded-full">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Services Tab */}
              <TabsContent value="services" className="space-y-4">
                <h3 className="text-xl font-display font-semibold">Customize Your Services</h3>
                <p className="text-neutral-600 mb-4">Select individual services to create a custom package.</p>
                
                {categories?.map((category) => (
                  <div key={category.id} className="mb-8">
                    <h4 className="text-lg font-semibold mb-4">{category.name}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {services
                        ?.filter(service => service.categoryId === category.id)
                        .map((service) => (
                          <Card 
                            key={service.id} 
                            className={`cursor-pointer transition-all ${
                              selectedServices[service.id] ? 'border-primary' : ''
                            }`}
                            onClick={() => handleServiceSelect(service.id, !selectedServices[service.id])}
                          >
                            <CardContent className="p-4 flex justify-between items-center">
                              <div className="flex-1">
                                <h5 className="font-medium">{service.name}</h5>
                                <p className="text-sm text-neutral-600">{service.duration} hours</p>
                                <p className="font-semibold text-primary">{formatCurrency(service.price)}</p>
                              </div>
                              <div className={`w-5 h-5 rounded-full border ${
                                selectedServices[service.id] 
                                  ? 'bg-primary border-primary text-white flex items-center justify-center'
                                  : 'border-neutral-300'
                              }`}>
                                {selectedServices[service.id] && <CheckCircle className="h-3 w-3" />}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>

            {/* Special Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Special Requests</CardTitle>
                <CardDescription>Any specific requirements for your event?</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="specialRequests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Requests or Notes</FormLabel>
                      <FormControl>
                        <textarea
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Enter any special requests or notes for your photographer..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                size="lg"
                disabled={!selectedPhotographer || !form.getValues("eventDate") || totalAmount <= 0}
              >
                Continue to Payment
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {/* Login/Sign Up Dialog */}
      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {signUpMode ? "Create an Account" : "Login to Continue"}
            </DialogTitle>
            <DialogDescription>
              {signUpMode
                ? "Please create an account to book our services."
                : "Please login to continue with your booking."}
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
    </BookingLayout>
  );
}
