# Indian Wedding Photography & Videography Booking Platform

A full-stack web application for booking Indian wedding photography and videography services, with integrated Stripe payment processing.

## Features

- Browse photographers and videographers specializing in Indian weddings
- View service categories: Photography, Videography, Drone Services, Wedding Reels
- Select and customize services or choose packages
- Book professionals for specific dates and events
- Real-time availability checking
- Secure payment processing through Stripe
- User account management
- Testimonials from previous clients
- Photographer portfolios

## Tech Stack

- **Frontend**: React with TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Node.js, Express
- **Database**: In-memory storage (can be adapted for PostgreSQL)
- **Authentication**: Google OAuth
- **Payment Processing**: Stripe API
- **Routing**: Wouter
- **State Management**: TanStack Query

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Stripe account for payment processing
- Google API credentials for authentication

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/indian-wedding-photography.git
cd indian-wedding-photography
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables in a `.env` file:
```
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
AUTH_SECRET=your_auth_secret
```

4. Start the development server:
```bash
npm run dev
```

## Project Structure

- `/client` - Frontend React application
  - `/src/components` - UI components
  - `/src/hooks` - Custom React hooks
  - `/src/lib` - Utility functions and libraries
  - `/src/pages` - Page components
- `/server` - Backend Express application
  - `/routes.ts` - API routes
  - `/storage.ts` - Data storage interface
  - `/auth.ts` - Authentication setup
- `/shared` - Shared code between client and server
  - `/schema.ts` - Database schema and types

## Deployment

The application can be deployed to any hosting service that supports Node.js applications.

## License

This project is licensed under the MIT License - see the LICENSE file for details.