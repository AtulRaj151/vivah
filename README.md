
# Royal Videography - Dehri on Sone

A full-stack web application for booking photography and videography services, based in Dehri on Sone, Bihar.

## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety and better developer experience
- **Vite** - Next generation frontend tooling
- **TanStack Query** - Server state management
- **Radix UI** - Headless UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Wouter** - Lightweight routing

### Backend
- **Express** - Node.js web framework
- **TypeScript** - Type safety for backend
- **Drizzle ORM** - TypeScript ORM
- **PostgreSQL** - Database
- **Stripe** - Payment processing

## Features & API Endpoints

### Authentication
- Google OAuth Integration
- `/api/auth/*` - Authentication endpoints
- `/api/users/login` - User login (POST)
- `/api/users/register` - User registration (POST)

### Photographers
- `/api/photographers` - List all photographers (GET)
- `/api/photographers/:id` - Get photographer details with portfolio (GET)
- Portfolio management
- Availability tracking

### Services
- `/api/service-categories` - List all service categories (GET)
- `/api/services` - List all services or filter by category (GET)
- `/api/services/:id` - Get service details (GET)
- Categories: Photography, Videography, Drone Services, Wedding Reels

### Packages
- `/api/packages` - List all packages (GET)
- `/api/packages/:id` - Get package details (GET)
- Custom package creation
- Feature comparison

### Bookings
- `/api/bookings` - Create new booking (POST)
- `/api/bookings/user/:userId` - Get user bookings (GET)
- `/api/bookings/:id` - Get booking details (GET)
- Availability check
- Schedule management

### Payments
- `/api/create-payment-intent` - Initialize payment (POST)
- `/api/webhook` - Stripe webhook handler (POST)
- Secure payment processing
- Payment status tracking

### Reviews & Testimonials
- `/api/testimonials` - List all testimonials (GET)
- Rating system
- Customer feedback

### Analytics & Earnings
- `/api/earnings` - Get earnings data (GET)
- `/api/earnings/analytics` - Get earnings analytics (GET)
- Performance metrics
- Revenue tracking
- Growth analysis

### Location Services
- Bihar-focused service coverage
- District-wise availability
- Location-based pricing
- Integrated Google Maps

## Development Tools
- **ESBuild** - Fast JavaScript/TypeScript bundler
- **tsx** - TypeScript execution environment
- **Drizzle Kit** - Database schema management

## Contact

- **Founder**: Ajay Sharma
- **Location**: Dehri-on-Sone, Bihar - 821305
- **Phone**: +91 8340608143, +91 7004711393
- **Email**: atulsid156@gmail.com

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The application will be available at port 5000.

## Environment Variables

- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `AUTH_SECRET` - Authentication secret key
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
