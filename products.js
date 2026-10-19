/* =====================================================
   NONSO TECH: products.js
   All store settings and phone data live in this file.
   To add a phone, copy one block inside PRODUCTS and edit it.
   ===================================================== */

const STORE = {
  name: "Nonso Tech",
  // WhatsApp number in international format, no plus sign, no spaces.
  // 08167608522 becomes 2348167608522 (drop the first 0, add 234).
  whatsappNumber: "2348167608522",
  currency: "₦",
  greeting: "Hi Nonso Tech, I'd like to order:",
};

// Condition options shown on every card
const CONDITIONS = ["New", "UK Used", "Dubai Used"];

/*
  Each product is ONE iPhone model.
  - id:       unique, lowercase, no spaces (also used for the image file name)
  - name:     what the customer sees
  - series:   used for grouping and search (e.g. "iPhone 11")
  - image:    path to the photo, saved in images/phones/
  - variants: the storage sizes you sell, each with its starting price in naira
  - conditions: which conditions you offer for this model
*/
const PRODUCTS = [
  // ---------- iPhone 11 series ----------
  {
    id: "iphone-11",
    name: "iPhone 11",
    series: "iPhone 11",
    image: "images/iphone-11.png",
    variants: [
      { storage: "64GB", price: 220000 },
      { storage: "128GB", price: 250000 },
    ],
    conditions: CONDITIONS,
  },
  {
    id: "iphone-11-pro",
    name: "iPhone 11 Pro",
    series: "iPhone 11",
    image: "images/iphone-11-pro.png",
    variants: [
      { storage: "64GB", price: 240000 },
      { storage: "256GB", price: 270000 },
    ],
    conditions: CONDITIONS,
  },
  {
    id: "iphone-11-pro-max",
    name: "iPhone 11 Pro Max",
    series: "iPhone 11",
    image: "images/iphone-11-pro-max.png",
    variants: [
      { storage: "64GB", price: 250000 },
      { storage: "256GB", price: 290000 },
    ],
    conditions: CONDITIONS,
  },

  // ---------- iPhone 12 series ----------
  {
    id: "iphone-12",
    name: "iPhone 12",
    series: "iPhone 12",
    image: "images/iphone-12.png",
    variants: [
      { storage: "64GB", price: 240000 },
      { storage: "128GB", price: 260000 },
      { storage: "256GB", price: 285000 },
    ],
    conditions: CONDITIONS,
  },
  {
    id: "iphone-12-pro",
    name: "iPhone 12 Pro",
    series: "iPhone 12",
    image: "images/iphone-12-pro.png",
    variants: [
      { storage: "128GB", price: 340000 },
      { storage: "256GB", price: 380000 },
    ],
    conditions: CONDITIONS,
  },
  {
    id: "iphone-12-pro-max",
    name: "iPhone 12 Pro Max",
    series: "iPhone 12",
    image: "images/iphone-12-pro-max.png",
    variants: [
      { storage: "128GB", price: 360000 },
      { storage: "256GB", price: 400000 },
    ],
    conditions: CONDITIONS,
  },

  // ---------- iPhone 13 series ----------
  {
    id: "iphone-13",
    name: "iPhone 13",
    series: "iPhone 13",
    image: "images/iphone-13.png",
    variants: [
      { storage: "128GB", price: 355000 },
      { storage: "256GB", price: 390000 },
    ],
    conditions: CONDITIONS,
  },
  {
    id: "iphone-13-pro",
    name: "iPhone 13 Pro",
    series: "iPhone 13",
    image: "images/iphone-13-pro.png",
    variants: [
      { storage: "128GB", price: 465000 },
      { storage: "256GB", price: 505000 },
    ],
    conditions: CONDITIONS,
  },
  {
    id: "iphone-13-pro-max",
    name: "iPhone 13 Pro Max",
    series: "iPhone 13",
    image: "images/iphone-13-pro-max.png",
    variants: [
      { storage: "128GB", price: 485000 },
      { storage: "256GB", price: 520000 },
    ],
    conditions: CONDITIONS,
  },

  // More models (iPhone X to iPhone 18) will be added here
];