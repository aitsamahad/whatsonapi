const mongoose = require('mongoose');
const Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;

const eventDateSchema = new Schema({
    day:  String,
        typesOfTicket: [{
            ticketId: String,
            ticket: String,
            noTickets: Number,
            price: Number,
            ticketsLeft: Number
    }],
    event: {
        type: Schema.Types.ObjectId,
        ref: 'event'
    }

});

eventDateSchema.virtual('ticketId').get(function() {
    return this._id;
})

const EventDate = mongoose.model('eventdate', eventDateSchema);
module.exports = EventDate;