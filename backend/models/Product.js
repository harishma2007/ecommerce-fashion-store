const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ['Women', 'Men', 'Accessories', 'Footwear'],
    },
    sizes: { type: [String], default: ['S', 'M', 'L', 'XL'] },
    colors: { type: [String], default: [] },
    image: { type: String, required: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
