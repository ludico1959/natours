const router = require('express').Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// ROUTES
/////////////////////////////////////////////////////////////////////////////////////////
// authController routers: notice that these are not REST endpoints.
router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

/////////////////////////////////////////////////////////////////////////////////////////
// userController routers
router.patch('/updateMe', authController.protect, userController.updateMe);

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
