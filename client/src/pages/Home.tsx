import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Hero from "@/components/Hero";
import { STOCK_IMAGES } from "@/lib/constants";

export default function Home() {
  const { data: content = {} } = useQuery<Record<string, string>>({
    queryKey: ["/api/content"],
  });

  return (
    <>
      <Hero
        title={content["hero.title"] || "Explore the World with TTRAVE"}
        subtitle={content["hero.subtitle"] || "Book your next adventure with us!"}
        backgroundImage={STOCK_IMAGES.hero}
      >
        <Button 
          className="btn-primary-ttrave text-lg px-8 py-3"
          data-testid="hero-enquire-button"
          onClick={() => {
            const inquiryUrl = content["inquiry.url"] || "#";
            if (inquiryUrl !== "#") {
              window.open(inquiryUrl, "_blank");
            }
          }}
        >
          {content["inquiry.button.text"] || "Enquire Now"}
        </Button>
      </Hero>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-poppins text-3xl md:text-4xl font-semibold text-ttrave-primary mb-4">
              What kind of journey are you looking for?
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="destination-card">
              <img
                src={STOCK_IMAGES.domestic}
                alt="Domestic Adventures - Indian Landmarks"
                className="w-full h-64 object-cover"
              />
              <CardContent className="card-content">
                <h3 className="font-poppins text-xl font-semibold text-ttrave-primary mb-4">
                  Domestic Adventures
                </h3>
                <p className="text-gray-600 mb-6">
                  Discover India's hidden gems with hand-picked tour packages across the country.
                </p>
                <Link href="/domestic">
                  <Button 
                    className="btn-primary-ttrave"
                    data-testid="domestic-nav-button"
                  >
                    Domestic
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="destination-card">
              <img
                src={STOCK_IMAGES.international}
                alt="International Escapes - Airplane View"
                className="w-full h-64 object-cover"
              />
              <CardContent className="card-content">
                <h3 className="font-poppins text-xl font-semibold text-ttrave-primary mb-4">
                  International Escapes
                </h3>
                <p className="text-gray-600 mb-6">
                  Experience the world with curated global vacations, made seamless and memorable.
                </p>
                <Link href="/international">
                  <Button 
                    className="btn-primary-ttrave"
                    data-testid="international-nav-button"
                  >
                    International
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
