const Tour = require('../models/tourModel');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAvaerage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    // BUILD QUERY:
    // 1a) Filtering:
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    excludedFields.forEach((element) => delete queryObj[element]);

    // 1b) Advanced filtering:
    /* EXAMPLES:
     * req.query from 'localhost:3000/api/v1/tours?duration[gte]=5&difficulty=easy&page=2'
     * { difficulty: 'easy', duration: { gte: 5 } }
     *
     * MongoDB operation
     * { difficulty: 'easy', duration: { $gte: 5 } }
     *
     * We need to add '$' to gte, gt, lte and lt.
     */
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    let query = Tour.find(JSON.parse(queryString));

    // 2) Sorting:
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // 3) Field limiting:
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // 4) Pagination:
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numberOfTours = await Tour.countDocuments();

      if (skip >= numberOfTours) throw new Error();
    }

    // EXECUTE QUERY:
    const tours = await query;

    /* Another way to use .find() method with query params:
     * const tours = await Tour.find()
     *   .where('duration')
     *   .gte(6)
     *   .where('difficulty')
     *   .equals('easy');
     */

    // SEND RESPONSE:
    res.status(200).json({
      status: 'success',
      result: tours.length,
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
      message: `Bad request 🚫:\n ${error}`,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const modifiedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Make the promise return the modified document instead of the old one.
      runValidators: true, // Validates the update operation against the model's schema.
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
      message: `Tour whit the ID ${req.params.id} not found 🚫`,
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
      message: `Tour whit the ID ${req.params.id} not found 🚫`,
    });
  }
};
