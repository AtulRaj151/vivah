import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Camera } from "lucide-react";
import { Link } from "wouter";

interface PhotographerCardProps {
  id: number;
  name: string;
  bio: string;
  profileImage: string;
  specialties: string[];
  experience: number;
  location: string;
}

export function PhotographerCard({
  id,
  name,
  bio,
  profileImage,
  specialties,
  experience,
  location
}: PhotographerCardProps) {
  return (
    <Card className="h-full flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lg">
      <CardHeader className="p-0 relative pb-[60%] sm:pb-[70%] overflow-hidden">
        <img 
          src={profileImage} 
          alt={name} 
          className="absolute inset-0 w-full h-full object-cover"
        />
      </CardHeader>
      <CardContent className="flex-grow flex flex-col p-5">
        <h3 className="text-xl font-display font-semibold text-primary mb-2">{name}</h3>
        
        <div className="flex items-center text-sm text-neutral-500 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{location}</span>
          <span className="mx-2">•</span>
          <Camera className="w-4 h-4 mr-1" />
          <span>{experience}+ years</span>
        </div>
        
        <p className="text-sm text-neutral-600 mb-4 line-clamp-3">{bio}</p>
        
        <div className="mb-4 flex flex-wrap gap-2">
          {specialties.map((specialty, index) => (
            <Badge key={index} variant="secondary" className="bg-secondary/10 text-secondary">
              {specialty}
            </Badge>
          ))}
        </div>
        
        <div className="mt-auto">
          <Link href={`/photographer/${id}`}>
            <Button className="w-full">View Portfolio</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
