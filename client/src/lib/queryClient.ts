import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Mock data for frontend-only deployment
const MOCK_DATA = {
  '/api/content': {
    'site.name': 'TTravel Hospitality',
    'hero.title': 'Discover Amazing Destinations',
    'hero.subtitle': 'Your journey begins with us - Explore domestic and international destinations',
    'hero.button.text': 'Explore Packages',
    'hero.button.url': '/domestic',
    'about.hero.title': 'About TTravel Hospitality',
    'about.hero.subtitle': 'Your trusted travel partner since 2020',
    'about.who.title': 'Who We Are',
    'about.who.content': 'TTravel Hospitality is a premier travel agency dedicated to creating unforgettable travel experiences. We specialize in both domestic and international destinations.',
    'about.mission.title': 'Our Mission',
    'about.mission.content': 'To provide exceptional travel services and create lasting memories for our clients.',
    'about.vision.title': 'Our Vision', 
    'about.vision.content': 'To be the leading travel agency known for personalized service and expertise.',
    'about.values.title': 'Our Values',
    'about.values.content': 'Excellence, integrity, and customer satisfaction drive everything we do.'
  },
  '/api/destinations': [
    {
      id: '1',
      name: 'Goa Beaches',
      location: 'Goa, India',
      imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500',
      description: 'Beautiful beaches, vibrant nightlife, and Portuguese heritage',
      price: 15000,
      category: 'domestic'
    },
    {
      id: '2',
      name: 'Kerala Backwaters',
      location: 'Kerala, India', 
      imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=500',
      description: 'Serene backwaters, houseboats, and lush greenery',
      price: 18000,
      category: 'domestic'
    },
    {
      id: '3',
      name: 'Rajasthan Desert',
      location: 'Rajasthan, India',
      imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=500',
      description: 'Royal palaces, desert safaris, and cultural heritage',
      price: 22000,
      category: 'domestic'
    },
    {
      id: '4',
      name: 'Dubai Marina',
      location: 'Dubai, UAE',
      imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500',
      description: 'Luxury shopping, modern architecture, and desert adventures',
      price: 45000,
      category: 'international'
    },
    {
      id: '5',
      name: 'Singapore Gardens',
      location: 'Singapore',
      imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=500',
      description: 'Garden city, modern attractions, and diverse cuisine',
      price: 38000,
      category: 'international'
    },
    {
      id: '6',
      name: 'Bali Temples',
      location: 'Bali, Indonesia',
      imageUrl: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=500',
      description: 'Ancient temples, rice terraces, and tropical beaches',
      price: 35000,
      category: 'international'
    }
  ],
  '/api/packages': [
    {
      id: '1',
      name: 'Golden Triangle Tour',
      price: 25000,
      duration: '7 days',
      description: 'Explore Delhi, Agra, and Jaipur with guided tours and luxury accommodation',
      buyNowUrl: 'https://forms.google.com/sample-golden-triangle'
    },
    {
      id: '2', 
      name: 'Kerala Honeymoon Special',
      price: 35000,
      duration: '5 days',
      description: 'Romantic getaway with houseboat stay and hill station visits',
      buyNowUrl: 'https://forms.google.com/sample-kerala-honeymoon'
    },
    {
      id: '3',
      name: 'Dubai Shopping Festival',
      price: 55000,
      duration: '6 days',
      description: 'Shopping extravaganza with city tours and desert safari',
      buyNowUrl: 'https://forms.google.com/sample-dubai-shopping'
    }
  ],
  '/api/gallery': [
    {
      id: '1',
      imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500',
      approved: true,
      isBase64: false
    },
    {
      id: '2',
      imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=500', 
      approved: true,
      isBase64: false
    },
    {
      id: '3',
      imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500',
      approved: true,
      isBase64: false
    }
  ]
};

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // For frontend-only deployment, return mock responses
  if (url.startsWith('/api/')) {
    const mockResponse = MOCK_DATA[url as keyof typeof MOCK_DATA] || [];
    return new Response(JSON.stringify(mockResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    
    // Return mock data for frontend-only deployment
    if (url.startsWith('/api/')) {
      const mockResponse = MOCK_DATA[url as keyof typeof MOCK_DATA];
      if (mockResponse) {
        return mockResponse;
      }
    }

    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
