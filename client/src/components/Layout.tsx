import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const { data: content = {} } = useQuery<Record<string, string>>({
    queryKey: ["/api/content"],
  });

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest("POST", "/api/newsletter", { email: newsletterEmail });
      toast({
        title: "Success!",
        description: "Thank you for subscribing to our newsletter!",
      });
      setNewsletterEmail("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    }
  };

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/gallery", label: "Gallery" },
    { path: "/domestic", label: "Domestic" },
    { path: "/international", label: "International" },
    { path: "/contact", label: "Contact" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="navbar-ttrave sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              {content["site.logo"] ? (
                <img 
                  src={content["site.logo"]} 
                  alt="Logo" 
                  className="h-8 w-auto"
                  data-testid="site-logo"
                />
              ) : (
                <i className="bi bi-airplane text-2xl text-ttrave-primary"></i>
              )}
              <span className="font-poppins text-xl font-bold text-ttrave-primary">
                {content["site.name"] || "TTravel Hospitality"}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`nav-link-ttrave ${
                    location === item.path ? "active" : ""
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-ttrave-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-button"
            >
              <i className={`bi ${mobileMenuOpen ? 'bi-x' : 'bi-list'} text-2xl`}></i>
            </button>
          </div>
          
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`px-4 py-2 text-ttrave-dark-gray hover:text-ttrave-primary hover:bg-gray-50 transition-colors ${
                      location === item.path ? "text-ttrave-primary bg-blue-50 border-r-2 border-ttrave-primary" : ""
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`mobile-nav-${item.label.toLowerCase()}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="footer-ttrave">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Company Info */}
            <div>
              <h5 className="font-poppins text-lg font-semibold mb-4">
                TTRAVE
              </h5>
              <p className="mb-4">Explore The World With Us</p>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <i className="bi bi-telephone me-2"></i>
                  <span>{content["contact.phone"] || "+91 8100331032"}</span>
                </div>
                <div className="flex items-center">
                  <i className="bi bi-envelope me-2"></i>
                  <span>{content["contact.email"] || "ttrave.travelagency@gmail.com"}</span>
                </div>
                <div className="flex items-start">
                  <i className="bi bi-geo-alt me-2 mt-1"></i>
                  <span>
                    {content["contact.address"] || 
                      "B-12, Shop No. - 111/19, Saptaparni Market, Kalyani Central Park - ward no. 11, Nadia- 741235, West Bengal, India"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h5 className="font-poppins text-lg font-semibold mb-4">
                Quick Links
              </h5>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className="hover:text-ttrave-light-blue transition-colors"
                      data-testid={`footer-link-${item.label.toLowerCase()}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h5 className="font-poppins text-lg font-semibold mb-4">
                Subscribe to Newsletter
              </h5>
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <div className="flex">
                  <Input
                    type="email"
                    placeholder="Your email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    className="rounded-r-none"
                    data-testid="newsletter-email-input"
                  />
                  <Button
                    type="submit"
                    className="btn-primary-ttrave rounded-l-none"
                    data-testid="newsletter-subscribe-button"
                  >
                    Subscribe
                  </Button>
                </div>
              </form>

              {/* Social Media */}
              <div className="flex space-x-4 mt-6">
                <a
                  href={content["social.facebook"] || "#"}
                  className="text-white hover:text-ttrave-light-blue text-xl"
                  data-testid="social-facebook"
                >
                  <i className="bi bi-facebook"></i>
                </a>
                <a
                  href={content["social.twitter"] || "#"}
                  className="text-white hover:text-ttrave-light-blue text-xl"
                  data-testid="social-twitter"
                >
                  <i className="bi bi-twitter"></i>
                </a>
                <a
                  href={content["social.instagram"] || "#"}
                  className="text-white hover:text-ttrave-light-blue text-xl"
                  data-testid="social-instagram"
                >
                  <i className="bi bi-instagram"></i>
                </a>
                <a
                  href={content["social.linkedin"] || "#"}
                  className="text-white hover:text-ttrave-light-blue text-xl"
                  data-testid="social-linkedin"
                >
                  <i className="bi bi-linkedin"></i>
                </a>
              </div>
            </div>
          </div>

          <hr className="my-8 border-gray-600" />
          
          <div className="text-center">
            <p>© 2025 TTRAVE Hospitality. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
