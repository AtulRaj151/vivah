// Event types for wedding
export const EVENT_TYPES = [
  { value: "pre-wedding", label: "Pre-Wedding Shoot" },
  { value: "mehendi", label: "Mehendi Ceremony" },
  { value: "haldi", label: "Haldi Ceremony" },
  { value: "sangeet", label: "Sangeet Ceremony" },
  { value: "wedding", label: "Wedding Ceremony" },
  { value: "reception", label: "Reception" },
  { value: "post-wedding", label: "Post-Wedding Shoot" }
];

// Wedding locations
export const POPULAR_LOCATIONS = [
  { value: "mumbai", label: "Mumbai" },
  { value: "delhi", label: "Delhi" },
  { value: "bangalore", label: "Bangalore" },
  { value: "hyderabad", label: "Hyderabad" },
  { value: "chennai", label: "Chennai" },
  { value: "kolkata", label: "Kolkata" },
  { value: "jaipur", label: "Jaipur" },
  { value: "udaipur", label: "Udaipur" },
  { value: "goa", label: "Goa" }
];

export const LOCATIONS = [
  "Rohtas",
  "Patna",
  "Bhojpur",
  "Buxar",
  "Kaimur",
  "Gaya",
  "Aurangabad",
  "Nalanda",
  "Nawada",
  "Arwal",
  "Jehanabad",
  "Vaishali",
  "Saran",
  "Siwan",
  "Gopalganj",
  "East Champaran",
  "West Champaran",
  "Muzaffarpur",
  "Sitamarhi",
  "Sheohar",
  "Madhubani",
  "Darbhanga",
  "Samastipur",
  "Begusarai",
  "Khagaria",
  "Bhagalpur",
  "Banka",
  "Munger",
  "Lakhisarai",
  "Sheikhpura",
  "Jamui",
  "Saharsa",
  "Supaul",
  "Madhepura",
  "Purnia",
  "Kishanganj",
  "Araria",
  "Katihar",
];

// Time slots
export const TIME_SLOTS = [
  { value: "morning", label: "Morning (8:00 AM - 12:00 PM)" },
  { value: "afternoon", label: "Afternoon (12:00 PM - 4:00 PM)" },
  { value: "evening", label: "Evening (4:00 PM - 8:00 PM)" },
  { value: "night", label: "Night (8:00 PM - 12:00 AM)" },
  { value: "fullday", label: "Full Day" }
];

// Status options for bookings
export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled"
};

// Payment status options
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  PAID: "paid",
  REFUNDED: "refunded",
  FAILED: "failed"
};

// Format currency for display
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

// Format date for display
export const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};