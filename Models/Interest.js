const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const interestSchema = new Schema({
   title: String,
   events: [{
    type: Schema.Types.ObjectId,
    ref: 'event'
   }]
});

// eventSchema.virtual('')

const Interest = mongoose.model('interest', interestSchema);
module.exports = Interest;