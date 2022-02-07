const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// MIDDLEWARE
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use(express.json());

// Middleware serving static files, example: http://localhost:3000/overview.html
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log(
    'A request reached the server! 🎃\nDetails on the logger below 🔻'
  );
  next();
});

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
// If the request didn't get into these two URL's, it will reach the middleware below:

// '.all' means all HTTP methods: '.get', '.post', '.put', '.patch', 'delete'
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server 🚫`,
  // });

  const error = new Error(`Can't find ${req.originalUrl} on this server 🚫`);
  error.status = 'fail';
  error.statusCode = 404;

  next(error);
  /* If you pass anything as an argument in the next() function,
   * Node will automaticaly assume that it's an error.
   * And it will go directly to the glocal ERROR HANDLING MIDDLEWARE, no matter where it is.
   */
});

// ERROR HANDLING MIDDLEWARE
app.use((error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
});

module.exports = app;
