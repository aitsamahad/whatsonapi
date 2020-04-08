  
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  
  event: {
   type: Schema.Types.ObjectId,
   ref: 'event'
  },
  
  bookingDetails: {
   type: Object
  }
});

const Booking = mongoose.model('booking', bookingSchema);
module.exports = Booking;