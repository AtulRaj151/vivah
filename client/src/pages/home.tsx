import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TestimonialCard } from "@/components/ui/testimonial-card";
import { PhotographyCard } from "@/components/ui/photography-card";
import { Camera, Video, Focus, Film, CheckCircle, Calendar, Users, Star } from "lucide-react";
import { Testimonial, ServiceCategory, Package, PortfolioItem } from "@shared/schema";

export default function Home() {
  const { data: serviceCategories } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/service-categories"],
  });

  const { data: packages } = useQuery<Package[]>({
    queryKey: ["/api/packages"],
  });

  const { data: testimonials } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-neutral-900 text-white overflow-hidden">
        <div 
          className="absolute inset-0 z-0" 
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: "0.4"
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4">Premier Indian Wedding Photography</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              Capture Your
              <span className="text-primary"> Wedding Day</span> in
              <span className="text-secondary"> Timeless Beauty</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-neutral-200">
              Expert photography and videography services for your special celebration.
              We create lasting memories with artistic vision and cultural understanding.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="font-medium">
                <Link href="/booking">Book Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10 font-medium">
                <Link href="/photographers">Our Photographers</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Our Premium Services</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              From traditional ceremonies to modern celebrations, our team captures every moment with precision and artistry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {serviceCategories?.map((category) => (
              <Link key={category.id} href={`/services?category=${category.id}`}>
                <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img 
                      src={category.imageUrl} 
                      alt={category.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-3">
                      {category.name === "Photography" && <Camera className="h-5 w-5 text-primary mr-2" />}
                      {category.name === "Videography" && <Video className="h-5 w-5 text-primary mr-2" />}
                      {category.name === "Focus Services" && <Focus className="h-5 w-5 text-primary mr-2" />}
                      {category.name === "Wedding Reels" && <Film className="h-5 w-5 text-primary mr-2" />}
                      <h3 className="font-display text-xl font-semibold">{category.name}</h3>
                    </div>
                    <p className="text-neutral-600 text-sm">{category.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            <div className="w-full lg:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80" 
                alt="Wedding photographer in action" 
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="w-full lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Why Choose Royal Videography?</h2>
              <p className="text-neutral-600 mb-8">
                We combine technical expertise with cultural understanding to create stunning visual narratives of your celebration. Our team specializes in capturing authentic moments with artistic flair.  We are located in Dehri on Sone, Rohtas district, Bihar.
              </p>
              <div className="space-y-4">
                <div className="flex">
                  <CheckCircle className="h-6 w-6 text-primary mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg">Experienced Professionals</h3>
                    <p className="text-neutral-600">Our photographers have 10+ years of experience in Indian wedding photography.</p>
                  </div>
                </div>
                <div className="flex">
                  <CheckCircle className="h-6 w-6 text-primary mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg">Cultural Understanding</h3>
                    <p className="text-neutral-600">We understand the significance of every ritual and tradition in Indian weddings.</p>
                  </div>
                </div>
                <div className="flex">
                  <CheckCircle className="h-6 w-6 text-primary mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg">State-of-the-Art Equipment</h3>
                    <p className="text-neutral-600">We use the latest camera technology and drone equipment for exceptional results.</p>
                  </div>
                </div>
                <div className="flex">
                  <CheckCircle className="h-6 w-6 text-primary mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg">Custom Packages</h3>
                    <p className="text-neutral-600">Flexible service options tailored to your specific requirements and budget.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Packages */}
      <section className="py-16 md:py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Our Wedding Packages</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Choose from our carefully curated photography and videography packages designed to capture every special moment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages?.map((pkg) => (
              <Card 
                key={pkg.id} 
                className={`overflow-hidden transition-shadow duration-300 hover:shadow-lg ${pkg.popular ? 'border-secondary border-2' : ''}`}
              >
                {pkg.popular && (
                  <div className="bg-secondary text-white text-center py-1 text-xs font-semibold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <div className="relative pb-[50%] overflow-hidden">
                  <img 
                    src={pkg.imageUrl} 
                    alt={pkg.name} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-5">
                  <h3 className="text-xl font-display font-semibold text-primary mb-2">{pkg.name}</h3>
                  <p className="text-sm text-neutral-600 mb-4">{pkg.description}</p>

                  <div className="mb-4">
                    <p className="text-2xl font-display font-bold text-primary">
                      ₹{pkg.price.toLocaleString()}
                    </p>
                  </div>

                  <div className="mt-auto">
                    <h4 className="font-medium text-sm mb-2">Package Includes:</h4>
                    <ul className="space-y-2">
                      {pkg.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <CheckCircle className="h-4 w-4 mr-2 text-accent mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {pkg.features.length > 3 && (
                        <li className="text-sm text-primary">+{pkg.features.length - 3} more features</li>
                      )}
                    </ul>
                  </div>

                  <Link href="/booking">
                    <Button 
                      className={`w-full mt-4 ${pkg.popular ? 'bg-secondary hover:bg-secondary/90' : ''}`}
                    >
                      Book This Package
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Showcase */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Our Portfolio</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Browse through our selected works highlighting the beauty and joy of Indian weddings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PhotographyCard 
              imageUrl="https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=450&q=80"
              title="Venue Decoration"
              category="Traditional"
            />
            <PhotographyCard 
              imageUrl="https://images.unsplash.com/photo-1623595119708-26b1f7500ddd?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=450&q=80"
              title="Traditional Ceremonies"
              category="Ceremony"
            />
            <PhotographyCard 
              imageUrl="https://images.unsplash.com/photo-1604604994333-f1b0e9471186?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=450&q=80"
              title="Focus Photography"
              category="Aerial"
            />
            <PhotographyCard 
              imageUrl="https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=450&q=80"
              title="Reception Highlights"
              category="Reception"
            />
          </div>

          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link href="/photographers">View More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Client Testimonials</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Hear what our happy couples have to say about their experience with our photography services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials?.slice(0, 3).map((testimonial) => (
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Ready to Book Your Wedding Photography?</h2>
          <p className="text-white/90 max-w-2xl mx-auto mb-8 text-lg">
            Let's create beautiful memories together. Our team is ready to capture your special day with creativity and passion.  Contact us at +91 7004711393 or visit us in Dehri on Sone, Bihar - 821305.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="flex flex-col items-center">
              <Calendar className="h-10 w-10 mb-3" />
              <h3 className="font-semibold text-xl">Check Availability</h3>
              <p className="text-white/80">Find dates that work for you</p>
            </div>
            <div className="flex flex-col items-center">
              <Users className="h-10 w-10 mb-3" />
              <h3 className="font-semibold text-xl">Meet Our Team</h3>
              <p className="text-white/80">Professional photographers</p>
            </div>
            <div className="flex flex-col items-center">
              <Star className="h-10 w-10 mb-3" />
              <h3 className="font-semibold text-xl">Customize Package</h3>
              <p className="text-white/80">Tailor services to your needs</p>
            </div>
          </div>
          <Button asChild size="lg" variant="secondary" className="font-medium">
            <Link href="/booking">Book Your Date Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}