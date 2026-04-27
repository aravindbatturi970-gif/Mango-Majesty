import {
  db,
  categoriesTable,
  productsTable,
  reviewsTable,
  subscriptionPlansTable,
  pool,
} from "@workspace/db";

async function seed() {
  console.log("Clearing existing seed data...");
  await db.delete(reviewsTable);
  await db.delete(productsTable);
  await db.delete(categoriesTable);
  await db.delete(subscriptionPlansTable);

  console.log("Seeding categories...");
  await db.insert(categoriesTable).values([
    {
      slug: "alphonso",
      name: "Alphonso",
      description: "The king of mangoes from Ratnagiri's coastal orchards.",
      emoji: "alphonso",
    },
    {
      slug: "banganapalli",
      name: "Banganapalli",
      description: "Honey-sweet golden giants from Andhra Pradesh.",
      emoji: "banganapalli",
    },
    {
      slug: "kesar",
      name: "Kesar",
      description: "The saffron-scented pride of Gujarat's Gir hills.",
      emoji: "kesar",
    },
    {
      slug: "organic",
      name: "Organic",
      description: "Hand-picked, pesticide-free, certified organic boxes.",
      emoji: "organic",
    },
  ]);

  console.log("Seeding products...");
  const productSeeds = [
    {
      slug: "alphonso-ratnagiri-classic",
      name: "Ratnagiri Alphonso",
      variety: "Alphonso",
      tagline: "The original king. Buttery, fragrant, unforgettable.",
      description:
        "Hand-picked from coastal orchards in Ratnagiri, these GI-tagged Alphonsos have a saffron-orange flesh, paper-thin skin, and an aroma that fills a room. Naturally ripened with hay — never carbide.",
      price: "899.00",
      unit: "per box (2.5kg, 12-15 mangoes)",
      imageUrl: "https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=900&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=900&q=80",
        "https://images.unsplash.com/photo-1553279768-865429fa0078?w=900&q=80",
        "https://images.unsplash.com/photo-1605027990121-cbae9e0642b1?w=900&q=80",
      ],
      origin: "Ratnagiri, Maharashtra",
      sweetness: 10,
      rating: "4.9",
      reviewCount: 1284,
      stock: 18,
      deliveryEtaHours: 24,
      badge: "Best Seller",
      categorySlug: "alphonso",
      isBestSeller: true,
      isOrganic: false,
      popularity: 100,
    },
    {
      slug: "alphonso-devgad-premium",
      name: "Devgad Alphonso Reserve",
      variety: "Alphonso",
      tagline: "Single-estate. Limited harvest. Pure decadence.",
      description:
        "From the cliffside orchards of Devgad, these mangoes have an intensely floral aroma and a thick, custardy pulp. Harvested at peak ripeness, layered in straw, never refrigerated.",
      price: "1199.00",
      unit: "per box (3kg, 15-18 mangoes)",
      imageUrl: "https://images.unsplash.com/photo-1605027990121-cbae9e0642b1?w=900&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1605027990121-cbae9e0642b1?w=900&q=80",
        "https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=900&q=80",
      ],
      origin: "Devgad, Maharashtra",
      sweetness: 10,
      rating: "4.95",
      reviewCount: 642,
      stock: 9,
      deliveryEtaHours: 24,
      badge: "Limited Reserve",
      categorySlug: "alphonso",
      isBestSeller: true,
      isOrganic: false,
      popularity: 95,
    },
    {
      slug: "banganapalli-andhra-classic",
      name: "Andhra Banganapalli",
      variety: "Banganapalli",
      tagline: "Sunshine in a bite. Honey-sweet, fiberless, fearless.",
      description:
        "These golden giants come from the orchards near Kurnool. Smooth, fiberless flesh with a clean honey finish. The crowd-pleaser the whole family will fight over.",
      price: "649.00",
      unit: "per box (3kg, 6-8 mangoes)",
      imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=900&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1553279768-865429fa0078?w=900&q=80",
        "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=900&q=80",
      ],
      origin: "Kurnool, Andhra Pradesh",
      sweetness: 9,
      rating: "4.8",
      reviewCount: 921,
      stock: 32,
      deliveryEtaHours: 24,
      badge: "Crowd Favorite",
      categorySlug: "banganapalli",
      isBestSeller: true,
      isOrganic: false,
      popularity: 90,
    },
    {
      slug: "kesar-gir-saffron",
      name: "Gir Kesar",
      variety: "Kesar",
      tagline: "The saffron mango. Fragrant, complex, deeply nostalgic.",
      description:
        "Grown in the volcanic soil of Gir, Junagadh. Saffron-tinted pulp with a hint of citrus and rose. Holds beautifully in shrikhand, kulfi, or sliced cold straight from the fridge.",
      price: "749.00",
      unit: "per box (3kg, 10-12 mangoes)",
      imageUrl: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=900&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=900&q=80",
        "https://images.unsplash.com/photo-1553279768-865429fa0078?w=900&q=80",
      ],
      origin: "Junagadh, Gujarat",
      sweetness: 9,
      rating: "4.85",
      reviewCount: 768,
      stock: 24,
      deliveryEtaHours: 24,
      badge: "Sweetest",
      categorySlug: "kesar",
      isBestSeller: true,
      isOrganic: false,
      popularity: 88,
    },
    {
      slug: "organic-medley-box",
      name: "Organic Mango Medley",
      variety: "Mixed Varieties",
      tagline: "Three heritage varieties. Zero chemicals. One epic box.",
      description:
        "A curated trio of organic Alphonso, Kesar, and Banganapalli — grown without pesticides, hand-pollinated, and certified by Jaivik Bharat. The connoisseur's tasting flight.",
      price: "1349.00",
      unit: "per box (3kg, mixed)",
      imageUrl: "https://images.unsplash.com/photo-1623930154100-d4f5c80fb59c?w=900&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1623930154100-d4f5c80fb59c?w=900&q=80",
        "https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=900&q=80",
      ],
      origin: "Pan-India organic farms",
      sweetness: 9,
      rating: "4.92",
      reviewCount: 412,
      stock: 14,
      deliveryEtaHours: 24,
      badge: "Certified Organic",
      categorySlug: "organic",
      isBestSeller: true,
      isOrganic: true,
      popularity: 86,
    },
    {
      slug: "organic-alphonso-jaivik",
      name: "Organic Alphonso (Jaivik)",
      variety: "Alphonso",
      tagline: "Alphonso, untouched by anything but sunlight.",
      description:
        "Certified organic Alphonso from the Konkan belt. Slightly smaller, dramatically more floral. The cleanest mango you'll ever taste.",
      price: "1099.00",
      unit: "per box (2.5kg, 12 mangoes)",
      imageUrl: "https://images.unsplash.com/photo-1546173159-315724a31696?w=900&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1546173159-315724a31696?w=900&q=80",
        "https://images.unsplash.com/photo-1623930154100-d4f5c80fb59c?w=900&q=80",
      ],
      origin: "Konkan coast",
      sweetness: 10,
      rating: "4.88",
      reviewCount: 287,
      stock: 11,
      deliveryEtaHours: 24,
      badge: "Selling Fast",
      categorySlug: "organic",
      isBestSeller: false,
      isOrganic: true,
      popularity: 82,
    },
    {
      slug: "banganapalli-mini-box",
      name: "Banganapalli Family Box",
      variety: "Banganapalli",
      tagline: "Big enough to share. Sweet enough that you won't.",
      description:
        "A 5kg family-size box of fiberless Banganapalli — perfect for kids, smoothies, lassi, and weekday breakfast.",
      price: "999.00",
      unit: "per box (5kg, 10-12 mangoes)",
      imageUrl: "https://images.unsplash.com/photo-1519096845289-95806ee03a1a?w=900&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1519096845289-95806ee03a1a?w=900&q=80",
        "https://images.unsplash.com/photo-1553279768-865429fa0078?w=900&q=80",
      ],
      origin: "Kurnool, Andhra Pradesh",
      sweetness: 9,
      rating: "4.78",
      reviewCount: 534,
      stock: 28,
      deliveryEtaHours: 24,
      badge: "Family Size",
      categorySlug: "banganapalli",
      isBestSeller: false,
      isOrganic: false,
      popularity: 78,
    },
    {
      slug: "kesar-gift-hamper",
      name: "Kesar Gift Hamper",
      variety: "Kesar",
      tagline: "A wooden crate of saffron-kissed mangoes. Gift-ready.",
      description:
        "Hand-packed in a reusable pinewood crate with a handwritten note. Includes 12 hand-selected Kesar mangoes, a sachet of organic chaat masala, and a recipe card.",
      price: "1499.00",
      unit: "per hamper (3kg + extras)",
      imageUrl: "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=900&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=900&q=80",
        "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=900&q=80",
      ],
      origin: "Junagadh, Gujarat",
      sweetness: 9,
      rating: "4.96",
      reviewCount: 198,
      stock: 7,
      deliveryEtaHours: 36,
      badge: "Gift Edition",
      categorySlug: "kesar",
      isBestSeller: false,
      isOrganic: false,
      popularity: 70,
    },
  ];

  await db.insert(productsTable).values(productSeeds);

  console.log("Seeding reviews...");
  await db.insert(reviewsTable).values([
    {
      productId: null,
      authorName: "Priya Iyer",
      authorLocation: "Bengaluru, Karnataka",
      avatarUrl: "https://i.pravatar.cc/150?img=47",
      rating: 5,
      title: "Tastes like my Ajji's orchard",
      body:
        "Opened the box and the whole kitchen smelled like summer at my grandmother's house in Mangalore. The Alphonsos were perfectly ripe — soft, fragrant, and dripping with juice. Will order every week till the season ends.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26),
    },
    {
      productId: null,
      authorName: "Arjun Mehta",
      authorLocation: "Mumbai, Maharashtra",
      avatarUrl: "https://i.pravatar.cc/150?img=12",
      rating: 5,
      title: "Best mangoes I've had in 10 years",
      body:
        "Ordered the Devgad Reserve box on a whim. They arrived in 22 hours, hay-packed, not a single bruise. The first bite stopped a conversation at the dinner table. Worth every rupee.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50),
    },
    {
      productId: null,
      authorName: "Sneha Reddy",
      authorLocation: "Hyderabad, Telangana",
      avatarUrl: "https://i.pravatar.cc/150?img=32",
      rating: 5,
      title: "Banganapalli that tastes like childhood",
      body:
        "The Andhra Banganapalli box is exactly what I remember from my dad's village near Kurnool. Fiberless, honey-sweet, and the size of my palm. My kids are obsessed.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 80),
    },
    {
      productId: null,
      authorName: "Rohan Kapoor",
      authorLocation: "Delhi NCR",
      avatarUrl: "https://i.pravatar.cc/150?img=15",
      rating: 5,
      title: "Subscription is the move",
      body:
        "Signed up for the weekly Connoisseur box. Different variety every week, always perfectly ripe. It's the only subscription in my life I never want to cancel.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 100),
    },
    {
      productId: null,
      authorName: "Meera Krishnan",
      authorLocation: "Chennai, Tamil Nadu",
      avatarUrl: "https://i.pravatar.cc/150?img=49",
      rating: 5,
      title: "Organic and actually organic",
      body:
        "I'm picky about organic certifications. Aamras sent me the Jaivik Bharat paperwork without me even asking. The mangoes are smaller but the flavor is wildly more intense. Converted.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 130),
    },
    {
      productId: null,
      authorName: "Kabir Saxena",
      authorLocation: "Pune, Maharashtra",
      avatarUrl: "https://i.pravatar.cc/150?img=11",
      rating: 5,
      title: "Gifted my in-laws, scored major points",
      body:
        "The Kesar Gift Hamper showed up in a real wooden crate with a handwritten card. My mother-in-law called me three times to say thank you. First time in five years.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 160),
    },
  ]);

  console.log("Seeding subscription plans...");
  await db.insert(subscriptionPlansTable).values([
    {
      slug: "weekly-classic",
      name: "The Classic Box",
      tagline: "One variety, perfectly ripe, every week.",
      description:
        "A 3kg box of one hero variety per week — chosen by our farmers based on what's at peak ripeness. Pause anytime. Cancel anytime.",
      weeklyPrice: "699.00",
      boxesPerWeek: 1,
      varieties: ["Alphonso", "Banganapalli", "Kesar"],
      perks: [
        "Free delivery every week",
        "10% off all single orders",
        "Pause or cancel anytime",
      ],
      imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=900&q=80",
    },
    {
      slug: "weekly-connoisseur",
      name: "The Connoisseur",
      tagline: "Two boxes, two varieties, side-by-side tasting.",
      description:
        "Two curated 2.5kg boxes per week — a hero variety paired with a rotating heirloom (Mulgoba, Imam Pasand, Pairi). For the true mango obsessive.",
      weeklyPrice: "1299.00",
      boxesPerWeek: 2,
      varieties: ["Alphonso", "Kesar", "Imam Pasand", "Mulgoba", "Pairi"],
      perks: [
        "Free express delivery",
        "Recipe card with every box",
        "Early access to new harvests",
        "15% off gift hampers",
      ],
      imageUrl: "https://images.unsplash.com/photo-1623930154100-d4f5c80fb59c?w=900&q=80",
    },
    {
      slug: "weekly-family",
      name: "The Family Crate",
      tagline: "5kg of pure, fiberless joy. Built for big tables.",
      description:
        "A 5kg family-size box of Banganapalli or Kesar each week. Perfect for households with kids, smoothies, and lassi habits.",
      weeklyPrice: "1099.00",
      boxesPerWeek: 1,
      varieties: ["Banganapalli", "Kesar"],
      perks: [
        "Free delivery every week",
        "Free smoothie recipe pack",
        "12% off all single orders",
      ],
      imageUrl: "https://images.unsplash.com/photo-1519096845289-95806ee03a1a?w=900&q=80",
    },
  ]);

  console.log("Done. Seeded:");
  console.log(`  - ${productSeeds.length} products`);
  console.log("  - 4 categories");
  console.log("  - 6 reviews");
  console.log("  - 3 subscription plans");

  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
