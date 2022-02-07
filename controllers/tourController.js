const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAvaerage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: 'Tours not found 🚫',
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // Same as 'Tour.findOne({ _id: req.params.id })'

    res.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: `Tour whit the ID ${req.params.id} not found 🚫`,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        createdTour: newTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: `Bad request 🚫: ${error}`,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const modifiedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Make the promise return the modified document instead of the old one.
      runValidators: true, // Validates the update operation through the model's schema validators.
    });

    res.status(200).json({
      status: 'sucess',
      data: {
        modifiedTour: modifiedTour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: `Tour with the ID ${req.params.id} not found 🚫`,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: `Tour with the ID ${req.params.id} not found 🚫`,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: `Bad request 🚫: ${error}`,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: `Bad request 🚫: ${error}`,
    });
  }
};
