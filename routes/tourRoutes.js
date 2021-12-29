const router = require('express').Router();
const tourController = require('../controllers/tourController');

/**
 * Param middlewar
 * value holds the id param
 */
// router.param('id', tourController.checkID);

// ROUTES
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
