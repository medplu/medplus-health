const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clientSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    user: { type: Schema.Types.ObjectId, ref: 'User' },  // Reference to the base User model
});

module.exports = mongoose.model('Client', clientSchema);
