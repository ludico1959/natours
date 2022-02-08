const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAvaerage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  // To chain all this methods, it's important to alwais add 'return this' at the end of the method.

  const tours = await features.query;

  // SEND RESPONSE:
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  // Same as 'Tour.findOne({ _id: req.params.id })'

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      createdTour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const modifiedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // Make the promise return the modified document instead of the old one.
    runValidators: true, // Validates the update operation through the model's schema validators.
  });

  if (!modifiedTour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'sucess',
    data: {
      modifiedTour: modifiedTour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const deletedTour = await Tour.findByIdAndDelete(req.params.id);

  if (!deletedTour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const groupID = req.query.id || 'difficulty';

  /* Aggregation Pipeline Stages documentation:
   * https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline/
   */
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: `$${groupID}` },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    results: stats.length,
    data: {
      stats: stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = Number(req.params.year); // year = 2021

  /* $unwind (aggregation)
   * It will create a tour for each  startDates's array values.
   * So if 1 tour have 3 elements in the startDates key, this 1 tour will become 3 tours.
   *
   * FROM DOCUMENTATION: "Deconstructs an array field from the input documents to
   * output a document for each element. Each output document is the input document
   * with the value of the array field replaced by the element."
   */
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      // Get only tours from the year specified.
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    // {
    //   $limit: 6,
    // },
  ]);

  res.status(200).json({
    status: 'success',
    results: plan.length,
    data: {
      plan: plan,
    },
  });
});
