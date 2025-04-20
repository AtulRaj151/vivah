import { Card, CardContent } from "@/components/ui/card";

interface PhotographyCardProps {
  imageUrl: string;
  title: string;
  category: string;
  onClick?: () => void;
}

export function PhotographyCard({ imageUrl, title, category, onClick }: PhotographyCardProps) {
  return (
    <Card className="cursor-pointer overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg" onClick={onClick}>
      <div className="relative pb-[75%]">
        <img 
          src={imageUrl} 
          alt={title} 
          className="absolute h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
          <div>
            <span className="text-white text-sm font-medium">{title}</span>
            <p className="text-white/80 text-xs">{category}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
