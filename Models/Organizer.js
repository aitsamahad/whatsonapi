const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const organizerSchema = new Schema({
    name: String,
    dob: String,
    email: String,
    password: String,
    gender: String,
    phone: String,
    isActive: {
        type: Boolean,
        default: true
    },
    events: [{
        type: Schema.Types.ObjectId,
        ref: 'event'
    }]
});

const Organizer = mongoose.model('organizer', organizerSchema);
module.exports = Organizer;