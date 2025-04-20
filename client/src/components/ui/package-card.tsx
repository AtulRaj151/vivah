import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface PackageCardProps {
  name: string;
  description: string;
  price: number;
  features: string[];
  imageUrl: string;
  popular: boolean; // Ensure this prop is passed as true or false when using the component
  onSelect?: () => void;
}

export function PackageCard({
  name,
  description,
  price,
  features,
  imageUrl,
  popular,
  onSelect
}: PackageCardProps) {
  return (
    <Card className={`h-full flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lg ${popular ? 'border-secondary border-2' : ''}`}>
      {popular && (
        <div className="bg-secondary text-white text-center py-1 text-xs font-semibold uppercase tracking-wider">
          Most Popular
        </div>
      )}
      <div className="relative pb-[50%] overflow-hidden">
        <img 
          src={imageUrl} 
          alt={name} 
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <CardContent className="flex-grow flex flex-col p-5 pt-4">
        <h3 className="text-xl font-display font-semibold text-primary mb-2">{name}</h3>
        <p className="text-sm text-neutral-600 mb-4">{description}</p>
        
        <div className="mb-4">
          <p className="text-2xl font-display font-bold text-primary">
            ₹{price.toLocaleString()}
          </p>
        </div>
        
        <div className="mt-auto">
          <h4 className="font-medium text-sm mb-2">Includes:</h4>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start text-sm">
                <Check className="h-4 w-4 mr-2 text-accent mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="pt-0 px-5 pb-5">
        <Button 
          className={`w-full ${popular ? 'bg-secondary hover:bg-secondary/90' : ''}`}
          onClick={onSelect}
        >
          Book This Package
        </Button>
      </CardFooter>
    </Card>
  );
}
