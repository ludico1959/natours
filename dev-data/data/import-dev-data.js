const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

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

// Read .json file:
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

// Import data into database:
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded 🎆');
  } catch (error) {
    console.log(error);
  }
};

// Delete all data from collection:
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted 🎈');
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
} else {
  console.log('Your flag is not import or delete');
}

console.log(process.argv);
