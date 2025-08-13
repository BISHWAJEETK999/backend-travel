import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Hero from "@/components/Hero";
import SearchBar from "@/components/SearchBar";
import DestinationCard from "@/components/DestinationCard";
import PackagesSection from "@/components/PackagesSection";

export default function Domestic() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDestination, setSelectedDestination] = useState<{id: string, name: string} | null>(null);

  const { data: destinations = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/destinations/domestic"],
  });

  const filteredDestinations = useMemo(() => {
    if (!searchTerm.trim()) return destinations;
    return destinations.filter((destination: any) =>
      destination.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [destinations, searchTerm]);

  const handleExploreDestination = (destinationId: string, destinationName: string) => {
    setSelectedDestination({ id: destinationId, name: destinationName });
  };

  const handleClosePackages = () => {
    setSelectedDestination(null);
  };

  return (
    <>
      <Hero
        title="Indian Destinations at a Glance"
      >
        <SearchBar
          placeholder="Search state or region..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </Hero>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center py-16">
              <div className="loading-spinner inline-block w-8 h-8 border-4 border-t-ttrave-primary border-gray-200 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading destinations...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDestinations.map((destination: any) => (
                <DestinationCard
                  key={destination.id}
                  id={destination.id}
                  name={destination.name}
                  imageUrl={destination.imageUrl}
                  formUrl={destination.formUrl}
                  icon={destination.icon}
                  onExplore={handleExploreDestination}
                />
              ))}
            </div>
          )}

          {!isLoading && filteredDestinations.length === 0 && searchTerm && (
            <div className="text-center py-16">
              <i className="bi bi-search text-6xl text-gray-300 mb-4"></i>
              <p className="text-xl text-gray-600 mb-2">No destinations found</p>
              <p className="text-gray-500">Try searching with different keywords</p>
            </div>
          )}
        </div>
      </section>

      {selectedDestination && (
        <PackagesSection
          destinationId={selectedDestination.id}
          destinationName={selectedDestination.name}
          onClose={handleClosePackages}
        />
      )}
    </>
  );
}
