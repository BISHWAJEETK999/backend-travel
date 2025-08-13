import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import Hero from "@/components/Hero";

export default function About() {
  const { data: content = {} } = useQuery<Record<string, string>>({
    queryKey: ["/api/content"],
  });

  return (
    <>
      <Hero
        title={content["about.hero.title"] || "About TTravel Hospitality"}
        subtitle={content["about.hero.subtitle"] || "Your trusted partner for unforgettable travel experiences"}
      />

      {/* Who We Are Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-poppins text-3xl font-semibold mb-6 text-ttrave-dark-gray">
                {content["about.who.title"] || "Who We Are"}
              </h2>
              <p className="text-lg mb-6 text-gray-700 leading-relaxed">
                {content["about.who.description1"] || "TTravel Hospitality is a premier travel agency dedicated to creating extraordinary travel experiences. With over a decade of expertise in the travel industry, we specialize in both domestic and international travel packages that cater to every traveler's dreams."}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {content["about.who.description2"] || "Our team of experienced travel consultants works tirelessly to ensure that every journey you take with us is seamless, memorable, and perfectly tailored to your preferences. From cultural expeditions to adventure tours, we have something special for everyone."}
              </p>
            </div>
            <div>
              <img
                src={content["about.who.image"] || "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=400&fit=crop"}
                alt="Travel Planning"
                className="rounded-2xl shadow-xl w-full"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-16 bg-ttrave-light-gray">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-poppins text-3xl font-semibold text-ttrave-dark-gray">
              {content["about.values.title"] || "Our Core Values"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg h-full">
              <CardContent className="p-8">
                <div className="text-ttrave-primary mb-6">
                  <i className="bi bi-bullseye text-5xl"></i>
                </div>
                <h4 className="font-poppins text-xl font-semibold mb-4 text-ttrave-dark-gray">
                  {content["about.mission.title"] || "Our Mission"}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {content["about.mission.description"] || "To provide exceptional travel experiences that create lasting memories and foster cultural understanding through personalized service and attention to detail."}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg h-full">
              <CardContent className="p-8">
                <div className="text-ttrave-primary mb-6">
                  <i className="bi bi-eye text-5xl"></i>
                </div>
                <h4 className="font-poppins text-xl font-semibold mb-4 text-ttrave-dark-gray">
                  {content["about.vision.title"] || "Our Vision"}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {content["about.vision.description"] || "To be the leading travel agency that connects people with the world's most beautiful destinations while promoting sustainable and responsible tourism practices."}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg h-full">
              <CardContent className="p-8">
                <div className="text-ttrave-primary mb-6">
                  <i className="bi bi-heart text-5xl"></i>
                </div>
                <h4 className="font-poppins text-xl font-semibold mb-4 text-ttrave-dark-gray">
                  {content["about.values.description.title"] || "Our Values"}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {content["about.values.description"] || "Integrity, Excellence, Customer Focus, Innovation, and Sustainability guide every decision we make and every service we provide to our valued customers."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
