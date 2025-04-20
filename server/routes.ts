import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertBookingSchema, insertUserSchema } from "@shared/schema";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("Missing STRIPE_SECRET_KEY environment variable. Payment functionality will not work.");
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    })
  : null;

export async function registerRoutes(app: Express): Promise<Server> {
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

      const user = await storage.createUser(validatedData);
      res.status(201).json({ 
        id: user.id, 
        username: user.username, 
        email: user.email,
        fullName: user.fullName
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
        fullName: user.fullName
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

  const httpServer = createServer(app);

  return httpServer;
}
