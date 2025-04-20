import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PhotographyCard } from "@/components/ui/photography-card";
import { TestimonialCard } from "@/components/ui/testimonial-card";
import { MapPin, Calendar, Camera, Award, CheckCircle } from "lucide-react";
import { Photographer, PortfolioItem, Testimonial } from "@shared/schema";

interface PhotographerProfileData {
  photographer: Photographer;
  portfolio: PortfolioItem[];
  testimonials: Testimonial[];
}

export default function PhotographerProfile() {
  const { id } = useParams();
  const parsedId = parseInt(id || "0");

  const { data, isLoading, error } = useQuery<PhotographerProfileData>({
    queryKey: [`/api/photographers/${parsedId}`],
    enabled: !isNaN(parsedId) && parsedId > 0,
  });

  if (isNaN(parsedId) || parsedId <= 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Invalid Photographer ID</h1>
        <p className="mb-6">The photographer ID provided is not valid.</p>
        <Link href="/photographers">
          <Button>Back to Photographers</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4">Loading photographer profile...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Photographer Not Found</h1>
        <p className="mb-6">We couldn't find the photographer you're looking for.</p>
        <Link href="/photographers">
          <Button>Back to Photographers</Button>
        </Link>
      </div>
    );
  }

  const { photographer, portfolio, testimonials } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Photographer Header */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="md:flex">
          <div className="md:w-1/3 md:flex-shrink-0">
            <img
              src={photographer.profileImage}
              alt={photographer.name}
              className="h-full w-full object-cover md:h-full md:w-full"
            />
          </div>
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-display font-bold text-primary mb-2">
                  {photographer.name}
                </h1>
                <div className="flex items-center text-neutral-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{photographer.location}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
                <Link href={`/booking?photographer=${photographer.id}`}>
                  <Button className="whitespace-nowrap">
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Now
                  </Button>
                </Link>
              </div>
            </div>

            <p className="text-neutral-700 mb-6">{photographer.bio}</p>

            <div className="flex flex-wrap gap-2 mb-6">
              {photographer.specialties.map((specialty, index) => (
                <Badge key={index} variant="secondary" className="bg-secondary/10 text-secondary">
                  {specialty}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center p-4 bg-neutral-50 rounded-lg">
                <Award className="h-8 w-8 text-primary mr-3" />
                <div>
                  <h3 className="font-medium">Experience</h3>
                  <p className="text-neutral-600">{photographer.experience}+ years</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-neutral-50 rounded-lg">
                <Camera className="h-8 w-8 text-primary mr-3" />
                <div>
                  <h3 className="font-medium">Specialization</h3>
                  <p className="text-neutral-600">{photographer.specialties[0]}</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-neutral-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-primary mr-3" />
                <div>
                  <h3 className="font-medium">Available</h3>
                  <p className="text-neutral-600">For Bookings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Portfolio and Testimonials */}
      <Tabs defaultValue="portfolio" className="mb-12">
        <TabsList className="mb-6">
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
        </TabsList>
        
        <TabsContent value="portfolio">
          <h2 className="text-2xl font-display font-semibold mb-6">Portfolio</h2>
          
          {portfolio.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-neutral-600">No portfolio items available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolio.map((item) => (
                <PhotographyCard
                  key={item.id}
                  imageUrl={item.imageUrl}
                  title={item.title}
                  category={item.category}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="testimonials">
          <h2 className="text-2xl font-display font-semibold mb-6">Testimonials</h2>
          
          {testimonials.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-neutral-600">No testimonials available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.id}
                  clientName={testimonial.clientName}
                  clientImage={testimonial.clientImage || undefined}
                  rating={testimonial.rating}
                  comment={testimonial.comment}
                  eventType={testimonial.eventType}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* CTA Section */}
      <div className="bg-primary text-white rounded-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-2/3 p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">Ready to book {photographer.name} for your wedding?</h2>
            <p className="mb-6 text-white/90">
              Secure your date now and let's create beautiful memories together for your special day.
            </p>
            <Link href={`/booking?photographer=${photographer.id}`}>
              <Button variant="secondary" size="lg">
                Book Now
              </Button>
            </Link>
          </div>
          <div className="md:w-1/3 relative">
            <img
              src="https://images.unsplash.com/photo-1623595119708-26b1f7500ddd?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
              alt="Wedding photography"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
