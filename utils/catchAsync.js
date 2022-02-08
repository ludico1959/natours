/* eslint-disable arrow-body-style */
// This is a solution if you want to get rid of try/catchh blocks from the Controller!

module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((error) => next(error));
  };
};
