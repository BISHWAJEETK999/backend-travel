import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDestinationSchema, insertContentSchema, insertContactSubmissionSchema, insertNewsletterSubscriptionSchema, insertPackageSchema, insertGalleryImageSchema } from "@shared/schema";
import { z } from "zod";

const adminAuthSchema = z.object({
  username: z.string(),
  password: z.string()
});

const updateContentSchema = z.object({
  key: z.string(),
  value: z.string()
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware for admin routes
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (req.session?.authenticated) {
      next();
    } else {
      res.status(401).json({ message: "Authentication required" });
    }
  };

  // Admin authentication
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = adminAuthSchema.parse(req.body);
      console.log(`Login attempt - Username: ${username}, Password: ${password}`);
      
      const user = await storage.getUserByUsername(username);
      console.log(`User found:`, user);
      
      if (user && user.password === password) {
        req.session.authenticated = true;
        req.session.userId = user.id;
        console.log("Login successful");
        res.json({ success: true, message: "Login successful" });
      } else {
        console.log(`Login failed - User exists: ${!!user}, Password match: ${user?.password === password}`);
        console.log(`Expected: ${password}, Got: ${user?.password}`);
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      console.log("Login error:", error);
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true, message: "Logout successful" });
    });
  });

  app.get("/api/auth/check", (req, res) => {
    res.json({ authenticated: !!req.session?.authenticated });
  });

  // Public routes
  app.get("/api/destinations", async (req, res) => {
    try {
      const destinations = await storage.getDestinations();
      res.json(destinations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch destinations" });
    }
  });

  app.get("/api/destinations/:type", async (req, res) => {
    try {
      const type = req.params.type as 'domestic' | 'international';
      if (!['domestic', 'international'].includes(type)) {
        return res.status(400).json({ message: "Invalid destination type" });
      }
      
      const destinations = await storage.getDestinationsByType(type);
      res.json(destinations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch destinations" });
    }
  });

  app.get("/api/content", async (req, res) => {
    try {
      const content = await storage.getContent();
      const contentMap = content.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {} as Record<string, string>);
      res.json(contentMap);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const submission = insertContactSubmissionSchema.parse(req.body);
      const created = await storage.createContactSubmission(submission);
      res.json({ success: true, message: "Message sent successfully", id: created.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid form data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to submit contact form" });
      }
    }
  });

  // Newsletter subscription
  app.post("/api/newsletter", async (req, res) => {
    try {
      const subscription = insertNewsletterSubscriptionSchema.parse(req.body);
      await storage.createNewsletterSubscription(subscription);
      res.json({ success: true, message: "Successfully subscribed to newsletter" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid email address", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to subscribe to newsletter" });
      }
    }
  });

  // Protected admin routes
  app.get("/api/admin/destinations", requireAuth, async (req, res) => {
    try {
      const destinations = await storage.getDestinations();
      res.json(destinations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch destinations" });
    }
  });

  app.post("/api/admin/destinations", requireAuth, async (req, res) => {
    try {
      const destination = insertDestinationSchema.parse(req.body);
      const created = await storage.createDestination(destination);
      res.json(created);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid destination data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create destination" });
      }
    }
  });

  app.put("/api/admin/destinations/:id", requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      const updates = insertDestinationSchema.partial().parse(req.body);
      const updated = await storage.updateDestination(id, updates);
      
      if (updated) {
        res.json(updated);
      } else {
        res.status(404).json({ message: "Destination not found" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid destination data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update destination" });
      }
    }
  });

  app.delete("/api/admin/destinations/:id", requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      const deleted = await storage.deleteDestination(id);
      
      if (deleted) {
        res.json({ success: true, message: "Destination deleted successfully" });
      } else {
        res.status(404).json({ message: "Destination not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete destination" });
    }
  });

  app.put("/api/admin/content", requireAuth, async (req, res) => {
    try {
      const updates = z.array(updateContentSchema).parse(req.body);
      
      const updatedContent = await Promise.all(
        updates.map(async ({ key, value }) => {
          const existing = await storage.getContentByKey(key);
          if (existing) {
            return await storage.updateContent(key, value);
          } else {
            return await storage.setContent({ key, value });
          }
        })
      );
      
      res.json({ success: true, message: "Content updated successfully", content: updatedContent });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid content data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update content" });
      }
    }
  });

  app.get("/api/admin/contact-submissions", requireAuth, async (req, res) => {
    try {
      const submissions = await storage.getContactSubmissions();
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact submissions" });
    }
  });

  app.put("/api/admin/contact-submissions/:id/status", requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      const { status } = z.object({ status: z.string() }).parse(req.body);
      
      const updated = await storage.updateContactSubmissionStatus(id, status);
      if (updated) {
        res.json(updated);
      } else {
        res.status(404).json({ message: "Submission not found" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid status data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update submission status" });
      }
    }
  });

  // Mark contact submission as responded
  app.put("/api/admin/contact-submissions/:id/mark-responded", requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      const updated = await storage.updateContactSubmissionStatus(id, "responded");
      if (updated) {
        res.json({ success: true, message: "Submission marked as responded" });
      } else {
        res.status(404).json({ message: "Submission not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to update submission status" });
    }
  });

  // Change admin password
  app.put("/api/admin/change-password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(6)
      }).parse(req.body);
      
      // Get the current user from session
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Validate current password
      if (currentPassword !== user.password) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      // Update password in storage
      const updatedUser = await storage.updateUserPassword(userId, newPassword);
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update password" });
      }
      
      res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid password data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to change password" });
      }
    }
  });

  app.get("/api/admin/newsletter-subscriptions", requireAuth, async (req, res) => {
    try {
      const subscriptions = await storage.getNewsletterSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch newsletter subscriptions" });
    }
  });

  app.get("/api/admin/stats", requireAuth, async (req, res) => {
    try {
      const contactSubmissions = await storage.getContactSubmissions();
      const newsletterSubscriptions = await storage.getNewsletterSubscriptions();
      
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      
      const thisMonthSubmissions = contactSubmissions.filter(s => s.createdAt && new Date(s.createdAt) >= thisMonth);
      const lastMonthSubmissions = contactSubmissions.filter(s => 
        s.createdAt && new Date(s.createdAt) >= lastMonth && new Date(s.createdAt) < thisMonth
      );
      
      const growthRate = lastMonthSubmissions.length > 0 
        ? ((thisMonthSubmissions.length - lastMonthSubmissions.length) / lastMonthSubmissions.length * 100)
        : 0;
      
      res.json({
        contactForms: contactSubmissions.length,
        newsletter: newsletterSubscriptions.length,
        thisMonth: thisMonthSubmissions.length,
        growth: Math.round(growthRate)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Package routes
  app.get("/api/packages", async (req, res) => {
    try {
      const packages = await storage.getPackages();
      res.json(packages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch packages" });
    }
  });

  app.get("/api/packages/destination/:destinationId", async (req, res) => {
    try {
      const destinationId = req.params.destinationId;
      const packages = await storage.getPackagesByDestination(destinationId);
      res.json(packages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch packages" });
    }
  });

  // Admin package routes
  app.get("/api/admin/packages", requireAuth, async (req, res) => {
    try {
      const packages = await storage.getPackages();
      res.json(packages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch packages" });
    }
  });

  app.post("/api/admin/packages", requireAuth, async (req, res) => {
    try {
      const packageData = insertPackageSchema.parse(req.body);
      const created = await storage.createPackage(packageData);
      res.json(created);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid package data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create package" });
      }
    }
  });

  app.put("/api/admin/packages/:id", requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      const updates = insertPackageSchema.partial().parse(req.body);
      const updated = await storage.updatePackage(id, updates);
      
      if (updated) {
        res.json(updated);
      } else {
        res.status(404).json({ message: "Package not found" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid package data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update package" });
      }
    }
  });

  app.delete("/api/admin/packages/:id", requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      const deleted = await storage.deletePackage(id);
      
      if (deleted) {
        res.json({ success: true, message: "Package deleted successfully" });
      } else {
        res.status(404).json({ message: "Package not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete package" });
    }
  });

  // Gallery routes
  app.get("/api/gallery", async (req, res) => {
    try {
      const images = await storage.getApprovedGalleryImages();
      res.json(images);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gallery images" });
    }
  });

  app.post("/api/gallery", async (req, res) => {
    try {
      const imageData = insertGalleryImageSchema.parse(req.body);
      const created = await storage.createGalleryImage(imageData);
      res.json({ success: true, message: "Image uploaded successfully! It will be reviewed before appearing in the gallery.", image: created });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid image data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to upload image" });
      }
    }
  });

  // Admin gallery routes
  app.get("/api/admin/gallery", requireAuth, async (req, res) => {
    try {
      const images = await storage.getGalleryImages();
      res.json(images);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gallery images" });
    }
  });

  app.put("/api/admin/gallery/:id/approve", requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      const approved = await storage.approveGalleryImage(id);
      
      if (approved) {
        res.json({ success: true, message: "Image approved successfully", image: approved });
      } else {
        res.status(404).json({ message: "Image not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to approve image" });
    }
  });

  app.delete("/api/admin/gallery/:id", requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      const deleted = await storage.deleteGalleryImage(id);
      
      if (deleted) {
        res.json({ success: true, message: "Image deleted successfully" });
      } else {
        res.status(404).json({ message: "Image not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete image" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
