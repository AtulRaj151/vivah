import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { authHandler } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import { insertBookingSchema, insertUserSchema } from "@shared/schema";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("Missing STRIPE_SECRET_KEY environment variable. Payment functionality will not work.");
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-03-31.basil",
    })
  : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.use("/api/auth/*", authHandler);
  // API routes with /api prefix

  // Photographers routes
  app.get("/api/photographers", async (req, res) => {
    try {
      const photographers = await storage.getAllPhotographers();
      res.json(photographers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin routes
app.get("/api/admin/stats", async (req, res) => {
  try {
    const bookings = await storage.getAllBookings();
    const photographers = await storage.getAllPhotographers();
    const users = await storage.getAllUsers();
    
    const stats = {
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((acc, booking) => acc + booking.totalAmount, 0),
      totalPhotographers: photographers.length,
      totalCustomers: users.filter(u => u.type === 'customer').length
    };
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/photographers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid photographer ID" });
      }

      const photographer = await storage.getPhotographer(id);
      if (!photographer) {
        return res.status(404).json({ message: "Photographer not found" });
      }

      const portfolio = await storage.getPortfolioByPhotographer(id);
      const testimonials = await storage.getTestimonialsByPhotographer(id);

      res.json({ photographer, portfolio, testimonials });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Service routes
  app.get("/api/service-categories", async (req, res) => {
    try {
      const categories = await storage.getAllServiceCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/services", async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;

      let services;
      if (categoryId && !isNaN(categoryId)) {
        services = await storage.getServicesByCategory(categoryId);
      } else {
        services = await storage.getAllServices();
      }

      res.json(services);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid service ID" });
      }

      const service = await storage.getService(id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      res.json(service);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Package routes
  app.get("/api/packages", async (req, res) => {
    try {
      const packages = await storage.getAllPackages();
      res.json(packages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/packages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid package ID" });
      }

      const pkg = await storage.getPackage(id);
      if (!pkg) {
        return res.status(404).json({ message: "Package not found" });
      }

      res.json(pkg);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Testimonial routes
  app.get("/api/testimonials", async (req, res) => {
    try {
      const testimonials = await storage.getAllTestimonials();
      res.json(testimonials);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Return users without exposing passwords
      const safeUsers = users.map(({password, ...user}) => user);
      res.json(safeUsers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/users/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }

      // Add type from request body or default to 'customer'
      const userType = req.body.type || 'customer';
      
      const user = await storage.createUser({
        ...validatedData,
        type: userType
      });
      
      res.status(201).json({ 
        id: user.id, 
        username: user.username, 
        email: user.email,
        fullName: user.fullName,
        type: user.type
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Login route - simplified for demo
  app.post("/api/users/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email,
        fullName: user.fullName,
        type: user.type
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Availability check
  app.get("/api/availability", async (req, res) => {
    try {
      const photographerId = parseInt(req.query.photographerId as string);
      const dateStr = req.query.date as string;

      if (isNaN(photographerId) || !dateStr) {
        return res.status(400).json({ message: "Photographer ID and date are required" });
      }

      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      const isAvailable = await storage.getPhotographerAvailability(photographerId, date);
      res.json({ available: isAvailable });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Booking routes
  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(validatedData);
      res.status(201).json(booking);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/bookings/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const bookings = await storage.getBookingsByUser(userId);
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }

      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.json(booking);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }

      const { amount, bookingId } = req.body;

      if (!amount || isNaN(parseFloat(amount)) || !bookingId) {
        return res.status(400).json({ message: "Amount and booking ID are required" });
      }

      const booking = await storage.getBooking(parseInt(bookingId));
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(amount) * 100), // Convert to cents
        currency: "inr", // Indian Rupee
        metadata: {
          bookingId: bookingId.toString(),
        },
      });

      // Update booking with payment intent ID
      await storage.updateBookingPaymentStatus(
        booking.id, 
        "pending", 
        paymentIntent.id
      );

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Webhook for Stripe events
  app.post("/api/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe is not configured" });
    }

    const sig = req.headers["stripe-signature"] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    // Verify webhook signature if secret is available
    if (endpointSecret) {
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err: any) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    } else {
      // For development without signature verification
      try {
        event = JSON.parse(req.body.toString());
      } catch (err) {
        return res.status(400).send(`Webhook Error: Invalid JSON`);
      }
    }

    // Handle different webhook events
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const bookingId = parseInt(paymentIntent.metadata.bookingId);

      if (!isNaN(bookingId)) {
        try {
          await storage.updateBookingPaymentStatus(bookingId, "paid", paymentIntent.id);
          await storage.updateBookingStatus(bookingId, "confirmed");
        } catch (error) {
          console.error("Error updating booking status:", error);
        }
      }
    }

    res.json({ received: true });
  });

  // Earnings routes
  app.get("/api/earnings", async (req, res) => {
    try {
      const photographerId = req.query.photographerId ? parseInt(req.query.photographerId as string) : undefined;
      const earnings = photographerId 
        ? await storage.getEarningsByPhotographer(photographerId)
        : await storage.getAllEarnings();
      const summary = await storage.getEarningsSummary(photographerId);
      
      // Calculate additional metrics
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      
      const monthlyEarnings = earnings.filter((e: any) => new Date(e.earnedAt) >= lastMonth);
      const prevMonthEarnings = earnings.filter((e: any) => {
        const date = new Date(e.earnedAt);
        return date >= new Date(lastMonth.getFullYear(), lastMonth.getMonth() - 1, 1) &&
               date < lastMonth;
      });
      
      const currentMonthTotal = monthlyEarnings.reduce((sum: number, e: any) => sum + e.amount, 0);
      const prevMonthTotal = prevMonthEarnings.reduce((sum: number, e: any) => sum + e.amount, 0);
      
      const monthlyGrowth = prevMonthTotal ? ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100 : 0;
      
      const enhancedSummary = {
        ...summary,
        monthlyGrowth: Math.round(monthlyGrowth * 100) / 100,
        currentMonthRevenue: currentMonthTotal,
        averageBookingValue: earnings.length ? 
          earnings.reduce((sum: number, e: any) => sum + e.amount, 0) / earnings.length : 0
      };

      res.json({ earnings, summary: enhancedSummary });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/earnings/analytics", async (req, res) => {
    try {
      const photographerId = req.query.photographerId ? parseInt(req.query.photographerId as string) : undefined;
      const timeframe = req.query.timeframe || 'month';
      
      // Since we don't have a real implementation of getEarningsAnalytics,
      // let's return some dummy data for now
      const earnings = photographerId 
        ? await storage.getEarningsByPhotographer(photographerId)
        : await storage.getAllEarnings();
      
      // Group earnings by month
      const today = new Date();
      const last6Months = new Array(6).fill(0).map((_, i) => {
        const date = new Date(today);
        date.setMonth(date.getMonth() - i);
        return {
          month: date.toLocaleString('default', { month: 'short' }),
          year: date.getFullYear()
        };
      });
      
      // Create analytics result
      const analytics = last6Months.map(month => {
        const monthlyEarnings = earnings.filter((e: any) => {
          const earnedDate = new Date(e.earnedAt);
          return earnedDate.getMonth() === new Date(month.month + ' 1, ' + month.year).getMonth() &&
                 earnedDate.getFullYear() === month.year;
        });
        
        const totalAmount = monthlyEarnings.reduce((sum: number, e: any) => sum + e.amount, 0);
        
        return {
          period: `${month.month} ${month.year}`,
          amount: totalAmount,
          bookings: monthlyEarnings.length
        };
      });
      
      res.json(analytics.reverse()); // Most recent month first
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}