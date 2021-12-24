const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
// You have to read the environment variables before require the app file.

const app = require('./app');

/**
 * See all environment variables:
 * console.log(process.env);
 */

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
