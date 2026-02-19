const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
    account:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Accounts',
        required: [true, 'Ledger entry must belong to an account'],
        index: true,
        immutable: true // Ledger entries should not be modified after creation
    },
    amount:{
        type: Number,
        required: [true, 'Ledger entry must have an amount'],
        immutable: true 
    },
    transaction:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transactions',
        required: [true, 'Ledger entry must be associated with a transaction'],
        index: true,
        immutable: true
    },
    type:{
        type: String,
        enum:{
            values: ['DEBIT', 'CREDIT'],
            message: 'Invalid ledger entry type',
            default: 'DEBIT'
        },
        required: [true, 'Ledger entry must have a type'],
        immutable: true 
    }
});

function preventLedgerModification() {
    throw new Error('Ledger entries cannot be modified after creation');
}

ledgerSchema.pre('findOneAndUpdate', preventLedgerModification);
ledgerSchema.pre('findOneAndDelete', preventLedgerModification);
ledgerSchema.pre('findOneAndReplace', preventLedgerModification);
ledgerSchema.pre('findOneAndRemove', preventLedgerModification);
ledgerSchema.pre('updateOne', preventLedgerModification);
ledgerSchema.pre('updateMany', preventLedgerModification);
ledgerSchema.pre('deleteMany', preventLedgerModification);
ledgerSchema.pre('deleteOne', preventLedgerModification);
ledgerSchema.pre('remove', preventLedgerModification);

const ledgerModel = mongoose.model('Ledger', ledgerSchema);
module.exports = ledgerModel;