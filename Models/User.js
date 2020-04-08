const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    uid: String,
    name: String,
    age: String,
    email: String,
    interests: [{
        type: Schema.Types.ObjectId,
        ref: 'interest'
    }], 
    gender: {
        type: String,
        default: ""
    },
    phone: {
        type: String,
        default: 0    
    },
    isActive: {
        type: String,
        default: true
    },
    accountType: {
        type: String,
        default: "Personal"
    },
    bookings: [{
        type: Schema.Types.ObjectId,
        ref: 'booking'
    }]
});

const User = mongoose.model('user', userSchema);
module.exports = User;