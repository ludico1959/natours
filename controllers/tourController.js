const fs = require('fs');

// JSON.parse() converts JSON into JS.
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

/**
 * Param middlewar
 * value holds the id param
 */
exports.checkID = (req, res, next) => {
  const tourExist = tours.find(
    (element) => element.id === Number(req.params.id)
  );

  if (!tourExist) {
    return res.status(404).json({
      status: 'fail',
      message: `The id ${Number(req.params.id)} is invalid`,
    });
  }
  return next();
};

// ROUTES HANDLERS
exports.getAllTours = (req, res) => {
  return res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours,
    },
  });
};

exports.getTour = (req, res) => {
  const tour = tours.find((element) => element.id === Number(req.params.id));

  return res.status(200).json({
    status: 'success',
    data: {
      tour: tour,
    },
  });
};

exports.createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;

  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (error) => {
      return res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

exports.updateTour = (req, res) => {
  return res.status(200).json({
    status: 'sucess',
    data: {
      tour: '<Updated tour...>',
    },
  });
};

exports.deleteTour = (req, res) => {
  return res.status(204).json({
    status: 'success',
    data: null,
  });
};
