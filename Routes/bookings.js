const router = require('express-promise-router')(); // Global Try Catch Error Handling
const BookingController = require('../Controllers/Booking');

router.route('/')
.get(BookingController.getAllBookings);

router.route('/:uid')
.get(BookingController.getUserBookings)
.post(BookingController.postUserBooking);

router.route('/:uid/details/:bookingid')
.get(BookingController.getBookingDetails)
.delete(BookingController.deleteBookingByiD);


module.exports = router;