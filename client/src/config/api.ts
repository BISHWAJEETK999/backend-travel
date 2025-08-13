// API Configuration for different environments
export const API_CONFIG = {
  // For frontend-only deployment, use mock data or external APIs
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-url.railway.app' // Replace with your backend URL later
    : 'http://localhost:5000',
  
  // Enable mock mode for frontend-only deployment
  USE_MOCK_DATA: true, // Set to false when backend is ready
};

// Mock data for frontend-only deployment
export const MOCK_DATA = {
  destinations: [
    {
      id: '1',
      name: 'Goa Beaches',
      location: 'Goa, India',
      imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500',
      description: 'Beautiful beaches and vibrant nightlife',
      price: 15000,
      category: 'domestic'
    },
    {
      id: '2', 
      name: 'Kerala Backwaters',
      location: 'Kerala, India',
      imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=500',
      description: 'Serene backwaters and houseboats',
      price: 18000,
      category: 'domestic'
    },
    {
      id: '3',
      name: 'Dubai Marina',
      location: 'Dubai, UAE', 
      imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500',
      description: 'Luxury shopping and modern architecture',
      price: 45000,
      category: 'international'
    }
  ],
  content: {
    'site.name': 'TTravel Hospitality',
    'hero.title': 'Discover Amazing Destinations',
    'hero.subtitle': 'Your journey begins with us',
    'hero.button.text': 'Explore Now',
    'hero.button.url': '/destinations'
  },
  packages: [
    {
      id: '1',
      name: 'Golden Triangle Tour',
      price: 25000,
      duration: '7 days',
      description: 'Delhi, Agra, and Jaipur exploration',
      buyNowUrl: 'https://forms.google.com/sample'
    }
  ]
};