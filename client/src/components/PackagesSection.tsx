import { useQuery } from "@tanstack/react-query";
import { Package } from "@shared/schema";
import { Clock, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PackagesSectionProps {
  destinationId: string;
  destinationName: string;
  onClose: () => void;
}

export default function PackagesSection({ destinationId, destinationName, onClose }: PackagesSectionProps) {
  const { data: packages, isLoading } = useQuery<Package[]>({
    queryKey: ['/api/packages/destination', destinationId],
    queryFn: async () => {
      const response = await fetch(`/api/packages/destination/${destinationId}`);
      if (!response.ok) throw new Error('Failed to fetch packages');
      return response.json();
    }
  });

  const { data: content = {} } = useQuery<Record<string, string>>({
    queryKey: ["/api/content"],
  });

  const handleBuyNow = (packageBuyUrl: string) => {
    if (packageBuyUrl && packageBuyUrl !== "#") {
      window.open(packageBuyUrl, "_blank");
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-6xl w-full mx-4 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800" data-testid="packages-title">
              Travel Packages for {destinationName}
            </h2>
            <p className="text-gray-600 mt-1" data-testid="packages-subtitle">
              Discover amazing travel experiences
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            data-testid="packages-close-button"
            aria-label="Close packages"
          >
            ×
          </button>
        </div>

        {packages && packages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {packages.map((pkg) => (
              <Card key={pkg.id} className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`package-card-${pkg.id}`}>
                <div className="relative">
                  <img
                    src={pkg.imageUrl}
                    alt={pkg.name}
                    className="w-full h-48 object-cover"
                    data-testid={`package-image-${pkg.id}`}
                  />
                  {pkg.isFeatured && (
                    <Badge className="absolute top-3 left-3 bg-blue-500 text-white" data-testid={`package-featured-${pkg.id}`}>
                      Featured
                    </Badge>
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2" data-testid={`package-name-${pkg.id}`}>
                    {pkg.name}
                  </h3>
                  
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm" data-testid={`package-location-${pkg.id}`}>{pkg.location}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-3">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="text-sm" data-testid={`package-duration-${pkg.id}`}>{pkg.duration}</span>
                  </div>
                  
                  <p className="text-gray-700 mb-4 text-sm leading-relaxed" data-testid={`package-description-${pkg.id}`}>
                    {pkg.description}
                  </p>
                  
                  {pkg.highlights && pkg.highlights.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-800 mb-2">Highlights:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {pkg.highlights.map((highlight, index) => (
                          <li key={index} className="flex items-start" data-testid={`package-highlight-${pkg.id}-${index}`}>
                            <Star className="w-3 h-3 mr-2 mt-0.5 text-yellow-500 flex-shrink-0" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <span className="text-2xl font-bold text-blue-600" data-testid={`package-price-${pkg.id}`}>
                        {pkg.pricePerPerson}
                      </span>
                      <span className="text-gray-600 text-sm ml-1">per person</span>
                    </div>
                    <Button 
                      onClick={() => handleBuyNow(pkg.buyNowUrl)}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                      data-testid={`package-buy-${pkg.id}`}
                    >
                      Buy Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12" data-testid="no-packages">
            <div className="text-gray-400 mb-4">
              <MapPin className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Packages Available</h3>
            <p className="text-gray-500">
              We're working on exciting travel packages for {destinationName}. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}