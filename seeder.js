const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// load environment variables
dotenv.config({ path: './config/config.env'});

// load models
const Book = require('./models/Book');
const User = require('./models/User');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true, // show warnings on database
  useUnifiedTopology: true,
});

// Read json
const books = JSON.parse(fs.readFileSync(`${__dirname}/_data/books.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'));

// import into DB
const importData = async () => {
  try {
    await Book.create(books);
    await User.create(users);
    console.log('data imported...');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// delete Data from DB
const deleteData = async () => {
  try {
    await Book.deleteMany();
    await User.deleteMany();
    console.log('data destroyed...');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}