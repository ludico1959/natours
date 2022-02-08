const mongoose = require('mongoose');
const dotenv = require('dotenv');

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

/* See all the environment variables
 * console.log(process.env);
 */

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
