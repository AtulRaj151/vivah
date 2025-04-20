import { pgTable, text, serial, integer, real, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const photographers = pgTable("photographers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  bio: text("bio").notNull(),
  profileImage: text("profile_image").notNull(),
  specialties: text("specialties").array().notNull(),
  experience: integer("experience").notNull(),
  location: text("location").notNull(),
});

export const insertPhotographerSchema = createInsertSchema(photographers).omit({
  id: true,
});

export const serviceCategories = pgTable("service_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
});

export const insertServiceCategorySchema = createInsertSchema(serviceCategories).omit({
  id: true,
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  categoryId: integer("category_id").notNull(),
  price: real("price").notNull(),
  duration: integer("duration").notNull(), // in hours
  imageUrl: text("image_url").notNull(),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
});

export const packages = pgTable("packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  services: integer("services").array().notNull(),
  imageUrl: text("image_url").notNull(),
  features: text("features").array().notNull(),
  popular: boolean("popular").default(false),
});

export const insertPackageSchema = createInsertSchema(packages).omit({
  id: true,
});

export const portfolioItems = pgTable("portfolio_items", {
  id: serial("id").primaryKey(),
  photographerId: integer("photographer_id").notNull(),
  imageUrl: text("image_url").notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  description: text("description"),
});

export const insertPortfolioItemSchema = createInsertSchema(portfolioItems).omit({
  id: true,
});

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  clientImage: text("client_image"),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  eventType: text("event_type").notNull(),
  photographerId: integer("photographer_id").notNull(),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  photographerId: integer("photographer_id").notNull(),
  eventDate: timestamp("event_date").notNull(),
  eventType: text("event_type").notNull(),
  location: text("location").notNull(),
  packageId: integer("package_id"),
  services: jsonb("services").notNull(),
  totalAmount: real("total_amount").notNull(),
  status: text("status").notNull().default("pending"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  paymentIntentId: text("payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  paymentIntentId: true,
});

// Type inference
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Photographer = typeof photographers.$inferSelect;
export type InsertPhotographer = z.infer<typeof insertPhotographerSchema>;

export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type InsertServiceCategory = z.infer<typeof insertServiceCategorySchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Package = typeof packages.$inferSelect;
export type InsertPackage = z.infer<typeof insertPackageSchema>;

export type PortfolioItem = typeof portfolioItems.$inferSelect;
export type InsertPortfolioItem = z.infer<typeof insertPortfolioItemSchema>;

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;

// Earnings tracking
export const earnings = pgTable("earnings", {
  id: serial("id").primaryKey(),
  photographerId: integer("photographer_id").notNull(),
  bookingId: integer("booking_id").notNull(),
  amount: real("amount").notNull(),
  commissionRate: real("commission_rate").notNull().default(0.15), // 15% platform fee
  platformEarnings: real("platform_earnings").notNull(),
  photographerEarnings: real("photographer_earnings").notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
  status: text("status").notNull().default("pending"), // pending, paid, cancelled
  paidAt: timestamp("paid_at"),
});

export const insertEarningsSchema = createInsertSchema(earnings).omit({
  id: true,
  earnedAt: true,
  paidAt: true,
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Earnings = typeof earnings.$inferSelect;
export type InsertEarnings = z.infer<typeof insertEarningsSchema>;
