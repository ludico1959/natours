const mongoose = require('mongoose');
const dotenv = require('dotenv');

/* Uncaught Exception error handler
 * Must run before every code
 * It catch errors like logging a undeclared variable, like 'console.log(x)'
 */
process.on('uncaughtException', (error) => {
  console.log(error.name, error.message);
  console.log('❗❗❗ Uncaught Exception! Shutting down the server...');
  process.exit(1);
});

// You have to read the environment variables before require the app file.
dotenv.config({ path: './config.env' });
const app = require('./app');

// Connect to the remote MongoDB database:
const DB = process.env.DATABASE_URL.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Remote database connection successful 📡'));
// .catch(() => console.log('ERROR: Remote database connection problem ❌📡'));

/* See all the environment variables
 * console.log(process.env);
 */

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

/* Unhandled Rejection error handler
 * It catch errors like problems with connection to the remote database.
 */
process.on('unhandledRejection', (error) => {
  console.log(error.name, error.message);
  console.log('❗❗❗ Unhandled Rejection! Shutting down the server...');

  // Close the server
  server.close(() => {
    // Crash te application (optional)
    process.exit(1);
  });
});
