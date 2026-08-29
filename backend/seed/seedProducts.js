// Run with: npm run seed (make sure .env and MongoDB are set up first)
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');

const products = [
  {
    name: 'Linen Wrap Dress',
    description: 'Breathable linen wrap dress with an adjustable waist tie, perfect for warm days.',
    price: 2499,
    category: 'Women',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Ivory', 'Sage'],
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600',
    stock: 25,
    featured: true,
  },
  {
    name: 'Tailored Wool Blazer',
    description: 'Structured wool-blend blazer with a single-button close and notch lapel.',
    price: 4999,
    category: 'Men',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Charcoal', 'Navy'],
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600',
    stock: 15,
    featured: true,
  },
  {
    name: 'Leather Ankle Boots',
    description: 'Hand-finished leather ankle boots with a block heel and side zip.',
    price: 5999,
    category: 'Footwear',
    sizes: ['6', '7', '8', '9', '10'],
    colors: ['Tan', 'Black'],
    image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600',
    stock: 18,
    featured: true,
  },
  {
    name: 'Silk Scarf',
    description: 'Hand-rolled 100% mulberry silk scarf with an abstract print.',
    price: 1299,
    category: 'Accessories',
    sizes: ['One Size'],
    colors: ['Multicolor'],
    image: 'https://images.unsplash.com/photo-1601924357840-3e50ec5aef2f?w=600',
    stock: 40,
    featured: false,
  },
  {
    name: 'Relaxed Fit Denim Jacket',
    description: 'Washed denim jacket with a relaxed fit and classic chest pockets.',
    price: 3199,
    category: 'Women',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Light Wash'],
    image: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600',
    stock: 30,
    featured: false,
  },
  {
    name: 'Merino Crew Sweater',
    description: 'Fine-gauge merino wool sweater with a ribbed crew neckline.',
    price: 2899,
    category: 'Men',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Oatmeal', 'Forest'],
    image: 'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=600',
    stock: 22,
    featured: false,
  },
  {
    name: 'Leather Crossbody Bag',
    description: 'Compact leather crossbody bag with an adjustable strap and magnetic clasp.',
    price: 3499,
    category: 'Accessories',
    sizes: ['One Size'],
    colors: ['Cognac', 'Black'],
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600',
    stock: 20,
    featured: true,
  },
  {
    name: 'Canvas Low-Top Sneakers',
    description: 'Classic canvas low-top sneakers with a rubber cupsole.',
    price: 1899,
    category: 'Footwear',
    sizes: ['6', '7', '8', '9', '10', '11'],
    colors: ['White', 'Black'],
    image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600',
    stock: 35,
    featured: false,
  },
];

const run = async () => {
  await connectDB();
  await Product.deleteMany();
  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products`);
  mongoose.connection.close();
};

run();
