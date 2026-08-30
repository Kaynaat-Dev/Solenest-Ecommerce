/* ==========================================================================
   SEED SCRIPT — backend/seedProducts.js
   A one-time-use script that connects to MongoDB and inserts your 12
   original products (from the old hardcoded frontend array) as real
   documents in the "products" collection.

   This is NOT part of the running server — you run this file directly,
   once, whenever you want to (re)populate the database with sample data.
   ========================================================================== */

require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

// The 12 products, adapted from your old Script.js hardcoded array to
// match the MongoDB Product schema:
//   - "reviews"  -> "numReviews"
//   - "id"       -> removed (MongoDB generates its own _id automatically)
//   - "badge"    -> removed (frontend now derives this from "stock" instead)
//   - "stock"    -> added (wasn't in the old frontend data, so we assign
//                   a reasonable starting stock count for each product)
const sampleProducts = [
  {
    name: "Urban Runner Sneaker",
    category: "sneakers",
    price: 89.99,
    rating: 4.5,
    numReviews: 128,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    description: "A versatile everyday sneaker built with a breathable knit upper and a cushioned sole for all-day comfort on the streets.",
    sizes: [38, 39, 40, 41, 42, 43],
    stock: 30
  },
  {
    name: "AeroFlex Running Shoe",
    category: "running",
    price: 109.99,
    rating: 5,
    numReviews: 96,
    image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&q=80",
    description: "Engineered for speed. Lightweight foam midsole and responsive cushioning designed for long-distance runners.",
    sizes: [39, 40, 41, 42, 43, 44],
    stock: 25
  },
  {
    name: "Everyday Canvas Casual",
    category: "casual",
    price: 64.99,
    rating: 4,
    numReviews: 74,
    image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80",
    description: "A classic canvas silhouette that pairs with everything — relaxed, comfortable, and built for daily wear.",
    sizes: [37, 38, 39, 40, 41, 42],
    stock: 40
  },
  {
    name: "ProCourt Sports Trainer",
    category: "sports",
    price: 124.99,
    rating: 4.5,
    numReviews: 152,
    image: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=600&q=80",
    description: "High-performance trainer with lateral support and shock-absorbing outsole, built for intense court sessions.",
    sizes: [40, 41, 42, 43, 44, 45],
    stock: 20
  },
  {
    name: "Blush Comfort Flats",
    category: "women",
    price: 74.99,
    rating: 4.5,
    numReviews: 61,
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&q=80",
    description: "Soft, flexible, and elegant. Designed to keep you comfortable from morning meetings to evening walks.",
    sizes: [36, 37, 38, 39, 40],
    stock: 35
  },
  {
    name: "Heritage Leather Oxford",
    category: "men",
    price: 139.99,
    rating: 5,
    numReviews: 88,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80",
    description: "Premium leather craftsmanship meets modern comfort — a timeless formal shoe for the modern man.",
    sizes: [40, 41, 42, 43, 44, 45],
    stock: 18
  },
  {
    name: "Skyline High-Top Sneaker",
    category: "sneakers",
    price: 94.99,
    rating: 4,
    numReviews: 45,
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80",
    description: "Bold high-top silhouette with reinforced ankle support and a chunky sole for standout street style.",
    sizes: [38, 39, 40, 41, 42, 43],
    stock: 22
  },
  {
    name: "TrailBlaze Running Shoe",
    category: "running",
    price: 114.99,
    rating: 4.5,
    numReviews: 103,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
    description: "Rugged grip and durable build made for off-road trails, wet terrain, and unpredictable weather.",
    sizes: [39, 40, 41, 42, 43, 44],
    stock: 28
  },
  {
    name: "Cloudstep Slip-On Casual",
    category: "casual",
    price: 59.99,
    rating: 4,
    numReviews: 39,
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80",
    description: "Effortless slip-on comfort with a memory-foam insole — perfect for quick errands and lazy weekends.",
    sizes: [37, 38, 39, 40, 41, 42],
    stock: 33
  },
  {
    name: "PowerFlex Training Shoe",
    category: "sports",
    price: 99.99,
    rating: 4.5,
    numReviews: 71,
    image: "https://images.unsplash.com/photo-1483721310020-03333e577078?w=600&q=80",
    description: "Stable base and flexible forefoot designed for weightlifting, HIIT, and cross-training sessions.",
    sizes: [40, 41, 42, 43, 44],
    stock: 26
  },
  {
    name: "Rose Trail Sneaker",
    category: "women",
    price: 84.99,
    rating: 5,
    numReviews: 58,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80",
    description: "A soft, cushioned sneaker with a feminine colorway, designed for walking, travel, and everyday errands.",
    sizes: [36, 37, 38, 39, 40, 41],
    stock: 31
  },
  {
    name: "Titan Street Boot",
    category: "men",
    price: 129.99,
    rating: 4,
    numReviews: 34,
    image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80",
    description: "Rugged street boot with a reinforced toe and durable sole, built to handle city and rough terrain alike.",
    sizes: [40, 41, 42, 43, 44, 45],
    stock: 15
  }
];

// Connect, wipe any existing products (so re-running this script doesn't
// create duplicates), insert the fresh 12, then disconnect and exit.
async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected — starting seed...");

    const deleted = await Product.deleteMany({});
    console.log(`Removed ${deleted.deletedCount} existing product(s).`);

    const inserted = await Product.insertMany(sampleProducts);
    console.log(`Inserted ${inserted.length} new products successfully.`);

    process.exit(0); // success — close the script
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1); // failure — close the script with an error code
  }
}

seedDatabase();