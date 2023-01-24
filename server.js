const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const errorHandler = require('./middleware/error');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Using environment files
// const path = require('path');

// cookie parser
const cookieParser = require('cookie-parser');
dotenv.config();

// Route files
// const books = require('./routes-v1/books');
// const auth = require('./routes-v1/auth');
// const users = require('./routes-v1/users');
const books = require('./routes/books');
const auth = require('./routes/auth');
const users = require('./routes/users');

// Back-End Framework
const app = express();

// Parse JSON
app.use(express.json());

// use cookie parser
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(hpp());
app.use(cors());

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 500, // Limit each IP to 500 request per 'window' (here, per 15 minutes)
});

app.use(limiter);

// Mount books
app.use('/api/v2/books', books);
app.use('/api/v2/auth', auth);
app.use('/api/v2/users', users);

// error handling has to come after the mounting
app.use(errorHandler);

// PORT
const PORT = process.env.PORT || 5000;

// Making the Back-End Live
const server = app.listen(
  PORT,
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`
  )
);

process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
