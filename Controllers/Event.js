const Event = require('../Models/Event');
const Interest = require('../Models/Interest');
const Organizer = require('../Models/Organizer');
const User = require('../Models/User');
const Joi = require('joi');
const Token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJ1c2VybmFtZSI6ImFpdHNhbSIsImVtYWlsIjoiYWl0c2FtQGlkZXZlbG9wc3R1ZGlvLmNvbSJ9LCJpYXQiOjE1ODMwNjg4MTJ9.YIr_GadGJEy-RrEYo956oTvxp5RUZf-d8YC4aUX79qw'


module.exports = {
    
    getEvents: async (req, res) => {
        const events = await Event.find({}).populate(`days`, `day typesOfTicket`).populate(`organizer`, `name`).select(`images days currentBookings attendees title description address lat long happyHour food music offer generalInfo ticketDetails interest`);

        res
        .status(200)
        .json(events);
    },

    getInterests: async (req, res) => {
        const interests = await Interest.find({}).select('title');
        res.status(200).json(interests);
    },

    searchEvent: async (req, res) => {
        const { search } = req.params;
        // const createIndex = await Event.createIndexes({title: 'text', description: 'text'});
        const events = await Event.find({$text: {$search: `${search}`}}).populate(`days`, `day typesOfTicket`).populate(`organizer`, `name`).select(`images days currentBookings attendees title description address lat long happyHour food music offer generalInfo ticketDetails interest`);
        // console.log(events);
        // if (events.length === 0) {
        //     res.status(200).json({message: "No result found!"});
        // } else {
        res.status(200).json(events);
        // }
    },

    getInterestEvents: async (req, res) => {
        const { interest } = req.params;

        const events = await Event.find({interest: interest}).populate(`days`, `day typesOfTicket`).populate(`organizer`, `name`).select(`images days currentBookings attendees title description address lat long happyHour food music offer generalInfo ticketDetails interest`);
        res.status(200).json(events);
    }

}