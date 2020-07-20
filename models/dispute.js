const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let dispute = new Schema({
    messageId: {
        type: Schema.ObjectId,
        ref: 'ChatRooms'
    },
    user: {
        type: Schema.ObjectId,
        ref: 'users'
    },
    message: {
        type: String
    },
    clients: {
        type: Array,
    },
    count: {
        type: Number
    }
}, {
    collection: 'dispute'
})

let Dispute = module.exports = mongoose.model('dispute', dispute)