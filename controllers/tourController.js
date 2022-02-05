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
