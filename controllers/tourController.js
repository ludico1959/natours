const Tour = require('../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    // BUILD QUERY:
    // 1) Filtering:
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    excludedFields.forEach((element) => delete queryObj[element]);
    console.log(req.query, queryObj);

    // 2) Advanced filtering:
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
    console.log(JSON.parse(queryString));

    const query = await Tour.find(JSON.parse(queryString));

    // EXECUTE QUERY:
    const tours = query;

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
