const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

/////////////////////////////////////////////////////////////////////////////////////////////////////
// GLOBAL MIDDLEWARES
// Set security HTTP headers:
// Helmet is, in fact, a collection of multiple smaller middlwares that set HTTP response headers.
app.use(helmet());

// Development loggin:
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(
      'A request reached the server! 🎃\nDetails on the logger below 🔻'
    );
    next();
  });

  app.use(morgan('dev'));
}

/* express-rate-limite
 * Allow 100 requests from the same IP in 1 hour!
 * You can see the rateLimits keys among the Headers in the request.
 */
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // = 1 hour
  message: 'Too many request from this IP! Please try again in an hour.',
});

// Limit requests from same IP (in this case, only affects routes that start with '/api'):
app.use('/api', limiter);

// Body parser (reading data from the body into req.body), limited to 10kb:
app.use(
  express.json({
    limit: '10kb',
  })
);

/* Data sanitization against NoSQL query injection.
 * For example this 'Login user' request:
 * {
 *  "email": { "gt": "" },
 *  "password": "anyUserPassword"
 * }
 */
app.use(mongoSanitize());

// Data sanitization against XSS (Cross-site Scripting) attacks:
app.use(xss());

/* Prevent parameter pollution:
 * For example this URL:
 * http://localhost:3000/api/v1/tours?page=2$page=1
 * This don't apply to the whitelist keys.
 */
app.use(
  hpp({
    whitelist: [
      'duration',
      'difficulty',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'price',
    ],
  })
);

// Serving static files (example: http://localhost:3000/overview.html):
app.use(express.static(`${__dirname}/public`));

// Test middleware: taking a look at the headers when we need it.
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

/////////////////////////////////////////////////////////////////////////////////////////////////////
// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
// If the request didn't get into these two URL's, it will reach the middleware below:

// '.all' means all HTTP methods: '.get', '.post', '.put', '.patch', '.delete'
app.all('*', (req, res, next) => {
  // Version #1:
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server 🚫`,
  // });

  // Version #2:
  // const error = new Error(`Can't find ${req.originalUrl} on this server 🚫`);
  // error.status = 'fail';
  // error.statusCode = 404;
  // next (error);

  next(new AppError(`Can't find ${req.originalUrl} on this server 🚫`, 404));
  /* If you pass anything as an argument in the next() function,
   * Node will automaticaly assume that it's an error.
   * And it will go directly to the glocal ERROR HANDLING MIDDLEWARE, no matter where it is.
   */
});

/////////////////////////////////////////////////////////////////////////////////////////////////////
// ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;
