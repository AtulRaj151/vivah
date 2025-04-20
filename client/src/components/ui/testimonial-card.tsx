import { Card, CardContent } from "@/components/ui/card";
import { Star, StarHalf } from "lucide-react";

interface TestimonialCardProps {
  clientName: string;
  clientImage?: string;
  rating: number;
  comment: string;
  eventType: string;
}

export function TestimonialCard({
  clientName,
  clientImage,
  rating,
  comment,
  eventType
}: TestimonialCardProps) {
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
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex mb-4">
          {renderStars()}
        </div>
        
        <blockquote className="text-neutral-600 mb-4 italic">
          "{comment}"
        </blockquote>
        
        <div className="flex items-center mt-4">
          {clientImage ? (
            <img 
              src={clientImage} 
              alt={clientName} 
              className="h-10 w-10 rounded-full object-cover mr-3"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
              {clientName.charAt(0)}
            </div>
          )}
          <div>
            <div className="font-medium text-neutral-900">{clientName}</div>
            <div className="text-xs text-neutral-500">{eventType}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
