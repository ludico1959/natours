const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

/////////////////////////////////////////////////////////////////////
// SCHEMA
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 charcters'],
      minlength: [10, 'A tour name must have more or equal than 10 charcters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
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
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        message:
          'Discount price (US$ {VALUE}) should be below the regular price',
        validator: function (value) {
          // This only points to current doc on NEW document creation (so it does not work for updating)
          return value < this.price;
        },
      },
    },
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
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false, // Mongoose by default adds a virtual property called "id" to your model.
  }
);

/////////////////////////////////////////////////////////////////////
/* DOCUMENT MIDDLEWARE:
 * .pre: runs before .save() and .create()
 * .post: runs after .save() and .create()
 * It does not run before updates!
 */
tourSchema.pre('save', function (next) {
  // 'this.' can't be used in a arrow function.
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', (next) => {
//   console.log('Will save document... 💾');
//   next();
// });

// tourSchema.post('save', (doc, next) => {
//   console.log(doc);
//   next();
// });

/////////////////////////////////////////////////////////////////////
/* QUERY MIDDLEWARE
 * .pre: runs before a query and, in this case, the query is anyome who start with 'find' (regex)
 * .post: runs after a query and, in this case, the query is anyome who start with 'find' (regex)
 */
tourSchema.pre(/^find/, function (next) {
  // 'this.' points to the query and chain to it another find method
  this.find({ secretTour: { $ne: true } });

  // >>> Let's see how much time it takes to do this request!
  this.start = Date.now();
  next();
});

/////////////////////////////////////////////////////////////////////
/* AGGREGATION MIDDLEWARE
 * .pre: runs before an aggregation
 * .post: runs after an aggregation
 */

tourSchema.pre('aggregate', function (next) {
  console.log(this.pipeline());

  // Add this object below to the pipeline array!
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

/////////////////////////////////////////////////////////////////////
/* VIRTUAL PROPERTIES
 * They are not saved in the database.
 * Mongoose by default adds a virtual property called "id" to your model.
 */
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

/////////////////////////////////////////////////////////////////////
// MODEL
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
