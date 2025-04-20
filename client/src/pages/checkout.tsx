import { useState, useEffect, useContext } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UserContext } from "@/App";
import BookingLayout from "@/components/layout/booking-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Booking, Photographer, Package, Service } from "@shared/schema";
import { Loader2, CheckCircle, ChevronLeft, AlertCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/constants";

export default function Checkout() {
  const { bookingId } = useParams();
  const [_, setLocation] = useLocation();
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { user, isAuthenticated } = useContext(UserContext);

  const [clientSecret, setClientSecret] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Fetch booking data
  const { data: booking, isLoading: bookingLoading } = useQuery<Booking>({
    queryKey: [`/api/bookings/${bookingId}`],
    enabled: !!bookingId,
  });

  // Fetch photographer data
  const { data: photographer, isLoading: photographerLoading } = useQuery<Photographer>({
    queryKey: [`/api/photographers/${booking?.photographerId}`],
    enabled: !!booking?.photographerId,
  });

  // Fetch package data if packageId exists
  const { data: packageData, isLoading: packageLoading } = useQuery<Package>({
    queryKey: [`/api/packages/${booking?.packageId}`],
    enabled: !!booking?.packageId,
  });

  // Fetch services data
  const { data: services, isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
    enabled: !!booking?.services,
  });

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access the checkout page.",
        variant: "destructive",
      });
      setLocation("/booking");
      return;
    }

    // Create payment intent when booking data is available
    if (booking && booking.id && booking.totalAmount > 0) {
      createPaymentIntent();
    }
  }, [booking, isAuthenticated]);

  const createPaymentIntent = async () => {
    try {
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount: booking?.totalAmount,
        bookingId: booking?.id,
      });
      
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error("Error creating payment intent:", error);
      toast({
        title: "Payment Setup Failed",
        description: "There was an issue setting up the payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setProcessing(true);
    setPaymentError(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/confirmation/${booking?.id}`,
        },
        redirect: "if_required",
      });

      if (error) {
        setPaymentError(error.message || "Payment failed. Please try again.");
        toast({
          title: "Payment Failed",
          description: error.message || "An error occurred during payment. Please try again.",
          variant: "destructive",
        });
      } else {
        // Payment succeeded without redirect
        toast({
          title: "Payment Successful",
          description: "Your booking has been confirmed!",
        });
        setLocation(`/confirmation/${booking?.id}`);
      }
    } catch (error) {
      console.error("Payment submission error:", error);
      setPaymentError("An unexpected error occurred. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

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
  const isLoading = bookingLoading || photographerLoading || packageLoading || servicesLoading;

  if (isLoading) {
    return (
      <BookingLayout step={2}>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p>Loading checkout information...</p>
        </div>
      </BookingLayout>
    );
  }

  if (!booking) {
    return (
      <BookingLayout step={2}>
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-8 w-8 text-destructive mb-4" />
          <h2 className="text-lg font-medium mb-2">Booking Not Found</h2>
          <p className="text-neutral-600 mb-6">The booking you're looking for doesn't exist or has been removed.</p>
          <Link href="/booking">
            <Button>Return to Booking</Button>
          </Link>
        </div>
      </BookingLayout>
    );
  }

  return (
    <BookingLayout step={2}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">Complete Your Payment</h1>
          <p className="text-neutral-600">Review your booking details and complete the payment to confirm your reservation.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
                <CardDescription>Review your booking details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2 border-b border-neutral-200">
                  <span className="font-medium">Booking ID:</span>
                  <span>{booking.id}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-neutral-200">
                  <span className="font-medium">Photographer:</span>
                  <span>{photographer?.name || "Not specified"}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-neutral-200">
                  <span className="font-medium">Event Type:</span>
                  <span className="capitalize">{booking.eventType}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-neutral-200">
                  <span className="font-medium">Event Date:</span>
                  <span>{formatDate(booking.eventDate)}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-neutral-200">
                  <span className="font-medium">Location:</span>
                  <span className="capitalize">{booking.location}</span>
                </div>

                {booking.packageId && packageData && (
                  <div className="flex justify-between py-2 border-b border-neutral-200">
                    <span className="font-medium">Package:</span>
                    <span>{packageData.name}</span>
                  </div>
                )}

                {selectedServices.length > 0 && (
                  <div className="py-2 border-b border-neutral-200">
                    <span className="font-medium">Selected Services:</span>
                    <ul className="mt-2 space-y-1">
                      {selectedServices.map(service => (
                        <li key={service.id} className="flex justify-between text-sm">
                          <span>{service.name}</span>
                          <span>{formatCurrency(service.price)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-between py-2 font-bold text-lg">
                  <span>Total Amount:</span>
                  <span className="text-primary">{formatCurrency(booking.totalAmount)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Photographer Details</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center space-x-4">
                {photographer && (
                  <>
                    <img 
                      src={photographer.profileImage} 
                      alt={photographer.name} 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">{photographer.name}</h3>
                      <p className="text-sm text-neutral-600">{photographer.experience}+ years experience</p>
                      <p className="text-sm text-neutral-600">{photographer.location}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>Complete your payment securely</CardDescription>
              </CardHeader>
              <CardContent>
                {clientSecret ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <PaymentElement />

                    {paymentError && (
                      <div className="text-destructive text-sm p-3 bg-destructive/10 rounded-md flex items-start">
                        <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{paymentError}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setLocation(`/booking`)}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={!stripe || processing} 
                        className="min-w-[120px]"
                      >
                        {processing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>Pay {formatCurrency(booking.totalAmount)}</>
                        )}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p>Setting up payment...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="mt-6 text-center text-sm text-neutral-600">
              <p className="mb-2">Your payment is secured with industry-standard encryption.</p>
              <div className="flex justify-center space-x-2 mt-3">
                <svg className="h-6" viewBox="0 0 32 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M27.168 0H4.83199C2.16425 0 0 2.16425 0 4.83199V16.168C0 18.8358 2.16425 21 4.83199 21H27.168C29.8358 21 32 18.8358 32 16.168V4.83199C32 2.16425 29.8358 0 27.168 0Z" fill="#ECF0F4" />
                  <path d="M12.6113 14.9972C12.6113 14.9972 12.1318 15.0054 11.8652 14.7224C11.729 14.5862 11.7045 14.3768 11.7045 14.1756C11.7045 13.7778 11.837 13.5071 11.9796 13.2772C11.4225 13.2772 11.0983 13.3134 10.7331 13.4251C10.7331 13.7205 10.7004 13.9809 10.5724 14.2926C10.4072 14.6988 10.1079 15.0381 9.5916 15.0381C9.19376 15.0381 8.97625 14.8369 8.97625 14.5129C8.97625 14.1802 9.24106 13.9137 9.81104 13.706C10.241 13.5479 10.7187 13.4414 11.1737 13.3788C11.3176 13.0997 11.3913 12.8784 11.4534 12.2511C11.516 11.6311 11.5723 10.9892 11.5723 10.2517C11.5723 9.3584 11.4897 8.83113 11.3671 8.18723C10.8022 8.27358 10.2242 8.55025 9.93942 8.84532C9.7214 9.07093 9.58701 9.32764 9.58701 9.70178C9.58701 10.0432 9.73784 10.3403 9.73784 10.6697C9.73784 11.1102 9.3474 11.3676 8.97081 11.3676C8.557 11.3676 8.30893 11.0886 8.30893 10.6152C8.30893 9.88409 8.73994 9.40568 9.13856 9.02337C9.72475 8.45338 10.6099 8.04775 11.5886 7.85417C11.5396 7.59747 11.4734 7.32448 11.3744 7.06777C11.1483 6.49778 10.7623 6.02755 10.1378 6.02755C9.87293 6.02755 9.71392 6.10581 9.51216 6.27301C9.33685 6.42384 9.16969 6.64135 9.00249 6.95011C8.78497 7.34155 8.64241 7.495 8.31268 7.495C7.95219 7.495 7.70411 7.22194 7.70411 6.83863C7.70411 6.14645 8.38175 5.12173 10.1633 5.12173C11.5396 5.12173 12.5152 5.92693 12.9012 7.24693C13.0374 7.70261 13.1373 8.20449 13.2107 8.70636C13.6958 8.65818 14.1155 8.65818 14.6146 8.70636C14.7753 8.72279 14.8082 8.83824 14.8082 8.93278C14.8082 9.09997 14.7263 9.19451 14.4698 9.30996C14.2705 9.39632 13.9507 9.45268 13.2434 9.47729C13.2871 9.89111 13.3107 10.3541 13.3107 10.8396C13.3107 11.8351 13.258 12.6731 13.0756 13.3461C13.7868 13.4116 14.4115 13.5232 14.4115 14.1229C14.4115 14.3768 14.2377 14.5862 13.9861 14.7879C13.6291 15.0709 13.2289 15.1373 12.7925 15.1373C12.7298 15.1373 12.6735 15.1264 12.6113 15.1264V14.9972Z" fill="#3C4043" />
                  <path d="M19.6841 14.9961C19.5889 15.002 19.5053 15.0137 19.4126 15.0137C18.9671 15.0137 18.5684 14.9473 18.2099 14.6643C17.9566 14.4641 17.7828 14.2547 17.7828 14.0003C17.7828 13.7409 17.9783 13.53 18.2658 13.53C18.6248 13.53 18.7565 13.7613 18.8616 14.008C18.9568 14.2156 19.0503 14.4617 19.6101 14.4617C20.0464 14.4617 20.4141 14.2798 20.4141 13.9325C20.4141 13.6402 20.1869 13.5159 19.5755 13.2888C19.0204 13.0816 18.2969 12.8099 18.2969 11.9965C18.2969 11.198 18.9421 10.6768 19.8565 10.6768C20.1869 10.6768 20.5378 10.7351 20.8029 10.8884C21.0429 11.0255 21.1712 11.2172 21.1712 11.4335C21.1712 11.688 20.9698 11.881 20.6599 11.881C20.3465 11.881 20.2772 11.7894 20.092 11.535C19.9661 11.3583 19.8402 11.1745 19.4745 11.1745C19.0901 11.1745 18.8513 11.3641 18.8513 11.6394C18.8513 11.9171 19.0856 12.016 19.7392 12.2722C20.2943 12.4852 21 12.7665 21 13.6076C21 14.2488 20.5378 14.9961 19.6841 14.9961Z" fill="#3C4043" />
                  <path d="M15.2786 10.6768C15.929 10.6768 16.2605 11.0347 16.2605 11.7113C16.2605 12.6606 15.5756 13.5774 14.5795 14.4177C14.7284 14.7099 15.0131 14.9561 15.3773 14.9561C15.7474 14.9561 16.0332 14.7971 16.2653 14.5538C16.3862 14.4349 16.4894 14.4641 16.5986 14.5538C16.7019 14.6434 16.7418 14.7603 16.6385 14.9109C16.4001 15.2383 15.929 15.5 15.3541 15.5C14.6642 15.5 14.1515 15.0896 13.9943 14.5626C13.9071 14.2819 13.8618 13.9778 13.8618 13.6544C13.8618 12.4546 14.5795 10.6768 15.2786 10.6768ZM15.2786 11.2202C15.078 11.2202 14.8549 11.5066 14.668 11.896C14.506 12.22 14.3723 12.631 14.317 13.0705C14.9617 12.4254 15.3541 11.822 15.3541 11.4432C15.3541 11.3001 15.3257 11.2202 15.2786 11.2202Z" fill="#3C4043" />
                  <path d="M22.8868 7.6875L23.778 10.4893L24.6693 7.6875H26L24.3687 12.3906L25.621 15H24.2642L23.778 13.5938L23.2918 15H21.9351L23.1873 12.3906L21.5561 7.6875H22.8868Z" fill="#3C4043" />
                </svg>
                <svg className="h-6" viewBox="0 0 24 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.5557 0H2.44428C1.09446 0 0 1.00737 0 2.24839V12.7516C0 13.9926 1.09446 15 2.44428 15H21.5557C22.9055 15 24 13.9926 24 12.7516V2.24839C24 1.00737 22.9055 0 21.5557 0Z" fill="#F8F8F9" />
                  <path d="M14.993 11.25H9.027V3.75H14.993V11.25Z" fill="#FF5F00" />
                  <path d="M9.3945 7.5C9.39423 6.7038 9.56889 5.91826 9.90631 5.19838C10.2437 4.4785 10.7359 3.84202 11.3445 3.33735C10.5406 2.7084 9.57516 2.31974 8.55244 2.21469C7.52971 2.10964 6.49824 2.29312 5.58336 2.74389C4.66848 3.19466 3.9088 3.89497 3.3912 4.76435C2.8736 5.63372 2.6169 6.63841 2.6504 7.65281C2.684 8.66721 2.99671 9.65133 3.56182 10.4839C4.12694 11.3165 4.91878 11.9637 5.84503 12.3492C6.77127 12.7347 7.79506 12.8434 8.79136 12.6627C9.78766 12.482 10.7183 12.0186 11.4768 11.3246C10.1725 10.0575 9.39472 8.81264 9.3945 7.5Z" fill="#EB001B" />
                  <path d="M21.3496 7.5C21.3496 8.81235 20.5719 10.0575 19.2676 11.3246C20.0265 12.0183 20.9574 12.4813 21.9538 12.6616C22.9502 12.8419 23.9739 12.7329 24.9001 12.347C25.8263 11.9612 26.6179 11.3137 27.1826 10.4809C27.7474 9.64808 28.0598 8.66387 28.093 7.64946C28.1262 6.63506 27.8692 5.63052 27.3513 4.7613C26.8335 3.89209 26.0736 3.19197 25.1587 2.74142C24.2437 2.29087 23.2122 2.10763 22.1895 2.213C21.1669 2.31836 20.2016 2.70729 19.3979 3.33645C20.0069 3.84102 20.4994 4.47756 20.8369 5.19762C21.1745 5.91767 21.3492 6.70342 21.3488 7.5H21.3496Z" fill="#F79E1B" />
                </svg>
                <svg className="h-6" viewBox="0 0 29 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24.9868 0H3.01324C1.34949 0 0 1.34949 0 3.01324V16.4189C0 18.0827 1.34949 19.4322 3.01324 19.4322H24.9868C26.6505 19.4322 28 18.0827 28 16.4189V3.01324C28 1.34949 26.6505 0 24.9868 0Z" fill="#0A2540" />
                  <path d="M10.5974 13.5723C9.85333 14.0797 8.88768 14.3334 7.7001 14.3334C5.77677 14.3334 4.4209 13.3892 3.9135 11.5007L3.88818 11.4247L6.07602 10.494L6.15198 10.6713C6.4564 11.6408 7.00411 12.1229 7.7001 12.1229C8.09731 12.1229 8.41939 12.0089 8.61856 11.7782C8.79007 11.5717 8.87573 11.3146 8.87573 11.0178C8.87573 10.4194 8.48823 10.1099 7.73253 9.76054C7.50575 9.65722 7.24429 9.54419 6.95958 9.41911C6.01624 8.99874 5.32802 8.60929 4.87834 8.13301C4.30302 7.51831 4.0162 6.67966 4.0162 5.63123C4.0162 4.67625 4.30408 3.84121 4.86878 3.19596C5.43439 2.55071 6.2378 2.21699 7.25362 2.21699C8.04947 2.21699 8.72697 2.38374 9.27499 2.71376C9.82301 3.04379 10.2194 3.52797 10.4686 4.15445L10.5192 4.27725L8.38709 5.18491L8.30897 5.00689C8.13215 4.68963 7.84207 4.42746 7.25362 4.42746C6.9589 4.42746 6.71876 4.51629 6.5432 4.6815C6.3707 4.8436 6.27861 5.05839 6.27861 5.32691C6.27861 5.84245 6.77566 6.19288 7.52889 6.55518C7.65189 6.6143 7.79028 6.67966 7.94409 6.75249C9.04215 7.22663 9.76891 7.66539 10.2537 8.22426C10.7447 8.79094 11 9.57298 11 10.5644C11 11.7038 10.5974 13.5723 10.5974 13.5723Z" fill="white" />
                  <path d="M12 11.032V2.44727H14.2041V11.032H12Z" fill="white" />
                  <path d="M20.4709 2.44727H18.6667L15.8369 7.62848L17.6411 11.032H20.0602L18.2555 7.62848L20.4709 2.44727Z" fill="white" />
                  <path d="M23.1218 14.252C22.0389 14.252 21.0664 13.9896 20.5747 13.6756L20.4587 13.6022L21.0511 11.7261L21.2095 11.8141C21.7348 12.1142 22.3762 12.2727 23.0176 12.2727C23.7698 12.2727 24.381 12.0378 24.7942 11.6059C25.212 11.1692 25.4272 10.5458 25.4272 9.77386V9.31138L25.3506 9.40821C24.9684 9.92061 24.2868 10.2062 23.3912 10.2062C22.5812 10.2062 21.8732 9.89214 21.3321 9.29363C20.7858 8.68977 20.5073 7.87593 20.5073 6.90013C20.5073 5.91314 20.7858 5.0874 21.3218 4.48354C21.8648 3.87082 22.5812 3.5459 23.4142 3.5459C24.2868 3.5459 24.9734 3.83171 25.3652 4.3441L25.4272 4.42649V3.75979H27.6013V9.7195C27.6006 11.5885 26.6629 14.252 23.1218 14.252ZM23.6816 8.17663C24.1036 8.17663 24.4408 8.02657 24.697 7.76629C24.9533 7.50601 25.0846 7.1368 25.0846 6.71724C25.0846 6.29767 24.9533 5.92846 24.697 5.66818C24.4408 5.4079 24.1036 5.25784 23.6816 5.25784C23.2596 5.25784 22.9225 5.4079 22.6664 5.66818C22.4101 5.92846 22.2788 6.29767 22.2788 6.71724C22.2788 7.1368 22.4101 7.50601 22.6664 7.76629C22.9225 8.02657 23.2591 8.17663 23.6816 8.17663Z" fill="white" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BookingLayout>
  );
}
