import {
  users, packages, photographers, services, serviceCategories,
  portfolioItems, testimonials, bookings,
  type User, type InsertUser,
  type Package, type InsertPackage,
  type Photographer, type InsertPhotographer,
  type Service, type InsertService,
  type ServiceCategory, type InsertServiceCategory,
  type PortfolioItem, type InsertPortfolioItem,
  type Testimonial, type InsertTestimonial,
  type Booking, type InsertBooking
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Photographer methods
  getAllPhotographers(): Promise<Photographer[]>;
  getPhotographer(id: number): Promise<Photographer | undefined>;
  createPhotographer(photographer: InsertPhotographer): Promise<Photographer>;

  // Service Category methods
  getAllServiceCategories(): Promise<ServiceCategory[]>;
  getServiceCategory(id: number): Promise<ServiceCategory | undefined>;
  createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory>;

  // Service methods
  getAllServices(): Promise<Service[]>;
  getServicesByCategory(categoryId: number): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;

  // Package methods
  getAllPackages(): Promise<Package[]>;
  getPackage(id: number): Promise<Package | undefined>;
  createPackage(pkg: InsertPackage): Promise<Package>;

  // Portfolio methods
  getPortfolioByPhotographer(photographerId: number): Promise<PortfolioItem[]>;
  createPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem>;

  // Testimonial methods
  getAllTestimonials(): Promise<Testimonial[]>;
  getTestimonialsByPhotographer(photographerId: number): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;

  // Booking methods
  getBookingsByUser(userId: number): Promise<Booking[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingPaymentStatus(id: number, status: string, paymentIntentId?: string): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking>;
  getPhotographerAvailability(photographerId: number, date: Date): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private photographers: Map<number, Photographer>;
  private serviceCategories: Map<number, ServiceCategory>;
  private services: Map<number, Service>;
  private packages: Map<number, Package>;
  private portfolioItems: Map<number, PortfolioItem>;
  private testimonials: Map<number, Testimonial>;
  private bookings: Map<number, Booking>;
  private currentId: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.photographers = new Map();
    this.serviceCategories = new Map();
    this.services = new Map();
    this.packages = new Map();
    this.portfolioItems = new Map();
    this.testimonials = new Map();
    this.bookings = new Map();
    this.currentId = {
      users: 1,
      photographers: 1,
      serviceCategories: 1,
      services: 1,
      packages: 1,
      portfolioItems: 1,
      testimonials: 1,
      bookings: 1
    };

    // Initialize with sample data
    this.initializeSampleData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  // Photographer methods
  async getAllPhotographers(): Promise<Photographer[]> {
    return Array.from(this.photographers.values());
  }

  async getPhotographer(id: number): Promise<Photographer | undefined> {
    return this.photographers.get(id);
  }

  async createPhotographer(insertPhotographer: InsertPhotographer): Promise<Photographer> {
    const id = this.currentId.photographers++;
    const photographer: Photographer = { ...insertPhotographer, id };
    this.photographers.set(id, photographer);
    return photographer;
  }

  // Service Category methods
  async getAllServiceCategories(): Promise<ServiceCategory[]> {
    return Array.from(this.serviceCategories.values());
  }

  async getServiceCategory(id: number): Promise<ServiceCategory | undefined> {
    return this.serviceCategories.get(id);
  }

  async createServiceCategory(insertCategory: InsertServiceCategory): Promise<ServiceCategory> {
    const id = this.currentId.serviceCategories++;
    const category: ServiceCategory = { ...insertCategory, id };
    this.serviceCategories.set(id, category);
    return category;
  }

  // Service methods
  async getAllServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async getServicesByCategory(categoryId: number): Promise<Service[]> {
    return Array.from(this.services.values()).filter(
      (service) => service.categoryId === categoryId
    );
  }

  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = this.currentId.services++;
    const service: Service = { ...insertService, id };
    this.services.set(id, service);
    return service;
  }

  // Package methods
  async getAllPackages(): Promise<Package[]> {
    return Array.from(this.packages.values());
  }

  async getPackage(id: number): Promise<Package | undefined> {
    return this.packages.get(id);
  }

  async createPackage(insertPackage: InsertPackage): Promise<Package> {
    const id = this.currentId.packages++;
    const pkg: Package = { ...insertPackage, id };
    this.packages.set(id, pkg);
    return pkg;
  }

  // Portfolio methods
  async getPortfolioByPhotographer(photographerId: number): Promise<PortfolioItem[]> {
    return Array.from(this.portfolioItems.values()).filter(
      (item) => item.photographerId === photographerId
    );
  }

  async createPortfolioItem(insertItem: InsertPortfolioItem): Promise<PortfolioItem> {
    const id = this.currentId.portfolioItems++;
    const item: PortfolioItem = { ...insertItem, id };
    this.portfolioItems.set(id, item);
    return item;
  }

  // Testimonial methods
  async getAllTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values());
  }

  async getTestimonialsByPhotographer(photographerId: number): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values()).filter(
      (testimonial) => testimonial.photographerId === photographerId
    );
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const id = this.currentId.testimonials++;
    const testimonial: Testimonial = { ...insertTestimonial, id };
    this.testimonials.set(id, testimonial);
    return testimonial;
  }

  // Booking methods
  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.userId === userId
    );
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentId.bookings++;
    const now = new Date();
    const booking: Booking = { ...insertBooking, id, createdAt: now, paymentIntentId: null };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBookingPaymentStatus(id: number, status: string, paymentIntentId?: string): Promise<Booking> {
    const booking = this.bookings.get(id);
    if (!booking) {
      throw new Error(`Booking with id ${id} not found`);
    }

    const updatedBooking: Booking = {
      ...booking,
      paymentStatus: status,
      paymentIntentId: paymentIntentId || booking.paymentIntentId
    };

    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    const booking = this.bookings.get(id);
    if (!booking) {
      throw new Error(`Booking with id ${id} not found`);
    }

    const updatedBooking: Booking = { ...booking, status };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async getPhotographerAvailability(photographerId: number, date: Date): Promise<boolean> {
    // Check if there are any bookings for this photographer on the given date
    const bookingsOnDate = Array.from(this.bookings.values()).filter(
      (booking) => {
        const bookingDate = new Date(booking.eventDate);
        return booking.photographerId === photographerId && 
               bookingDate.getFullYear() === date.getFullYear() &&
               bookingDate.getMonth() === date.getMonth() &&
               bookingDate.getDate() === date.getDate();
      }
    );

    // If there are no bookings, the photographer is available
    return bookingsOnDate.length === 0;
  }

  // Initialize with sample data
  // Earnings methods
async getAllEarnings(): Promise<Earnings[]> {
  return Array.from(this.earnings.values());
}

async getEarningsByPhotographer(photographerId: number): Promise<Earnings[]> {
  return Array.from(this.earnings.values()).filter(
    (earning) => earning.photographerId === photographerId
  );
}

async getEarningsSummary(photographerId?: number): Promise<{
  totalEarnings: number;
  platformEarnings: number;
  photographerEarnings: number;
  pendingPayouts: number;
}> {
  const relevantEarnings = photographerId 
    ? await this.getEarningsByPhotographer(photographerId)
    : await this.getAllEarnings();

  return relevantEarnings.reduce((acc, earning) => ({
    totalEarnings: acc.totalEarnings + earning.amount,
    platformEarnings: acc.platformEarnings + earning.platformEarnings,
    photographerEarnings: acc.photographerEarnings + earning.photographerEarnings,
    pendingPayouts: acc.pendingPayouts + (earning.status === 'pending' ? earning.photographerEarnings : 0)
  }), {
    totalEarnings: 0,
    platformEarnings: 0,
    photographerEarnings: 0,
    pendingPayouts: 0
  });
}

async createEarnings(insertEarnings: InsertEarnings): Promise<Earnings> {
  const id = this.currentId.earnings++;
  const earnings: Earnings = {
    ...insertEarnings,
    id,
    earnedAt: new Date(),
    paidAt: null
  };
  this.earnings.set(id, earnings);
  return earnings;
}

  private initializeSampleData() {
    // Add sample photographers
    const photographers: InsertPhotographer[] = [
      {
        name: "Raj Mehta",
        bio: "Award-winning photographer with 10+ years of experience capturing the magic of Indian weddings.",
        profileImage: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80",
        specialties: ["Traditional Ceremonies", "Candid Moments", "Drone Photography"],
        experience: 10,
        location: "Dehri on Sone, Rohtas, Bihar"
      },
      {
        name: "Priya Singh",
        bio: "Specialized in contemporary wedding photography with a traditional touch.",
        profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80",
        specialties: ["Pre-wedding Shoots", "Fashion Photography", "Reception Highlights"],
        experience: 8,
        location: "Delhi"
      },
      {
        name: "Arjun Kapoor",
        bio: "Videographer with a cinematic approach to wedding stories, creating timeless memories.",
        profileImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80",
        specialties: ["Cinematic Videos", "Wedding Films", "Drone Videography"],
        experience: 7,
        location: "Bangalore"
      }
    ];

    photographers.forEach(photographer => {
      this.createPhotographer(photographer);
    });

    // Add service categories
    const serviceCategories: InsertServiceCategory[] = [
      {
        name: "Photography",
        description: "Capture timeless moments from your wedding day with our expert photographers.",
        imageUrl: "https://images.unsplash.com/photo-1623595119708-26b1f7500ddd?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "Videography",
        description: "Professional wedding videos that tell your unique love story.",
        imageUrl: "https://images.unsplash.com/photo-1569240651547-3e7aeae85132?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "Drone Services",
        description: "Stunning aerial photography and videography for a different perspective.",
        imageUrl: "https://images.unsplash.com/photo-1604604994333-f1b0e9471186?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "Wedding Reels",
        description: "Short-form highlight videos perfect for sharing on social media.",
        imageUrl: "https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      }
    ];

    serviceCategories.forEach(category => {
      this.createServiceCategory(category);
    });

    // Add services
    const services: InsertService[] = [
      {
        name: "Pre-wedding Photoshoot",
        description: "A beautiful photoshoot session before your wedding day.",
        categoryId: 1,
        price: 499.99,
        duration: 4,
        imageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "Full Day Photography",
        description: "Complete coverage of your wedding day from morning preparations to evening reception.",
        categoryId: 1,
        price: 1299.99,
        duration: 12,
        imageUrl: "https://images.unsplash.com/photo-1568849859087-586287ba4512?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "Ceremony Videography",
        description: "Professional video coverage of your wedding ceremony.",
        categoryId: 2,
        price: 899.99,
        duration: 6,
        imageUrl: "https://images.unsplash.com/photo-1621535157164-216ebbe069fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "Cinematic Wedding Film",
        description: "A cinematic approach to your wedding story, creating a movie-like film.",
        categoryId: 2,
        price: 1499.99,
        duration: 12,
        imageUrl: "https://images.unsplash.com/photo-1585025756725-07166463f8a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "Aerial Venue Coverage",
        description: "Stunning aerial shots of your wedding venue.",
        categoryId: 3,
        price: 499.99,
        duration: 2,
        imageUrl: "https://images.unsplash.com/photo-1604604994333-f1b0e9471186?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "Full Drone Coverage",
        description: "Comprehensive drone coverage throughout your wedding day.",
        categoryId: 3,
        price: 899.99,
        duration: 8,
        imageUrl: "https://images.unsplash.com/photo-1527150122806-f682d2fd8b09?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "Instagram Reels",
        description: "Short, engaging reels perfect for social media sharing.",
        categoryId: 4,
        price: 399.99,
        duration: 3,
        imageUrl: "https://images.unsplash.com/photo-1590510757557-e36613bd35f0?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "Highlight Reel",
        description: "A condensed highlight video of your wedding day's best moments.",
        categoryId: 4,
        price: 599.99,
        duration: 4,
        imageUrl: "https://images.unsplash.com/photo-1586152985947-9b5647c7c0e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
      }
    ];

    services.forEach(service => {
      this.createService(service);
    });

    // Add packages
    const packages: InsertPackage[] = [
      {
        name: "Essential Package",
        description: "Perfect for intimate weddings with essential photography and videography coverage.",
        price: 1999.99,
        services: [1, 3, 7],
        imageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        features: ["Pre-wedding Photoshoot", "Ceremony Videography", "Instagram Reels", "2 Photographers", "1 Videographer"],
        popular: false
      },
      {
        name: "Premium Package",
        description: "Our most popular package with comprehensive coverage for your special day.",
        price: 3499.99,
        services: [1, 2, 4, 7],
        imageUrl: "https://images.unsplash.com/photo-1623595119708-26b1f7500ddd?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        features: ["Pre-wedding Photoshoot", "Full Day Photography", "Cinematic Wedding Film", "Instagram Reels", "3 Photographers", "2 Videographers", "Online Gallery"],
        popular: true
      },
      {
        name: "Luxury Package",
        description: "The ultimate wedding coverage package with premium services for your grand celebration.",
        price: 4999.99,
        services: [1, 2, 4, 5, 7, 8],
        imageUrl: "https://images.unsplash.com/photo-1586152985947-9b5647c7c0e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        features: ["Pre-wedding Photoshoot", "Full Day Photography", "Cinematic Wedding Film", "Aerial Venue Coverage", "Instagram Reels", "Highlight Reel", "4 Photographers", "2 Videographers", "1 Drone Operator", "Same-Day Edit", "Premium Album"],
        popular: false
      }
    ];

    packages.forEach(pkg => {
      this.createPackage(pkg);
    });

    // Add portfolio items
    const portfolioItems: InsertPortfolioItem[] = [
      {
        photographerId: 1,
        imageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        title: "Venue Decoration",
        category: "Traditional",
        description: "Stunning wedding venue decoration at Taj Hotel"
      },
      {
        photographerId: 1,
        imageUrl: "https://images.unsplash.com/photo-1623595119708-26b1f7500ddd?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        title: "Traditional Ceremony",
        category: "Ceremony",
        description: "Beautiful traditional Indian wedding ceremony"
      },
      {
        photographerId: 2,
        imageUrl: "https://images.unsplash.com/photo-1604604994333-f1b0e9471186?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        title: "Drone Photography",
        category: "Aerial",
        description: "Stunning aerial view of wedding venue"
      },
      {
        photographerId: 3,
        imageUrl: "https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
        title: "Reception Highlights",
        category: "Reception",
        description: "Joyful moments from the reception celebration"
      }
    ];

    portfolioItems.forEach(item => {
      this.createPortfolioItem(item);
    });

    // Add testimonials
    const testimonials: InsertTestimonial[] = [
      {
        clientName: "Nisha & Vikram Patel",
        clientImage: "https://images.unsplash.com/photo-1565884280295-98eb83e41c65?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        rating: 5,
        comment: "Raj captured our wedding beautifully. The photos are stunning and really captured the essence of our special day.",
        eventType: "Traditional Wedding",
        photographerId: 1
      },
      {
        clientName: "Ananya & Rohit Sharma",
        clientImage: "https://images.unsplash.com/photo-1548142813-c348350df52b?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        rating: 5,
        comment: "Priya has an amazing eye for detail. Our pre-wedding shoot was magical, and she made us feel so comfortable.",
        eventType: "Pre-wedding Shoot",
        photographerId: 2
      },
      {
        clientName: "Karan & Meera Kapoor",
        clientImage: "https://images.unsplash.com/photo-1537944434965-cf4679d1a598?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        rating: 5,
        comment: "The cinematic wedding film that Arjun created for us brought tears to our eyes. It was beyond our expectations.",
        eventType: "Wedding & Reception",
        photographerId: 3
      }
    ];

    testimonials.forEach(testimonial => {
      this.createTestimonial(testimonial);
    });
  }
}

export const storage = new MemStorage();