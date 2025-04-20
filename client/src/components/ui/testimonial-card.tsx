import { Card, CardContent } from "@/components/ui/card";
import { Star, StarHalf, Quote } from "lucide-react";
import { useState } from "react";

interface TestimonialCardProps {
  clientName: string;
  clientImage?: string;
  rating: number;
  comment: string;
  eventType: string;
  index?: number;
}

export function TestimonialCard({
  clientName,
  clientImage,
  rating,
  comment,
  eventType,
  index = 0
}: TestimonialCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Generate stars based on rating
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-secondary text-secondary" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-4 w-4 fill-secondary text-secondary" />);
    }
    
    return stars;
  };

  return (
    <Card 
      className={`h-full hover-lift animate-zoom-in ${index > 0 ? `stagger-${index > 6 ? 6 : index}` : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-6 relative overflow-hidden">
        {/* Decorative quote icon */}
        <div className={`absolute -right-4 -top-4 transition-all duration-500 ${isHovered ? 'scale-110 rotate-12' : 'rotate-0'}`}>
          <Quote className="h-16 w-16 text-secondary/10" />
        </div>
        
        {/* Rating stars */}
        <div className="flex mb-4 relative z-10">
          {renderStars()}
          <span className="ml-2 text-sm text-neutral-500">{rating.toFixed(1)}</span>
        </div>
        
        {/* Quote */}
        <blockquote className={`text-neutral-600 mb-6 italic relative z-10 transition-all duration-300 ${isHovered ? 'text-primary/90' : ''}`}>
          "{comment}"
        </blockquote>
        
        {/* Client details */}
        <div className="flex items-center mt-auto relative z-10">
          {clientImage ? (
            <div className={`transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}>
              <img 
                src={clientImage} 
                alt={clientName} 
                className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-md mr-3"
              />
            </div>
          ) : (
            <div className={`h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary text-white font-bold flex items-center justify-center mr-3 shadow-md transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}>
              {clientName.charAt(0)}
            </div>
          )}
          <div>
            <div className={`font-medium text-neutral-900 font-display transition-all duration-300 ${isHovered ? 'text-primary' : ''}`}>
              {clientName}
            </div>
            <div className="text-xs text-neutral-500 flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-primary/20"></span>
              {eventType}
            </div>
          </div>
        </div>
        
        {/* Background decoration on hover */}
        <div 
          className={`absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-primary/5 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        />
      </CardContent>
    </Card>
  );
}
