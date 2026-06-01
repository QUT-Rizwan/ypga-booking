const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_TEST_URI = process.env.MONGO_URI_TEST || process.env.MONGO_URI?.replace(/\/[^/]+(\?|$)/, '/yoga-booking-test$1') || 'mongodb://localhost:27017/yoga-booking-test';

before(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_TEST_URI);
  }
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});
