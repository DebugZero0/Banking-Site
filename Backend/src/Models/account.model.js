const mongoose = require('mongoose');
const ledgerModel = require('./ledger.model');

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Account must belong to a user'],
        index: true // Indexing for faster queries (B+ tree index)
    },
    status: {
        type: String,
        enum: {
            values: ['ACTIVE', 'FROZEN', 'CLOSED'],
            message: 'Invalid account status'
        },
        default: 'ACTIVE'
    },
    currency: {
        type: String,
        required: [true, 'Account must have a currency'],
        default: 'INR'
    }
}, { timestamps: true }); // Timestamps for createdAt and updatedAt fields

accountSchema.index({ user: 1, status: 1 }); // Compound index for user field 

// Virtual field for balance (not stored in DB, derived from transactions)
accountSchema.methods.getBalance = async function () {
    const balanceData = await ledgerModel.aggregate([ // Aggregation pipeline to calculate balance
        { $match: { account: this._id } }, // Match transactions for this account
        { // group transactions to calculate total debit and credit
            $group: {
                _id: null, // Grouping by null since we want a single result for the account
                totalDebit:{
                    $sum: { // Conditional sum for debits - only sum amounts where type is DEBIT, otherwise add 0
                        $cond: [{ $eq: ['$type', 'DEBIT'] }, '$amount', 0]
                    }
                },
                totalCredit:{
                    $sum: { // Conditional sum for credits 
                        $cond: [{ $eq: ['$type', 'CREDIT'] }, '$amount', 0]
                    }
                }
            }
        },
        { // Calculate balance as totalCredit - totalDebit
            $project: {
                _id: 0,
                balance: { $subtract: ['$totalCredit', '$totalDebit'] }
            }
        }
    ]);
    return balanceData.length > 0 ? balanceData[0].balance : 0;
};

const accountModel = mongoose.model('Accounts', accountSchema);
module.exports = accountModel;