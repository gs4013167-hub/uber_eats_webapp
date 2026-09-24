/**
 * Stands in for what a real backend/database would return.
 * In production, restaurantService.js would call a real API instead of
 * importing this file directly — everything downstream stays the same.
 */
export const RESTAURANTS = [
  {
    id: "golden-dragon-kitchen",
    name: "Golden Dragon Kitchen",
    cuisines: ["Chinese", "Noodles", "Soup"],
    rating: 4.7,
    ratingCount: 2300,
    priceLevel: 2,
    etaMinutes: [20, 35],
    deliveryFeeCents: 49,
    heroImage: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80",
  },
  {
    id: "taco-libre",
    name: "Taco Libre",
    cuisines: ["Mexican", "Tacos", "Burritos"],
    rating: 4.5,
    ratingCount: 1800,
    priceLevel: 1,
    etaMinutes: [15, 25],
    deliveryFeeCents: 0,
    heroImage: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&q=80",
  },
  {
    id: "pasta-bella",
    name: "Pasta Bella",
    cuisines: ["Italian", "Pasta", "Pizza"],
    rating: 4.8,
    ratingCount: 3100,
    priceLevel: 3,
    etaMinutes: [25, 40],
    deliveryFeeCents: 99,
    heroImage: "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&q=80",
  },
  {
    id: "sakura-sushi",
    name: "Sakura Sushi",
    cuisines: ["Japanese", "Sushi", "Ramen"],
    rating: 4.6,
    ratingCount: 2650,
    priceLevel: 3,
    etaMinutes: [20, 30],
    deliveryFeeCents: 199,
    heroImage: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80",
  },
  {
    id: "green-bowl",
    name: "Green Bowl Co.",
    cuisines: ["Healthy", "Salads", "Bowls"],
    rating: 4.4,
    ratingCount: 940,
    priceLevel: 2,
    etaMinutes: [15, 25],
    deliveryFeeCents: 0,
    heroImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80",
  },
  {
    id: "burger-barn",
    name: "Burger Barn",
    cuisines: ["American", "Burgers", "Fries"],
    rating: 4.3,
    ratingCount: 4200,
    priceLevel: 1,
    etaMinutes: [15, 20],
    deliveryFeeCents: 49,
    heroImage: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
  },
];

export const CATEGORIES = [
  "All", "Chinese", "Mexican", "Italian", "Japanese", "Healthy", "American",
];
