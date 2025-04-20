import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PhotographerCard } from "@/components/ui/photographer-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Photographer } from "@shared/schema";
import { Search } from "lucide-react";

export default function Photographers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  
  const { data: photographers, isLoading } = useQuery<Photographer[]>({
    queryKey: ["/api/photographers"],
  });

  // Extract all unique specialties from photographers
  const allSpecialties = photographers 
    ? Array.from(
        new Set(
          photographers.flatMap(photographer => photographer.specialties)
        )
      ).sort()
    : [];

  // Filter photographers by search query and specialty
  const filteredPhotographers = photographers?.filter(photographer => {
    const matchesSearch = !searchQuery || 
      photographer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      photographer.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photographer.bio.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpecialty = !selectedSpecialty || 
      photographer.specialties.includes(selectedSpecialty);
    
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">Our Talented Photographers</h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Meet our experienced team of photographers and videographers who specialize in capturing the beauty and emotions of Indian weddings.
        </p>
      </div>
      
      {/* Filters */}
      <div className="bg-white shadow-sm rounded-lg p-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <Input
              placeholder="Search by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {allSpecialties.map((specialty) => (
              <Badge
                key={specialty}
                variant={selectedSpecialty === specialty ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => 
                  setSelectedSpecialty(selectedSpecialty === specialty ? null : specialty)
                }
              >
                {specialty}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      
      {/* Photographers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white shadow rounded-lg overflow-hidden animate-pulse">
              <div className="h-60 bg-neutral-200" />
              <div className="p-5">
                <div className="h-6 bg-neutral-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-neutral-200 rounded w-1/2 mb-3" />
                <div className="h-4 bg-neutral-200 rounded mb-3" />
                <div className="h-4 bg-neutral-200 rounded mb-3" />
                <div className="h-10 bg-neutral-200 rounded mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredPhotographers?.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No photographers found</h3>
          <p className="text-neutral-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPhotographers?.map((photographer) => (
            <PhotographerCard
              key={photographer.id}
              id={photographer.id}
              name={photographer.name}
              bio={photographer.bio}
              profileImage={photographer.profileImage}
              specialties={photographer.specialties}
              experience={photographer.experience}
              location={photographer.location}
            />
          ))}
        </div>
      )}
    </div>
  );
}
