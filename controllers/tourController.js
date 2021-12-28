const Tour = require('../models/tourModel');

/**
 * Param middlewar
 * value holds the id param
 */

exports.checkBody = (req, res, next) => {
  const { name, price } = req.body;

  if (!name || !price) {
    return res.status(400).json({
      status: 'fail',
      message: `A tour registration missed ${
        !name && !price ? 'name and price' : 'name or price'
      }.`,
    });
  }

  next();
};

// ROUTES HANDLERS
exports.getAllTours = (req, res) =>
  res.status(201).json({
    status: 'success',
    data: {},
  });

exports.getTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {},
  });
};

exports.createTour = (req, res) => {
  res.status(201).json({
    status: 'success',
    data: {},
  });
};

exports.updateTour = (req, res) =>
  res.status(200).json({
    status: 'sucess',
    data: {
      tour: '<Updated tour...>',
    },
  });

exports.deleteTour = (req, res) =>
  res.status(204).json({
    status: 'success',
    data: null,
  });
