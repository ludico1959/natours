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

module.exports = app;
