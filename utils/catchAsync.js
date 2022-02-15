/* eslint-disable arrow-body-style */

// This is a solution if you want to get rid of try/catch blocks from the Controller!
module.exports = (routeHandlerFunction) => {
  return (req, res, next) => {
    routeHandlerFunction(req, res, next).catch((error) => next(error));
  };
};
