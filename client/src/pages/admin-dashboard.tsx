import { useState, useEffect, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
import { Booking, Photographer, Service, User } from "@shared/schema";
import { 
  BarChart3, 
  Users, 
  Camera, 
  ChevronRight, 
  Image, 
  LogIn, 
  DollarSign, 
  Calendar,
  Clock,
  Building
} from "lucide-react";
import { formatCurrency, formatDate, BOOKING_STATUS, PAYMENT_STATUS } from "@/lib/constants";
import { AdminDashboardStats } from "@shared/schema";

export default function AdminDashboard() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState("overview");

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access the admin dashboard.",
        variant: "destructive",
      });
      setLocation("/");
      return;
    }
    
    if (user?.type !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive",
      });
      setLocation("/dashboard");
    }
  }, [isAuthenticated, user, setLocation, toast]);

  // Fetch all bookings
  const { 
    data: bookings, 
    isLoading: bookingsLoading,
  } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    enabled: isAuthenticated && user?.type === 'admin',
  });

  // Fetch all photographers
  const { 
    data: photographers,
    isLoading: photographersLoading
  } = useQuery<Photographer[]>({
    queryKey: ["/api/photographers"],
    enabled: isAuthenticated && user?.type === 'admin',
  });

  // Fetch all services
  const { data: services } = useQuery<Service[]>({
    queryKey: ["/api/services"],
    enabled: isAuthenticated && user?.type === 'admin',
  });

  // Fetch all users
  const { 
    data: users,
    isLoading: usersLoading
  } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: isAuthenticated && user?.type === 'admin',
  });

  // Fetch earnings statistics
  const { data: earnings } = useQuery({
    queryKey: ["/api/earnings"],
    enabled: isAuthenticated && user?.type === 'admin',
  });

  // Compute dashboard stats
  const computeStats = (): AdminDashboardStats => {
    return {
      totalBookings: bookings?.length || 0,
      totalRevenue: bookings?.reduce((sum, booking) => sum + booking.totalAmount, 0) || 0,
      totalPhotographers: photographers?.length || 0,
      totalCustomers: users?.filter(u => u.type === 'customer')?.length || 0
    };
  };

  const stats = computeStats();

  // Get photographer name by ID
  const getPhotographerName = (id: number) => {
    const photographer = photographers?.find(p => p.id === id);
    return photographer ? photographer.name : "Unknown";
  };

  // Get customer name by ID
  const getCustomerName = (id: number) => {
    const customer = users?.find(u => u.id === id);
    return customer ? customer.fullName : "Unknown Customer";
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
  
  // Filter customers (only show customers, not admins)
  const customerUsers = users?.filter(u => u.type === 'customer') || [];

  // Filter bookings based on different criteria
  const getRecentBookings = () => {
    if (!bookings) return [];
    return [...bookings]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  };

  const getPendingBookings = () => {
    if (!bookings) return [];
    return bookings.filter(booking => booking.status === BOOKING_STATUS.PENDING);
  };

  const getUpcomingBookings = () => {
    if (!bookings) return [];
    const today = new Date();
    return bookings.filter(booking => 
      new Date(booking.eventDate) >= today && 
      booking.status !== BOOKING_STATUS.CANCELLED
    )
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  };

  if (!isAuthenticated || user?.type !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="max-w-md mx-auto">
          <LogIn className="h-12 w-12 mx-auto text-primary mb-4" />
          <h1 className="text-2xl font-display font-bold mb-4">Admin Access Required</h1>
          <p className="mb-6 text-neutral-600">Please log in with an admin account to access the admin dashboard.</p>
          <Button onClick={() => setLocation("/")}>Return to Home</Button>
        </div>
      </div>
    );
  }

  const isLoading = bookingsLoading || photographersLoading || usersLoading;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Admin Dashboard</h1>
          <p className="text-neutral-600">Manage photographers, bookings, and platform performance</p>
        </div>
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
                <h3 className="text-2xl font-bold">{stats.totalBookings}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-md mr-4">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Total Revenue</p>
                <h3 className="text-2xl font-bold">
                  {formatCurrency(stats.totalRevenue)}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-md mr-4">
                <Camera className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Photographers</p>
                <h3 className="text-2xl font-bold">
                  {stats.totalPhotographers}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-secondary/10 rounded-md mr-4">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Customers</p>
                <h3 className="text-2xl font-bold">
                  {stats.totalCustomers}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content Tabs */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Admin Panel</CardTitle>
          <CardDescription>Manage and monitor platform activities</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="photographers">Photographers</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
            </TabsList>
            
            {/* OVERVIEW TAB */}
            <TabsContent value="overview">
              <div className="space-y-6">
                {/* Recent Bookings Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Recent Bookings</h3>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("bookings")}>
                      View All <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Photographer</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getRecentBookings().map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">
                              {formatDate(booking.eventDate)}
                            </TableCell>
                            <TableCell>
                              {getCustomerName(booking.userId)}
                            </TableCell>
                            <TableCell>
                              {getPhotographerName(booking.photographerId)}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(booking.totalAmount)}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(booking.status)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                {/* Platform Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Platform Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b">
                          <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-md mr-3">
                              <Calendar className="h-4 w-4 text-blue-600" />
                            </div>
                            <span>New Bookings (30 days)</span>
                          </div>
                          <span className="font-bold">{bookings?.filter(b => {
                            const date = new Date(b.createdAt);
                            const thirtyDaysAgo = new Date();
                            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                            return date >= thirtyDaysAgo;
                          }).length || 0}</span>
                        </div>
                        
                        <div className="flex justify-between items-center pb-2 border-b">
                          <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-md mr-3">
                              <DollarSign className="h-4 w-4 text-green-600" />
                            </div>
                            <span>Revenue (30 days)</span>
                          </div>
                          <span className="font-bold">{formatCurrency(bookings?.filter(b => {
                            const date = new Date(b.createdAt);
                            const thirtyDaysAgo = new Date();
                            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                            return date >= thirtyDaysAgo;
                          }).reduce((sum, b) => sum + b.totalAmount, 0) || 0)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center pb-2 border-b">
                          <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-md mr-3">
                              <Users className="h-4 w-4 text-purple-600" />
                            </div>
                            <span>Customer Growth (30 days)</span>
                          </div>
                          <span className="font-bold">{users?.filter(u => {
                            const date = new Date(u.createdAt);
                            const thirtyDaysAgo = new Date();
                            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                            return date >= thirtyDaysAgo && u.type === 'customer';
                          }).length || 0} new</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-md mr-3">
                              <Building className="h-4 w-4 text-yellow-600" />
                            </div>
                            <span>Locations Covered</span>
                          </div>
                          <span className="font-bold">{new Set(bookings?.map(b => b.location)).size || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Pending Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b">
                          <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-md mr-3">
                              <Clock className="h-4 w-4 text-yellow-600" />
                            </div>
                            <span>Pending Bookings</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-bold mr-2">{getPendingBookings().length}</span>
                            <Button variant="outline" size="sm" onClick={() => setActiveTab("bookings")}>
                              View
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center pb-2 border-b">
                          <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-md mr-3">
                              <Calendar className="h-4 w-4 text-green-600" />
                            </div>
                            <span>Upcoming Events (7 days)</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-bold mr-2">{bookings?.filter(b => {
                              const eventDate = new Date(b.eventDate);
                              const today = new Date();
                              const sevenDaysLater = new Date();
                              sevenDaysLater.setDate(today.getDate() + 7);
                              return eventDate >= today && eventDate <= sevenDaysLater;
                            }).length || 0}</span>
                            <Button variant="outline" size="sm" onClick={() => setActiveTab("bookings")}>
                              View
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="p-2 bg-red-100 rounded-md mr-3">
                              <Image className="h-4 w-4 text-red-600" />
                            </div>
                            <span>Pending Photo Deliveries</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-bold mr-2">{bookings?.filter(b => 
                              b.status === BOOKING_STATUS.CONFIRMED && 
                              b.paymentStatus === PAYMENT_STATUS.PAID
                            ).length || 0}</span>
                            <Button variant="outline" size="sm" onClick={() => setActiveTab("bookings")}>
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* BOOKINGS TAB */}
            <TabsContent value="bookings">
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Event Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Photographer</TableHead>
                        <TableHead>Event Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings?.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">#{booking.id}</TableCell>
                          <TableCell>{formatDate(booking.eventDate)}</TableCell>
                          <TableCell>{getCustomerName(booking.userId)}</TableCell>
                          <TableCell>{getPhotographerName(booking.photographerId)}</TableCell>
                          <TableCell className="capitalize">{booking.eventType}</TableCell>
                          <TableCell>{formatCurrency(booking.totalAmount)}</TableCell>
                          <TableCell>{getStatusBadge(booking.status)}</TableCell>
                          <TableCell>{getPaymentBadge(booking.paymentStatus)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
            
            {/* PHOTOGRAPHERS TAB */}
            <TabsContent value="photographers">
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Specialties</TableHead>
                        <TableHead>Bookings</TableHead>
                        <TableHead>Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {photographers?.map((photographer) => {
                        const photographerBookings = bookings?.filter(b => b.photographerId === photographer.id) || [];
                        const totalRevenue = photographerBookings.reduce((sum, b) => sum + b.totalAmount, 0);
                        
                        return (
                          <TableRow key={photographer.id}>
                            <TableCell className="font-medium">#{photographer.id}</TableCell>
                            <TableCell>{photographer.name}</TableCell>
                            <TableCell>{photographer.experience} years</TableCell>
                            <TableCell>{photographer.location}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {photographer.specialties.slice(0, 2).map((specialty, i) => (
                                  <Badge key={i} variant="outline">{specialty}</Badge>
                                ))}
                                {photographer.specialties.length > 2 && (
                                  <Badge variant="outline">+{photographer.specialties.length - 2} more</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{photographerBookings.length}</TableCell>
                            <TableCell>{formatCurrency(totalRevenue)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
            
            {/* CUSTOMERS TAB */}
            <TabsContent value="customers">
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Total Bookings</TableHead>
                        <TableHead>Total Spent</TableHead>
                        <TableHead>Joined Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerUsers?.map((customer) => {
                        const customerBookings = bookings?.filter(b => b.userId === customer.id) || [];
                        const totalSpent = customerBookings.reduce((sum, b) => sum + b.totalAmount, 0);
                        
                        return (
                          <TableRow key={customer.id}>
                            <TableCell className="font-medium">#{customer.id}</TableCell>
                            <TableCell>{customer.fullName}</TableCell>
                            <TableCell>{customer.username}</TableCell>
                            <TableCell>{customer.email}</TableCell>
                            <TableCell>{customerBookings.length}</TableCell>
                            <TableCell>{formatCurrency(totalSpent)}</TableCell>
                            <TableCell>{formatDate(customer.createdAt)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
            
            {/* EARNINGS TAB */}
            <TabsContent value="earnings">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Revenue Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center h-64">
                        <div className="flex flex-col items-center justify-center text-center">
                          <BarChart3 className="h-12 w-12 text-neutral-400 mb-4" />
                          <h3 className="text-lg font-medium mb-2">Revenue Analytics</h3>
                          <p className="text-neutral-600 mb-2">
                            Total Platform Revenue
                          </p>
                          <div className="text-3xl font-bold text-primary">
                            {formatCurrency(stats.totalRevenue)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Revenue by Event Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Group bookings by event type and calculate revenue for each */}
                        {bookings && Object.entries(
                          bookings.reduce((acc, booking) => {
                            const { eventType, totalAmount } = booking;
                            acc[eventType] = (acc[eventType] || 0) + totalAmount;
                            return acc;
                          }, {} as Record<string, number>)
                        )
                        .sort((a, b) => b[1] - a[1]) // Sort by revenue (descending)
                        .map(([eventType, revenue], index) => {
                          const percentage = stats.totalRevenue ? (revenue / stats.totalRevenue) * 100 : 0;
                          
                          return (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium capitalize">{eventType}</span>
                                <span className="text-sm font-medium">{formatCurrency(revenue)}</span>
                              </div>
                              <div className="w-full bg-neutral-200 rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top Performing Photographers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Photographer</TableHead>
                            <TableHead>Bookings</TableHead>
                            <TableHead>Revenue Generated</TableHead>
                            <TableHead>Avg. Booking Value</TableHead>
                            <TableHead>Completion Rate</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {photographers && bookings && photographers
                            .map(photographer => {
                              const photographerBookings = bookings.filter(b => b.photographerId === photographer.id);
                              const totalRevenue = photographerBookings.reduce((sum, b) => sum + b.totalAmount, 0);
                              const avgBookingValue = photographerBookings.length 
                                ? totalRevenue / photographerBookings.length 
                                : 0;
                              const completedBookings = photographerBookings.filter(
                                b => b.status === BOOKING_STATUS.COMPLETED
                              ).length;
                              const completionRate = photographerBookings.length 
                                ? (completedBookings / photographerBookings.length) * 100 
                                : 0;
                              
                              return {
                                photographer,
                                bookingsCount: photographerBookings.length,
                                totalRevenue,
                                avgBookingValue,
                                completionRate
                              };
                            })
                            .sort((a, b) => b.totalRevenue - a.totalRevenue) // Sort by revenue (descending)
                            .slice(0, 5) // Take top 5
                            .map(({photographer, bookingsCount, totalRevenue, avgBookingValue, completionRate}) => (
                              <TableRow key={photographer.id}>
                                <TableCell className="font-medium">{photographer.name}</TableCell>
                                <TableCell>{bookingsCount}</TableCell>
                                <TableCell>{formatCurrency(totalRevenue)}</TableCell>
                                <TableCell>{formatCurrency(avgBookingValue)}</TableCell>
                                <TableCell>{completionRate.toFixed(1)}%</TableCell>
                              </TableRow>
                            ))
                          }
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}