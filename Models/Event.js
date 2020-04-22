const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    title: {
        type: String
    },
    summary: String,
    description: {
        type: String
    },
    address: String,
    lat: String,
    long: String,
    images: [],
    interest: {
        type: Schema.Types.ObjectId,
        ref: 'interest'
    },
    days:[{
        type: Schema.Types.ObjectId,
        ref: 'eventdate'
    }],
    generalInfo: String,
    ticketDetails: String,
    currentBookings: {
        type: Number,
        default: 0
    },
    happyHour: String,
    food: String,
    music: String,
    offer: String,
    organizer: {
        type: Schema.Types.ObjectId,
        ref: 'organizer'
    },
    attendees: [{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }]
});

eventSchema.index({title: 'text', description : 'text'});
// eventSchema.virtual('')

const Event = mongoose.model('event', eventSchema);
module.exports = Event;