const mongoose = require('mongoose');

const blackListSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, 'Token is required for blacklisting'],
        unique: true, // Ensure token is unique in the blacklist
        index: true // Indexing for faster queries (B+ tree index)
    }
}, { timestamps: true }); // Timestamps for createdAt and updatedAt fields

// Set TTL index to automatically remove blacklisted tokens after 3 days
blackListSchema.index(
    { createdAt: 1},
    {expireAfterSeconds: 60 * 60 * 24 * 3}
); // Indexing the createdAt field for efficient lookups and auto-expiration after 3 days

const tokenblackListModel = mongoose.model('BlackList', blackListSchema);
module.exports = tokenblackListModel;