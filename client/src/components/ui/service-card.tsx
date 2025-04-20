import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface ServiceCardProps {
  name: string;
  description: string;
  price: number;
  duration: number;
  imageUrl: string;
  onSelect?: () => void;
}

export function ServiceCard({
  name,
  description,
  price,
  duration,
  imageUrl,
  onSelect
}: ServiceCardProps) {
  return (
    <Card className="h-full flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lg">
      <div className="relative pb-[60%] overflow-hidden">
        <img 
          src={imageUrl} 
          alt={name} 
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <CardContent className="flex-grow flex flex-col p-5">
        <h3 className="text-xl font-display font-semibold text-primary mb-2">{name}</h3>
        
        <div className="flex items-center text-sm text-neutral-500 mb-3">
          <Clock className="w-4 h-4 mr-1" />
          <span>{duration} {duration === 1 ? 'hour' : 'hours'}</span>
        </div>
        
        <p className="text-sm text-neutral-600 mb-4">{description}</p>
        
        <div className="mt-auto">
          <p className="text-2xl font-display font-bold text-primary mb-3">
            ₹{price.toLocaleString()}
          </p>
        </div>
      </CardContent>
      <CardFooter className="pt-0 px-5 pb-5">
        <Button className="w-full" onClick={onSelect}>
          Select Service
        </Button>
      </CardFooter>
    </Card>
  );
}
