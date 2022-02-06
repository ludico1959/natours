const mongoose = require('mongoose');
const slugify = require('slugify');

// Schema:
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
    },
    slug: String,
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
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre('save', function (next) {
  // 'this.' can't be used in a arrow function.
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre('save', (next) => {
  console.log('Will save document... 💾');
  next();
});

tourSchema.post('save', (doc, next) => {
  console.log(doc);
  next();
});

// VIRTUAL PROPERTIES:
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Model:
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
