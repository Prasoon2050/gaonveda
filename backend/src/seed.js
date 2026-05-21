import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import { Order } from "./models/Order.js";
import { Product } from "./models/Product.js";
import { User } from "./models/User.js";
import { PromoCode } from "./models/PromoCode.js";
import { products, users, cartItems, wishlistItems } from "./data/seedData.js";
import { hashPassword } from "./utils/auth.js";

async function seed() {
  await connectDB();

  console.log("Seeding products with embedded reviews...");
  const seededProducts = await Promise.all(
    products.map(async (product) => {
      // Temporary placeholder, we'll assign the real user ID below
      return Product.findOneAndUpdate(
        { slug: product.slug },
        product,
        { new: true, setDefaultsOnInsert: true, upsert: true, overwrite: true },
      );
    }),
  );

  console.log("Seeding users with embedded cart and wishlist...");
  const seededUsers = await Promise.all(
    users.map(async (user) => {
      const passwordFields = await hashPassword(process.env.SEED_USER_PASSWORD || "gaonveda123");
      
      const mappedCart = cartItems.map((item) => ({
        ...item,
        selectedSize: seededProducts.find((p) => p.slug === item.productSlug)?.pack,
      }));

      return User.findOneAndUpdate(
        { email: user.email }, 
        { ...user, ...passwordFields, cart: mappedCart, wishlist: wishlistItems }, 
        { new: true, setDefaultsOnInsert: true, upsert: true }
      );
    }),
  );
  const customer = seededUsers[0];

  // Now update the seeded products to attribute reviews to the seed user
  console.log("Attributing reviews to seeded user...");
  await Promise.all(
    seededProducts.map(async (product) => {
      const reviewsWithUser = (product.reviews || []).map((review) => ({
        ...review,
        user: customer._id,
      }));
      product.reviews = reviewsWithUser;
      return product.save();
    })
  );

  // Clean up old orders for the seed user
  await Order.deleteMany({ user: customer._id });

  console.log("Seeding default promo codes...");
  await PromoCode.deleteMany({});
  await PromoCode.create([
    { code: "GAONVEDA10", discountPercent: 10, isActive: true },
    { code: "GAONVEDA20", discountPercent: 20, isActive: true },
    { code: "WELCOME50", discountPercent: 50, isActive: true },
    { code: "EXPIRED50", discountPercent: 50, isActive: false },
  ]);
  console.log("GAONVEDA: Seeded default promo codes manually.");

  // Drop the old collections if they exist
  const collectionsToDrop = ["reviews", "carts", "wishlists"];
  for (const collName of collectionsToDrop) {
    try {
      await mongoose.connection.db.dropCollection(collName);
      console.log(`Dropped legacy '${collName}' collection.`);
    } catch {
      // Collection may not exist — that's fine
    }
  }

  console.log("GAONVEDA seed data is ready.");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
