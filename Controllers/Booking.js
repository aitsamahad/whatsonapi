const User = require('../Models/User');
const Booking = require('../Models/Booking');
const Event = require('../Models/Event');
const EventDay = require('../Models/EventDate');



module.exports = {
    getAllBookings: async (req, res) => {
        const bookings = await Booking.find({});
         res.json(bookings);
    },
    
    getUserBookings: async (req, res) => {
        const { uid } = req.params;
        const user = await User.findOne({uid : uid}).populate('bookings').select('uid name bookings');
        if (!user) {
            res.json({message: 'No Such user found'});
        } else {

            if (user.bookings.length == 0) {
                res.json([]);
            } else {
                const bookingDetails = await Booking.find({ 'user' : user._id }).populate('event', '-days -currentBookings -attendees -__v').select('-__v');
                res.status(200).json(bookingDetails);
            }
        }
    },
    getBookingDetails: async (req, res) => {
        const { uid,bookingid } = req.params;

        const bookingDetails = await Booking.findOne({ _id : bookingid }).populate('event', '-days -currentBookings -attendees -__v').select('-__v');
        console.log(bookingDetails.user._id)
        // const bookingDetails = await Booking.findOne({ _id : bookingid });
        res.status(200).json(bookingDetails);
    },
    
    deleteBookingByiD: async (req, res) => {
        const { uid,bookingid } = req.params;
        const bookingDetails = await Booking.findOneAndRemove({ _id : bookingid });
        res.status(200).json({message: 'Deleted!'});
    },

    postUserBooking: async (req, res) => {
        const { uid } = req.params;

        const { 
            eventId,
            dayId,
            typeId,
            noTickets
         } = req.body;
         const user = await User.findOne({uid: uid});
         const event = await Event.findOne({_id: eventId});
         const eventday = await EventDay.findOne({"_id" : dayId}, {"typesOfTicket" : {$elemMatch: { _id : typeId }}});
         const day = await EventDay.findOne({ _id : dayId });

         const bookingOBJ = {
             user: user._id,
             event: eventId,
             bookingDetails: {
                day: day.day,
                ticketDetails: eventday.typesOfTicket[0].ticket,
                ticketPrice: eventday.typesOfTicket[0].price,
                ticketBooked: noTickets
             }
         }

         if (eventday.typesOfTicket[0].ticketsLeft != 0 && eventday.typesOfTicket[0].ticketsLeft >= noTickets) {
            const newBooking = new Booking(bookingOBJ);
            await newBooking.save();

            user.bookings.push(newBooking);
            await user.save();

            if (event.attendees.includes(user._id)) {
                const currentBookings = event.currentBookings;
                const currentBookingSum = (parseInt(currentBookings)+parseInt(noTickets));
                event.currentBookings = currentBookingSum;
                await event.save();
            } else {
                event.attendees.push(user);
                const currentBookings = event.currentBookings;
                const currentBookingSum = (parseInt(currentBookings)+parseInt(noTickets));
                event.currentBookings = currentBookingSum;
                await event.save();
            }
            
            eventday.typesOfTicket[0].ticketsLeft = eventday.typesOfTicket[0].ticketsLeft-noTickets;
            await eventday.save();

             res.status(201).json({message:"Booking Confirmed!"});
         } else {
              res.status(204).json({message: "Not enough tickets left!"});
         }

         

         


         

    }
}