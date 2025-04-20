import { Card } from "@/components/ui/card";
import { useState } from "react";

interface PhotographyCardProps {
  imageUrl: string;
  title: string;
  category: string;
  onClick?: () => void;
  index?: number;
}

export function PhotographyCard({ imageUrl, title, category, onClick, index = 0 }: PhotographyCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Card 
      className={`cursor-pointer overflow-hidden hover-lift animate-zoom-in ${index > 0 ? `stagger-${index > 6 ? 6 : index}` : ''}`} 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative pb-[75%] overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title} 
          className={`absolute h-full w-full object-cover transition-all duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4 transition-opacity duration-300`}>
          <div className={`transform transition-all duration-300 ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-90'}`}>
            <span className="text-white text-base font-medium font-display block mb-1">{title}</span>
            <div className="flex items-center">
              <span className={`text-white/80 text-xs px-2 py-0.5 rounded-full bg-primary/30 inline-block ${isHovered ? 'opacity-100' : 'opacity-80'}`}>
                {category}
              </span>
              <span className={`ml-auto text-xs text-white/70 transform transition-all duration-300 ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0'}`}>
                View
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
