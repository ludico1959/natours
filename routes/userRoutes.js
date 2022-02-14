const router = require('express').Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// ROUTES
// Notice that this is not a REST endpoint.
router.post('/signup', authController.signup);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
