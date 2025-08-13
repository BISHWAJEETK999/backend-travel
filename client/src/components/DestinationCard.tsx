import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DestinationCardProps {
  id: string;
  name: string;
  imageUrl: string;
  formUrl: string;
  icon?: string;
  onExplore?: (destinationId: string, destinationName: string) => void;
}

export default function DestinationCard({
  id,
  name,
  imageUrl,
  formUrl,
  icon = "bi-geo-alt-fill",
  onExplore
}: DestinationCardProps) {
  const handleExplore = () => {
    if (onExplore) {
      onExplore(id, name);
    } else {
      window.open(formUrl, '_blank');
    }
  };

  return (
    <div className="col-span-1">
      <Card className="destination-card">
        <img 
          src={imageUrl}
          alt={name}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
        <CardContent className="card-content">
          <i className={`bi ${icon} destination-icon`}></i>
          <h3 className="font-poppins text-lg font-semibold mb-4 text-ttrave-dark-gray">
            {name}
          </h3>
          <Button
            onClick={handleExplore}
            className="btn-primary-ttrave text-sm"
            data-testid={`explore-button-${id}`}
            aria-label={`Explore ${name}`}
          >
            Explore
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
