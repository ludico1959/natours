const mongoose = require('mongoose');

// Schema:
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  maxGroupSize: {
    type: String,
    required: [true, 'A tour must have a difficulty'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a maximum group size'],
  },
  ratingAvarage: {
    type: Number,
    default: 4.5,
  },
  ratingQuantitaty: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true, // Remove all empty space in the beginning and in the end of the string.
    required: [true, 'A tour must have a description'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String, // Just the name of the image, like a reference.
    required: [true, 'A tour must have a cover image'],
  },
  images: [String], // Set a array which elements are strings.
  createdAt: {
    type: Date,
    default: Date.now(), // In MongoDB, this date function is converted in a normal date format.
    select: false,
  },
  startDates: [Date],
});

// Model:
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
