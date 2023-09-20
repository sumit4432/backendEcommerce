const mongoose = require('mongoose');

const uri = 'mongodb+srv://ecommerce:ecommerce123@sumit.nrhfy41.mongodb.net/sumit?retryWrites=true&w=majority';

const connectDB = () => {
  return mongoose.connect(uri, {
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });
};

module.exports = connectDB;
