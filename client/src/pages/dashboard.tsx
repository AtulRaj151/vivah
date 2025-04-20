import { useState, useEffect, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { UserContext } from "@/App";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Booking, Photographer, Service } from "@shared/schema";
import { 
  Calendar, 
  Camera, 
  ChevronRight, 
  Clock, 
  Download, 
  Eye, 
  LogIn, 
  MapPin, 
  User
} from "lucide-react";
import { formatCurrency, formatDate, BOOKING_STATUS, PAYMENT_STATUS } from "@/lib/constants";

export default function Dashboard() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState("upcoming");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access your dashboard.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [isAuthenticated, setLocation, toast]);

  // Fetch user's bookings
  const { 
    data: bookings, 
    isLoading: bookingsLoading,
    error: bookingsError
  } = useQuery<Booking[]>({
    queryKey: [`/api/bookings/user/${user?.id}`],
    enabled: !!user?.id,
  });

  // Fetch photographers for display
  const { data: photographers } = useQuery<Photographer[]>({
    queryKey: ["/api/photographers"],
    enabled: !!bookings,
  });

  // Fetch services for display
  const { data: services } = useQuery<Service[]>({
    queryKey: ["/api/services"],
    enabled: !!bookings,
  });

  // Filter bookings based on active tab
  const filterBookings = () => {
    if (!bookings) return [];

    const today = new Date();
    
    switch (activeTab) {
      case "upcoming":
        return bookings.filter(booking => 
          new Date(booking.eventDate) >= today && 
          booking.status !== BOOKING_STATUS.CANCELLED
        );
      case "past":
        return bookings.filter(booking => 
          new Date(booking.eventDate) < today || 
          booking.status === BOOKING_STATUS.COMPLETED
        );
      case "all":
      default:
        return bookings;
    }
  };

  const filteredBookings = filterBookings();

  // Get photographer name by ID
  const getPhotographerName = (id: number) => {
    const photographer = photographers?.find(p => p.id === id);
    return photographer ? photographer.name : "Unknown";
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case BOOKING_STATUS.CONFIRMED:
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case BOOKING_STATUS.PENDING:
        return <Badge variant="outline" className="text-yellow-600 border-yellow-400">Pending</Badge>;
      case BOOKING_STATUS.COMPLETED:
        return <Badge className="bg-blue-500">Completed</Badge>;
      case BOOKING_STATUS.CANCELLED:
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get payment status badge styling
  const getPaymentBadge = (status: string) => {
    switch (status) {
      case PAYMENT_STATUS.PAID:
        return <Badge className="bg-green-500">Paid</Badge>;
      case PAYMENT_STATUS.PENDING:
        return <Badge variant="outline" className="text-yellow-600 border-yellow-400">Pending</Badge>;
      case PAYMENT_STATUS.PROCESSING:
        return <Badge variant="secondary">Processing</Badge>;
      case PAYMENT_STATUS.FAILED:
        return <Badge variant="destructive">Failed</Badge>;
      case PAYMENT_STATUS.REFUNDED:
        return <Badge variant="outline" className="text-blue-600 border-blue-400">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="max-w-md mx-auto">
          <LogIn className="h-12 w-12 mx-auto text-primary mb-4" />
          <h1 className="text-2xl font-display font-bold mb-4">Login Required</h1>
          <p className="mb-6 text-neutral-600">Please log in to view your dashboard and booking history.</p>
          <Button onClick={() => setLocation("/")}>Return to Home</Button>
        </div>
      </div>
    );
  }

  if (bookingsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (bookingsError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-display font-bold mb-4">Error Loading Bookings</h1>
        <p className="mb-6 text-neutral-600">There was an error loading your bookings. Please try again later.</p>
        <Button onClick={() => window.location.reload()}>Refresh Page</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">My Dashboard</h1>
          <p className="text-neutral-600">Manage your bookings and wedding photography services</p>
        </div>
        <Link href="/booking">
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            Book New Service
          </Button>
        </Link>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary/10 rounded-md mr-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Total Bookings</p>
                <h3 className="text-2xl font-bold">{bookings?.length || 0}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-md mr-4">
                <Camera className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Upcoming Events</p>
                <h3 className="text-2xl font-bold">
                  {bookings?.filter(booking => 
                    new Date(booking.eventDate) >= new Date() && 
                    booking.status !== BOOKING_STATUS.CANCELLED
                  ).length || 0}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-md mr-4">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Completed</p>
                <h3 className="text-2xl font-bold">
                  {bookings?.filter(booking => 
                    booking.status === BOOKING_STATUS.COMPLETED
                  ).length || 0}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-secondary/10 rounded-md mr-4">
                <User className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Photographers</p>
                <h3 className="text-2xl font-bold">
                  {new Set(bookings?.map(booking => booking.photographerId)).size || 0}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Bookings Tabs & Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
          <CardDescription>View and manage all your photography bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="all">All Bookings</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              {filteredBookings.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-neutral-300 rounded-md">
                  <Calendar className="h-10 w-10 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Bookings Found</h3>
                  <p className="text-neutral-600 mb-6">
                    {activeTab === "upcoming" 
                      ? "You don't have any upcoming bookings." 
                      : activeTab === "past"
                      ? "You don't have any past bookings."
                      : "You don't have any bookings yet."}
                  </p>
                  <Link href="/booking">
                    <Button>Book a Service</Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event Date</TableHead>
                        <TableHead>Photographer</TableHead>
                        <TableHead>Event Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">
                            {formatDate(booking.eventDate)}
                          </TableCell>
                          <TableCell>
                            {getPhotographerName(booking.photographerId)}
                          </TableCell>
                          <TableCell className="capitalize">
                            {booking.eventType}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(booking.status)}
                          </TableCell>
                          <TableCell>
                            {getPaymentBadge(booking.paymentStatus)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(booking.totalAmount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/confirmation/${booking.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Upcoming Event Details */}
      {filteredBookings.length > 0 && activeTab === "upcoming" && (
        <div className="mb-8">
          <h2 className="text-xl font-display font-semibold mb-4">Next Upcoming Event</h2>
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-3">
                <div className="p-6 md:border-r border-neutral-200">
                  <div className="flex items-center mb-4">
                    <Calendar className="h-5 w-5 text-primary mr-2" />
                    <h3 className="font-medium">Event Details</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-neutral-600">Date</p>
                      <p className="font-medium">{formatDate(filteredBookings[0].eventDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Event Type</p>
                      <p className="font-medium capitalize">{filteredBookings[0].eventType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Location</p>
                      <p className="font-medium capitalize">{filteredBookings[0].location}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 md:border-r border-neutral-200 border-t md:border-t-0">
                  <div className="flex items-center mb-4">
                    <Camera className="h-5 w-5 text-primary mr-2" />
                    <h3 className="font-medium">Photography Details</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-neutral-600">Photographer</p>
                      <p className="font-medium">{getPhotographerName(filteredBookings[0].photographerId)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Services</p>
                      <p className="font-medium">
                        {filteredBookings[0].packageId 
                          ? "Package Booking" 
                          : "Custom Services"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Total Amount</p>
                      <p className="font-medium text-primary">{formatCurrency(filteredBookings[0].totalAmount)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 border-t md:border-t-0 flex flex-col">
                  <div className="flex items-center mb-4">
                    <MapPin className="h-5 w-5 text-primary mr-2" />
                    <h3 className="font-medium">Status</h3>
                  </div>
                  
                  <div className="space-y-3 flex-grow">
                    <div>
                      <p className="text-sm text-neutral-600">Booking Status</p>
                      <div className="mt-1">
                        {getStatusBadge(filteredBookings[0].status)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Payment Status</p>
                      <div className="mt-1">
                        {getPaymentBadge(filteredBookings[0].paymentStatus)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Link href={`/confirmation/${filteredBookings[0].id}`}>
                      <Button className="w-full">
                        View Details
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Help & Support */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>Get in touch with our support team for any questions or assistance</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <p className="text-neutral-600 mb-4">
              If you need to modify your booking, have questions about our services, or need any other assistance, 
              our team is here to help.
            </p>
            <div className="space-y-2">
              <p className="flex items-center">
                <svg className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+91 98765 43210</span>
              </p>
              <p className="flex items-center">
                <svg className="h-5 w-5 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>support@vivahphotography.com</span>
              </p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Button variant="outline">
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
