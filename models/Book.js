const mongoose = require('mongoose');
const slugify = require('slugify');

const BooksSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add title'],
    unique: true,
    trim: true, 
    maxLength: [50, 'Title cannot be more than 50 characters'],
  },
  photoUrl: {
    type: String,
    required: [true, "Please enter a photo URL"],
    match: [
      /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/ig,
      'Please enter a valid url'
    ],
  },
  s3Key: {
    type: String,
    required: [true, 'Please enter the image name' ],
  },
  slug: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});

BooksSchema.pre('save', function() {
  this.slug = slugify(this.title, { lower: true });
})

module.exports = mongoose.model('Book', BooksSchema);