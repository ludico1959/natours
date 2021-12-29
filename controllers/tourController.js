const Tour = require('../models/tourModel');

/**
 * Param middlewar
 * value holds the id param
 */

// ROUTES HANDLERS
exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find();

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
