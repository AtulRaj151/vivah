import { useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BookingLayout from "@/components/layout/booking-layout";
import { Booking, Photographer, Service } from "@shared/schema";
import { Calendar, CheckCircle, Download, MapPin, User, AlertCircle, Loader2, Share } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/constants";

export default function Confirmation() {
  const { bookingId } = useParams();
  const [location, setLocation] = useLocation();

  // Fetch booking data
  const { 
    data: booking, 
    isLoading: bookingLoading,
    error: bookingError
  } = useQuery<Booking>({
    queryKey: [`/api/bookings/${bookingId}`],
    enabled: !!bookingId,
  });

  // Fetch photographer data
  const { 
    data: photographer, 
    isLoading: photographerLoading 
  } = useQuery<Photographer>({
    queryKey: [`/api/photographers/${booking?.photographerId}`],
    enabled: !!booking?.photographerId,
  });

  // Fetch services data
  const { 
    data: services, 
    isLoading: servicesLoading 
  } = useQuery<Service[]>({
    queryKey: ["/api/services"],
    enabled: !!booking?.services,
  });

  // Redirect to booking page if there's no booking ID
  useEffect(() => {
    if (!bookingId) {
      setLocation("/booking");
    }
  }, [bookingId, setLocation]);

  // Parse selected services
  const getSelectedServices = () => {
    if (!booking?.services || !services) return [];
    
    try {
      const selectedServices = JSON.parse(booking.services.toString());
      return services.filter(
        (service) => selectedServices[service.id]
      );
    } catch (error) {
      console.error("Error parsing services:", error);
      return [];
    }
  };

  const selectedServices = getSelectedServices();
  const isLoading = bookingLoading || photographerLoading || servicesLoading;
  const isPaid = booking?.paymentStatus === "paid";
  const isConfirmed = booking?.status === "confirmed";

  // Handle sharing functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Wedding Photography Booking",
          text: `I've booked ${photographer?.name} for my wedding on ${formatDate(booking?.eventDate || new Date())}!`,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href);
      alert("Booking link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <BookingLayout step={3}>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p>Loading confirmation details...</p>
        </div>
      </BookingLayout>
    );
  }

  if (bookingError || !booking) {
    return (
      <BookingLayout step={3}>
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-medium mb-2">Booking Not Found</h2>
          <p className="text-neutral-600 mb-6 text-center max-w-md">
            We couldn't find the booking you're looking for. It may have been cancelled or removed.
          </p>
          <Link href="/booking">
            <Button>Return to Booking</Button>
          </Link>
        </div>
      </BookingLayout>
    );
  }

  return (
    <BookingLayout step={3}>
      <div className="space-y-8">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-neutral-600 max-w-xl mx-auto">
            {isPaid 
              ? "Your payment has been processed successfully and your booking is now confirmed." 
              : "Your booking has been created successfully and is awaiting payment confirmation."}
          </p>
        </div>

        {/* Booking Reference Card */}
        <Card className="bg-accent text-white">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold mb-2">Booking Reference</h2>
                <p className="text-3xl font-bold font-display">{`#${booking.id}`}</p>
              </div>
              <div className="flex gap-3 mt-4 md:mt-0">
                <Button 
                  variant="secondary" 
                  className="bg-white text-accent hover:bg-white/90"
                  onClick={handleShare}
                >
                  <Share className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button 
                  variant="secondary" 
                  className="bg-white text-accent hover:bg-white/90"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>Information about your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex">
                <Calendar className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <div className="font-medium">Event Date</div>
                  <div className="text-neutral-600">{formatDate(booking.eventDate)}</div>
                </div>
              </div>
              
              <div className="flex">
                <MapPin className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <div className="font-medium">Location</div>
                  <div className="text-neutral-600 capitalize">{booking.location}</div>
                </div>
              </div>
              
              <div className="flex">
                <User className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <div className="font-medium">Event Type</div>
                  <div className="text-neutral-600 capitalize">{booking.eventType}</div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-neutral-200">
                <div className="font-medium mb-2">Status</div>
                <div className="flex gap-4">
                  <div className={`px-3 py-1 text-xs rounded-full ${isConfirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {isConfirmed ? 'Confirmed' : 'Pending'}
                  </div>
                  <div className={`px-3 py-1 text-xs rounded-full ${isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {isPaid ? 'Paid' : 'Payment Pending'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Photographer Details</CardTitle>
              <CardDescription>Your selected professional</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {photographer && (
                <div className="flex items-center space-x-4 mb-4">
                  <img 
                    src={photographer.profileImage} 
                    alt={photographer.name} 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{photographer.name}</h3>
                    <p className="text-sm text-neutral-600">{photographer.experience}+ years experience</p>
                    <p className="text-sm text-neutral-600">{photographer.location}</p>
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t border-neutral-200">
                <div className="font-medium mb-2">Selected Services</div>
                <ul className="space-y-2">
                  {selectedServices.map(service => (
                    <li key={service.id} className="flex justify-between">
                      <span>{service.name}</span>
                      <span className="font-medium">{formatCurrency(service.price)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="pt-4 border-t border-neutral-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Amount</span>
                  <span className="text-xl font-bold text-primary">{formatCurrency(booking.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* What's Next Section */}
        <Card>
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
            <CardDescription>Here's what you can expect next</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">1</div>
                <div className="ml-4">
                  <h3 className="font-medium">Confirmation Email</h3>
                  <p className="text-neutral-600 mt-1">You'll receive a detailed confirmation email with all the information about your booking within the next few minutes.</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">2</div>
                <div className="ml-4">
                  <h3 className="font-medium">Photographer Contact</h3>
                  <p className="text-neutral-600 mt-1">Your photographer will contact you within 48 hours to discuss the details of your event and any specific requirements you might have.</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">3</div>
                <div className="ml-4">
                  <h3 className="font-medium">Pre-Event Consultation</h3>
                  <p className="text-neutral-600 mt-1">A week before your event, we'll arrange a final consultation to confirm all details and ensure everything is ready for your special day.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard">
            <Button variant="outline" className="w-full sm:w-auto">
              View My Bookings
            </Button>
          </Link>
          <Link href="/">
            <Button className="w-full sm:w-auto">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </BookingLayout>
  );
}
