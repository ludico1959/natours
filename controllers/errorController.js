const AppError = require('../utils/appError');

// VALIDATION ERROR HANDLERS
const handleCastErrorDB = (error) => {
  const message = `Invalid ${error.path}: ${error.value}.`;

  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (error) => {
  const duplicatedName = error.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];

  const message = `Duplicated field value: ${duplicatedName}. Please use another one!`;

  return new AppError(message, 400);
};

// DEV AND PROD ERROR RESPONSES
const sendErrorDev = (error, res) => {
  res.status(error.statusCode).json({
    status: error.status,
    error: error,
    message: error.message,
    stack: error.stack,
  });
};

const sendErrorProd = (error, res) => {
  /* These if/else blocks are for not showing to the client the operational errors.
   * It's a good practice because we don't want to leak error details to the clients.
   */
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    // console.error('ERROR ❗❗❗', error);

    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong 😓',
    });
  }
};

module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === 'production') {
    // Make a hard copy of the error:
    let err = Object.assign(error);

    if (err.name === 'CastError') err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    // err.name and err.code were gotten from Postman error response!

    sendErrorProd(err, res);
  }
};
