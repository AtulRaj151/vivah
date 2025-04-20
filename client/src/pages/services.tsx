import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams, Link } from "wouter";
import { ServiceCard } from "@/components/ui/service-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Service, ServiceCategory } from "@shared/schema";

export default function Services() {
  const [_, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const categoryParam = params.get("category");
  const initialCategory = categoryParam ? parseInt(categoryParam) : null;
  
  const [activeCategory, setActiveCategory] = useState<number | null>(initialCategory);
  
  const { data: categories, isLoading: categoriesLoading } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/service-categories"],
  });
  
  const { data: services, isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: [
      "/api/services",
      ...(activeCategory ? [`?categoryId=${activeCategory}`] : [])
    ],
  });
  
  const isLoading = categoriesLoading || servicesLoading;
  
  const handleServiceSelect = (service: Service) => {
    setLocation(`/booking?service=${service.id}`);
  };
  
  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === "all") {
      setActiveCategory(null);
    } else {
      const id = parseInt(categoryId);
      if (!isNaN(id)) {
        setActiveCategory(id);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">Our Services</h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Explore our range of photography and videography services designed to capture every moment of your special day.
        </p>
      </div>
      
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4">Loading services...</p>
        </div>
      ) : (
        <>
          {/* Service Category Tabs */}
          <Tabs 
            defaultValue={activeCategory ? activeCategory.toString() : "all"} 
            className="mb-10"
            onValueChange={handleCategoryChange}
          >
            <div className="flex justify-center mb-6">
              <TabsList className="h-auto p-1">
                <TabsTrigger 
                  value="all" 
                  className="px-4 py-2"
                >
                  All Services
                </TabsTrigger>
                {categories?.map((category) => (
                  <TabsTrigger 
                    key={category.id}
                    value={category.id.toString()}
                    className="px-4 py-2"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services?.map((service) => (
                  <ServiceCard
                    key={service.id}
                    name={service.name}
                    description={service.description}
                    price={service.price}
                    duration={service.duration}
                    imageUrl={service.imageUrl}
                    onSelect={() => handleServiceSelect(service)}
                  />
                ))}
              </div>
            </TabsContent>
            
            {categories?.map((category) => (
              <TabsContent key={category.id} value={category.id.toString()}>
                <div className="mb-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                      <h2 className="text-2xl font-display font-bold text-primary">{category.name}</h2>
                      <p className="text-neutral-600">{category.description}</p>
                    </div>
                    <img 
                      src={category.imageUrl} 
                      alt={category.name} 
                      className="w-full md:w-64 h-24 rounded-lg object-cover md:flex-shrink-0"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services
                      ?.filter(service => service.categoryId === category.id)
                      .map((service) => (
                        <ServiceCard
                          key={service.id}
                          name={service.name}
                          description={service.description}
                          price={service.price}
                          duration={service.duration}
                          imageUrl={service.imageUrl}
                          onSelect={() => handleServiceSelect(service)}
                        />
                      ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
      
      {/* Custom Services CTA */}
      <div className="bg-neutral-100 rounded-lg p-8 mt-12 text-center">
        <h2 className="text-2xl font-display font-bold mb-4">Need a Custom Package?</h2>
        <p className="text-neutral-600 max-w-2xl mx-auto mb-6">
          Don't see exactly what you need? We can create a custom photography and videography package tailored to your specific requirements.
        </p>
        <Link href="/booking">
          <Button>Contact Us</Button>
        </Link>
      </div>
    </div>
  );
}
