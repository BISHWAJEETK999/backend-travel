import { type User, type InsertUser, type Destination, type InsertDestination, type Content, type InsertContent, type ContactSubmission, type InsertContactSubmission, type NewsletterSubscription, type InsertNewsletterSubscription, type Package, type InsertPackage, type GalleryImage, type InsertGalleryImage } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(id: string, newPassword: string): Promise<User | undefined>;
  
  // Destinations
  getDestinations(): Promise<Destination[]>;
  getDestinationsByType(type: 'domestic' | 'international'): Promise<Destination[]>;
  getDestination(id: string): Promise<Destination | undefined>;
  createDestination(destination: InsertDestination): Promise<Destination>;
  updateDestination(id: string, destination: Partial<InsertDestination>): Promise<Destination | undefined>;
  deleteDestination(id: string): Promise<boolean>;
  
  // Content
  getContent(): Promise<Content[]>;
  getContentByKey(key: string): Promise<Content | undefined>;
  setContent(content: InsertContent): Promise<Content>;
  updateContent(key: string, value: string): Promise<Content | undefined>;
  
  // Contact Submissions
  getContactSubmissions(): Promise<ContactSubmission[]>;
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  updateContactSubmissionStatus(id: string, status: string): Promise<ContactSubmission | undefined>;
  
  // Newsletter Subscriptions
  getNewsletterSubscriptions(): Promise<NewsletterSubscription[]>;
  createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;
  
  // Packages
  getPackages(): Promise<Package[]>;
  getPackagesByDestination(destinationId: string): Promise<Package[]>;
  getPackage(id: string): Promise<Package | undefined>;
  createPackage(packageData: InsertPackage): Promise<Package>;
  updatePackage(id: string, packageData: Partial<InsertPackage>): Promise<Package | undefined>;
  deletePackage(id: string): Promise<boolean>;
  
  // Gallery Images
  getGalleryImages(): Promise<GalleryImage[]>;
  getApprovedGalleryImages(): Promise<GalleryImage[]>;
  createGalleryImage(imageData: InsertGalleryImage): Promise<GalleryImage>;
  approveGalleryImage(id: string): Promise<GalleryImage | undefined>;
  deleteGalleryImage(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private destinations: Map<string, Destination>;
  private content: Map<string, Content>;
  private contactSubmissions: Map<string, ContactSubmission>;
  private newsletterSubscriptions: Map<string, NewsletterSubscription>;
  private packages: Map<string, Package>;
  private galleryImages: Map<string, GalleryImage>;

  constructor() {
    this.users = new Map();
    this.destinations = new Map();
    this.content = new Map();
    this.contactSubmissions = new Map();
    this.newsletterSubscriptions = new Map();
    this.packages = new Map();
    this.galleryImages = new Map();
    
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create admin user
    const adminId = randomUUID();
    this.users.set(adminId, {
      id: adminId,
      username: "admin",
      password: "Ttrave" // In production, this should be hashed
    });

    // Initialize default content
    const defaultContent = [
      { key: "site.name", value: "TTravel Hospitality" },
      { key: "hero.title", value: "Explore the World with TTRAVE" },
      { key: "hero.subtitle", value: "Book your next adventure with us!" },
      { key: "company.name", value: "TTravel Hospitality" },
      { key: "contact.phone", value: "+91 8100331032" },
      { key: "contact.email", value: "ttrave.travelagency@gmail.com" },
      { key: "contact.address", value: "B-12, Shop No. - 111/19, Saptaparni Market, Kalyani Central Park - ward no. 11, Nadia- 741235, West Bengal, India" },
      { key: "social.facebook", value: "#" },
      { key: "social.instagram", value: "#" },
      { key: "social.linkedin", value: "#" },
      { key: "social.twitter", value: "#" },
      { key: "inquiry.url", value: "https://forms.gle/your-inquiry-form-id" },
      { key: "inquiry.button.text", value: "Enquire Now" },
      
      // About page content
      { key: "about.hero.title", value: "About TTravel Hospitality" },
      { key: "about.hero.subtitle", value: "Your trusted partner for unforgettable travel experiences" },
      { key: "about.who.title", value: "Who We Are" },
      { key: "about.who.description1", value: "TTravel Hospitality is a premier travel agency dedicated to creating extraordinary travel experiences. With over a decade of expertise in the travel industry, we specialize in both domestic and international travel packages that cater to every traveler's dreams." },
      { key: "about.who.description2", value: "Our team of experienced travel consultants works tirelessly to ensure that every journey you take with us is seamless, memorable, and perfectly tailored to your preferences. From cultural expeditions to adventure tours, we have something special for everyone." },
      { key: "about.who.image", value: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=400&fit=crop" },
      { key: "about.values.title", value: "Our Core Values" },
      { key: "about.mission.title", value: "Our Mission" },
      { key: "about.mission.description", value: "To provide exceptional travel experiences that create lasting memories and foster cultural understanding through personalized service and attention to detail." },
      { key: "about.vision.title", value: "Our Vision" },
      { key: "about.vision.description", value: "To be the leading travel agency that connects people with the world's most beautiful destinations while promoting sustainable and responsible tourism practices." },
      { key: "about.values.description.title", value: "Our Values" },
      { key: "about.values.description", value: "Integrity, Excellence, Customer Focus, Innovation, and Sustainability guide every decision we make and every service we provide to our valued customers." },
    ];

    defaultContent.forEach(item => {
      const id = randomUUID();
      this.content.set(item.key, {
        id,
        key: item.key,
        value: item.value,
        updatedAt: new Date()
      });
    });

    // Initialize domestic destinations (Indian states/UTs)
    const domesticDestinations = [
      "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
      "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
      "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
      "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
      "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
      "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
      "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
    ];

    domesticDestinations.forEach(name => {
      const id = randomUUID();
      this.destinations.set(id, {
        id,
        name,
        type: "domestic",
        imageUrl: `https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=200&fit=crop`,
        formUrl: `https://forms.gle/placeholder-${name.toLowerCase().replace(/\s+/g, '-')}`,
        icon: "bi-geo-alt-fill",
        isActive: true,
        createdAt: new Date()
      });
    });

    // Initialize international destinations
    const internationalDestinations = [
      "France", "United Kingdom", "Italy", "Switzerland", "Japan", "Thailand",
      "Australia", "New Zealand", "Singapore", "Malaysia", "Dubai", "Turkey"
    ];

    internationalDestinations.forEach(name => {
      const id = randomUUID();
      this.destinations.set(id, {
        id,
        name,
        type: "international",
        imageUrl: `https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=200&fit=crop`,
        formUrl: `https://forms.gle/placeholder-${name.toLowerCase().replace(/\s+/g, '-')}`,
        icon: "bi-geo-alt-fill",
        isActive: true,
        createdAt: new Date()
      });
    });

    // Initialize sample packages
    this.initializeSamplePackages();
  }

  private initializeSamplePackages() {
    // Get some destinations to link packages to
    const destinations = Array.from(this.destinations.values());
    const apDestination = destinations.find(d => d.name === "Andhra Pradesh");
    const rajasthanDestination = destinations.find(d => d.name === "Rajasthan");
    const franceDestination = destinations.find(d => d.name === "France");
    
    if (apDestination) {
      const packageId = randomUUID();
      this.packages.set(packageId, {
        id: packageId,
        destinationId: apDestination.id,
        name: "Golden Triangle Tour",
        description: "Discover India's hidden gems with hand-picked tour packages across the country.",
        imageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&h=300&fit=crop",
        pricePerPerson: "₹25,000",
        duration: "6 Days / 5 Nights",
        highlights: ["Visit to Taj Mahal", "Red Fort Delhi", "Amber Fort Jaipur"],
        location: "Delhi - Agra - Jaipur",
        buyNowUrl: "https://forms.gle/golden-triangle-tour-booking",
        isFeatured: true,
        isActive: true,
        createdAt: new Date()
      });
    }

    if (rajasthanDestination) {
      const packageId = randomUUID();
      this.packages.set(packageId, {
        id: packageId,
        destinationId: rajasthanDestination.id,
        name: "Royal Rajasthan Experience",
        description: "Experience the royal heritage and culture of Rajasthan with our premium packages.",
        imageUrl: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400&h=300&fit=crop",
        pricePerPerson: "₹35,000",
        duration: "8 Days / 7 Nights",
        highlights: ["City Palace Udaipur", "Mehrangarh Fort Jodhpur", "Desert Safari Jaisalmer"],
        location: "Jaipur - Udaipur - Jodhpur - Jaisalmer",
        buyNowUrl: "https://forms.gle/royal-rajasthan-booking",
        isFeatured: false,
        isActive: true,
        createdAt: new Date()
      });
    }

    if (franceDestination) {
      const packageId = randomUUID();
      this.packages.set(packageId, {
        id: packageId,
        destinationId: franceDestination.id,
        name: "Paris & French Riviera",
        description: "Explore the romance of Paris and the glamour of the French Riviera in this premium package.",
        imageUrl: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop",
        pricePerPerson: "€2,500",
        duration: "10 Days / 9 Nights",
        highlights: ["Eiffel Tower Tour", "Louvre Museum", "Nice & Cannes", "Monaco Grand Prix Circuit"],
        location: "Paris - Nice - Cannes - Monaco",
        buyNowUrl: "https://forms.gle/paris-riviera-booking",
        isFeatured: true,
        isActive: true,
        createdAt: new Date()
      });
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUserPassword(id: string, newPassword: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, password: newPassword };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Destination methods
  async getDestinations(): Promise<Destination[]> {
    return Array.from(this.destinations.values()).filter(d => d.isActive);
  }

  async getDestinationsByType(type: 'domestic' | 'international'): Promise<Destination[]> {
    return Array.from(this.destinations.values()).filter(d => d.type === type && d.isActive);
  }

  async getDestination(id: string): Promise<Destination | undefined> {
    return this.destinations.get(id);
  }

  async createDestination(insertDestination: InsertDestination): Promise<Destination> {
    const id = randomUUID();
    const destination: Destination = {
      ...insertDestination,
      id,
      icon: insertDestination.icon || "bi-geo-alt-fill",
      isActive: insertDestination.isActive ?? true,
      createdAt: new Date()
    };
    this.destinations.set(id, destination);
    return destination;
  }

  async updateDestination(id: string, updates: Partial<InsertDestination>): Promise<Destination | undefined> {
    const destination = this.destinations.get(id);
    if (!destination) return undefined;
    
    const updatedDestination = { ...destination, ...updates };
    this.destinations.set(id, updatedDestination);
    return updatedDestination;
  }

  async deleteDestination(id: string): Promise<boolean> {
    const destination = this.destinations.get(id);
    if (!destination) return false;
    
    const updatedDestination = { ...destination, isActive: false };
    this.destinations.set(id, updatedDestination);
    return true;
  }

  // Content methods
  async getContent(): Promise<Content[]> {
    return Array.from(this.content.values());
  }

  async getContentByKey(key: string): Promise<Content | undefined> {
    return this.content.get(key);
  }

  async setContent(insertContent: InsertContent): Promise<Content> {
    const id = randomUUID();
    const content: Content = {
      ...insertContent,
      id,
      updatedAt: new Date()
    };
    this.content.set(insertContent.key, content);
    return content;
  }

  async updateContent(key: string, value: string): Promise<Content | undefined> {
    const content = this.content.get(key);
    if (!content) return undefined;
    
    const updatedContent = { ...content, value, updatedAt: new Date() };
    this.content.set(key, updatedContent);
    return updatedContent;
  }

  // Contact submission methods
  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return Array.from(this.contactSubmissions.values()).sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  async createContactSubmission(insertSubmission: InsertContactSubmission): Promise<ContactSubmission> {
    const id = randomUUID();
    const submission: ContactSubmission = {
      ...insertSubmission,
      id,
      status: "pending",
      createdAt: new Date()
    };
    this.contactSubmissions.set(id, submission);
    return submission;
  }

  async updateContactSubmissionStatus(id: string, status: string): Promise<ContactSubmission | undefined> {
    const submission = this.contactSubmissions.get(id);
    if (!submission) return undefined;
    
    const updatedSubmission = { ...submission, status };
    this.contactSubmissions.set(id, updatedSubmission);
    return updatedSubmission;
  }

  // Newsletter subscription methods
  async getNewsletterSubscriptions(): Promise<NewsletterSubscription[]> {
    return Array.from(this.newsletterSubscriptions.values()).filter(s => s.isActive);
  }

  async createNewsletterSubscription(insertSubscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    // Check if email already exists
    const existing = Array.from(this.newsletterSubscriptions.values()).find(s => s.email === insertSubscription.email);
    if (existing) {
      if (!existing.isActive) {
        // Reactivate existing subscription
        const reactivated = { ...existing, isActive: true };
        this.newsletterSubscriptions.set(existing.id, reactivated);
        return reactivated;
      }
      return existing;
    }

    const id = randomUUID();
    const subscription: NewsletterSubscription = {
      ...insertSubscription,
      id,
      isActive: true,
      createdAt: new Date()
    };
    this.newsletterSubscriptions.set(id, subscription);
    return subscription;
  }

  // Package methods
  async getPackages(): Promise<Package[]> {
    return Array.from(this.packages.values()).filter(p => p.isActive);
  }

  async getPackagesByDestination(destinationId: string): Promise<Package[]> {
    return Array.from(this.packages.values()).filter(p => p.destinationId === destinationId && p.isActive);
  }

  async getPackage(id: string): Promise<Package | undefined> {
    return this.packages.get(id);
  }

  async createPackage(insertPackage: InsertPackage): Promise<Package> {
    const id = randomUUID();
    const packageData: Package = {
      ...insertPackage,
      id,
      isFeatured: insertPackage.isFeatured ?? false,
      isActive: insertPackage.isActive ?? true,
      createdAt: new Date()
    };
    this.packages.set(id, packageData);
    return packageData;
  }

  async updatePackage(id: string, updates: Partial<InsertPackage>): Promise<Package | undefined> {
    const packageData = this.packages.get(id);
    if (!packageData) return undefined;
    
    const updatedPackage = { ...packageData, ...updates };
    this.packages.set(id, updatedPackage);
    return updatedPackage;
  }

  async deletePackage(id: string): Promise<boolean> {
    const packageData = this.packages.get(id);
    if (!packageData) return false;
    
    const updatedPackage = { ...packageData, isActive: false };
    this.packages.set(id, updatedPackage);
    return true;
  }

  // Gallery Image methods
  async getGalleryImages(): Promise<GalleryImage[]> {
    return Array.from(this.galleryImages.values());
  }

  async getApprovedGalleryImages(): Promise<GalleryImage[]> {
    return Array.from(this.galleryImages.values()).filter(img => img.isApproved);
  }

  async createGalleryImage(imageData: InsertGalleryImage): Promise<GalleryImage> {
    const id = randomUUID();
    const galleryImage: GalleryImage = {
      ...imageData,
      id,
      isApproved: false,
      createdAt: new Date()
    };
    this.galleryImages.set(id, galleryImage);
    return galleryImage;
  }

  async approveGalleryImage(id: string): Promise<GalleryImage | undefined> {
    const galleryImage = this.galleryImages.get(id);
    if (galleryImage) {
      const updatedImage = { ...galleryImage, isApproved: true };
      this.galleryImages.set(id, updatedImage);
      return updatedImage;
    }
    return undefined;
  }

  async deleteGalleryImage(id: string): Promise<boolean> {
    const deleted = this.galleryImages.delete(id);
    return deleted;
  }
}

// Database Storage Implementation
import { db } from "./db";
import { users, destinations, content, contactSubmissions, newsletterSubscriptions, packages, galleryImages } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export class DbStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUserPassword(id: string, newPassword: string): Promise<User | undefined> {
    const result = await db.update(users)
      .set({ password: newPassword })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  // Destination methods
  async getDestinations(): Promise<Destination[]> {
    return await db.select().from(destinations).where(eq(destinations.isActive, true));
  }

  async getDestinationsByType(type: 'domestic' | 'international'): Promise<Destination[]> {
    return await db.select().from(destinations)
      .where(and(eq(destinations.type, type), eq(destinations.isActive, true)));
  }

  async getDestination(id: string): Promise<Destination | undefined> {
    const result = await db.select().from(destinations).where(eq(destinations.id, id));
    return result[0];
  }

  async createDestination(insertDestination: InsertDestination): Promise<Destination> {
    const result = await db.insert(destinations).values({
      ...insertDestination,
      icon: insertDestination.icon || "bi-geo-alt-fill",
      isActive: insertDestination.isActive ?? true,
    }).returning();
    return result[0];
  }

  async updateDestination(id: string, updates: Partial<InsertDestination>): Promise<Destination | undefined> {
    const result = await db.update(destinations)
      .set(updates)
      .where(eq(destinations.id, id))
      .returning();
    return result[0];
  }

  async deleteDestination(id: string): Promise<boolean> {
    const result = await db.update(destinations)
      .set({ isActive: false })
      .where(eq(destinations.id, id))
      .returning();
    return result.length > 0;
  }

  // Content methods
  async getContent(): Promise<Content[]> {
    return await db.select().from(content);
  }

  async getContentByKey(key: string): Promise<Content | undefined> {
    const result = await db.select().from(content).where(eq(content.key, key));
    return result[0];
  }

  async setContent(insertContent: InsertContent): Promise<Content> {
    const result = await db.insert(content).values(insertContent)
      .onConflictDoUpdate({
        target: content.key,
        set: { value: insertContent.value, updatedAt: new Date() }
      }).returning();
    return result[0];
  }

  async updateContent(key: string, value: string): Promise<Content | undefined> {
    const result = await db.update(content)
      .set({ value, updatedAt: new Date() })
      .where(eq(content.key, key))
      .returning();
    return result[0];
  }

  // Contact submission methods
  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return await db.select().from(contactSubmissions);
  }

  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const result = await db.insert(contactSubmissions).values(submission).returning();
    return result[0];
  }

  async updateContactSubmissionStatus(id: string, status: string): Promise<ContactSubmission | undefined> {
    const result = await db.update(contactSubmissions)
      .set({ status })
      .where(eq(contactSubmissions.id, id))
      .returning();
    return result[0];
  }

  // Newsletter subscription methods
  async getNewsletterSubscriptions(): Promise<NewsletterSubscription[]> {
    return await db.select().from(newsletterSubscriptions).where(eq(newsletterSubscriptions.isActive, true));
  }

  async createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    const existing = await db.select().from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.email, subscription.email));
    
    if (existing.length > 0) {
      const result = await db.update(newsletterSubscriptions)
        .set({ isActive: true })
        .where(eq(newsletterSubscriptions.id, existing[0].id))
        .returning();
      return result[0];
    }

    const result = await db.insert(newsletterSubscriptions).values(subscription).returning();
    return result[0];
  }

  // Package methods
  async getPackages(): Promise<Package[]> {
    return await db.select().from(packages).where(eq(packages.isActive, true));
  }

  async getPackagesByDestination(destinationId: string): Promise<Package[]> {
    return await db.select().from(packages)
      .where(and(eq(packages.destinationId, destinationId), eq(packages.isActive, true)));
  }

  async getPackage(id: string): Promise<Package | undefined> {
    const result = await db.select().from(packages).where(eq(packages.id, id));
    return result[0];
  }

  async createPackage(packageData: InsertPackage): Promise<Package> {
    const result = await db.insert(packages).values({
      ...packageData,
      isFeatured: packageData.isFeatured ?? false,
      isActive: packageData.isActive ?? true,
    }).returning();
    return result[0];
  }

  async updatePackage(id: string, updates: Partial<InsertPackage>): Promise<Package | undefined> {
    const result = await db.update(packages)
      .set(updates)
      .where(eq(packages.id, id))
      .returning();
    return result[0];
  }

  async deletePackage(id: string): Promise<boolean> {
    const result = await db.update(packages)
      .set({ isActive: false })
      .where(eq(packages.id, id))
      .returning();
    return result.length > 0;
  }

  // Gallery Image methods
  async getGalleryImages(): Promise<GalleryImage[]> {
    return await db.select().from(galleryImages);
  }

  async getApprovedGalleryImages(): Promise<GalleryImage[]> {
    return await db.select().from(galleryImages).where(eq(galleryImages.isApproved, true));
  }

  async createGalleryImage(imageData: InsertGalleryImage): Promise<GalleryImage> {
    const result = await db.insert(galleryImages).values({
      ...imageData,
      isApproved: false,
    }).returning();
    return result[0];
  }

  async approveGalleryImage(id: string): Promise<GalleryImage | undefined> {
    const result = await db.update(galleryImages)
      .set({ isApproved: true })
      .where(eq(galleryImages.id, id))
      .returning();
    return result[0];
  }

  async deleteGalleryImage(id: string): Promise<boolean> {
    const result = await db.delete(galleryImages)
      .where(eq(galleryImages.id, id))
      .returning();
    return result.length > 0;
  }
}

// Function to initialize database with default data
async function initializeDatabase() {
  try {
    // Check if admin user exists
    const existingUser = await db.select().from(users).where(eq(users.username, "admin"));
    
    if (existingUser.length === 0) {
      // Create admin user
      await db.insert(users).values({
        username: "admin",
        password: "8709612003" // Your current password
      });
      console.log("Admin user created with password: 8709612003");
    }

    // Initialize default content if not exists
    const existingContent = await db.select().from(content).limit(1);
    if (existingContent.length === 0) {
      const defaultContentData = [
        { key: "site.name", value: "TTravel Hospitality" },
        { key: "hero.title", value: "Explore the World with TTRAVE" },
        { key: "hero.subtitle", value: "Book your next adventure with us!" },
        { key: "company.name", value: "TTravel Hospitality" },
        { key: "contact.phone", value: "+91 8100331032" },
        { key: "contact.email", value: "ttrave.travelagency@gmail.com" },
        { key: "contact.address", value: "B-12, Shop No. - 111/19, Saptaparni Market, Kalyani Central Park - ward no. 11, Nadia- 741235, West Bengal, India" },
        { key: "social.facebook", value: "#" },
        { key: "social.instagram", value: "#" },
        { key: "social.linkedin", value: "#" },
        { key: "social.twitter", value: "#" },
        { key: "inquiry.url", value: "https://forms.gle/your-inquiry-form-id" },
        { key: "inquiry.button.text", value: "Enquire Now" },
        { key: "about.hero.title", value: "About TTravel Hospitality" },
        { key: "about.hero.subtitle", value: "Your trusted partner for unforgettable travel experiences" },
        { key: "about.who.title", value: "Who We Are" },
        { key: "about.who.description1", value: "TTravel Hospitality is a premier travel agency dedicated to creating extraordinary travel experiences. With over a decade of expertise in the travel industry, we specialize in both domestic and international travel packages that cater to every traveler's dreams." },
        { key: "about.who.description2", value: "Our team of experienced travel consultants works tirelessly to ensure that every journey you take with us is seamless, memorable, and perfectly tailored to your preferences. From cultural expeditions to adventure tours, we have something special for everyone." },
        { key: "about.who.image", value: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=400&fit=crop" },
        { key: "about.values.title", value: "Our Core Values" },
        { key: "about.mission.title", value: "Our Mission" },
        { key: "about.mission.description", value: "To provide exceptional travel experiences that create lasting memories and foster cultural understanding through personalized service and attention to detail." },
        { key: "about.vision.title", value: "Our Vision" },
        { key: "about.vision.description", value: "To be the leading travel agency that connects people with the world's most beautiful destinations while promoting sustainable and responsible tourism practices." },
        { key: "about.values.description.title", value: "Our Values" },
        { key: "about.values.description", value: "Integrity, Excellence, Customer Focus, Innovation, and Sustainability guide every decision we make and every service we provide to our valued customers." },
      ];

      await db.insert(content).values(defaultContentData);
      console.log("Default content initialized");
    }
    
    console.log("Database initialization completed");
  } catch (error) {
    console.error("Database initialization failed:", error);
  }
}

// Use memory storage for VS Code development (better compatibility)
export const storage = new MemStorage();

console.log("Using MemStorage for VS Code development environment");
