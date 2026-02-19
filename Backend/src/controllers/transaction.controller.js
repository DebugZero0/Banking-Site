const transactionModel = require('../Models/transaction.model');
const ledgerModel = require('../Models/ledger.model');
const emailService = require('../services/email.service');
const accountModel = require('../Models/account.model');
const mongoose = require('mongoose');


async function createTransaction(req, res) {
    const {fromAccount, toAccount, amount , idempotencyKey} = req.body;

    // Validate request
    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({error: 'Missing required fields'});
    }
    const fromUserAccount= await accountModel.findOne({
        _id: fromAccount
    }).populate('user')
    const toUserAccount= await accountModel.findOne({
        _id: toAccount
    }).populate('user')
    if (!fromUserAccount || !toUserAccount) {
        return res.status(404).json({error: 'Account not found'});
    }

    // validate idempotency key
    const existingTransaction = await transactionModel.findOne({idempotencyKey});
    if (existingTransaction) {
        if (existingTransaction.status === 'COMPLETED') {
            return res.status(200).json({
                message: 'Transaction already completed',
                transaction: existingTransaction
            });
        }
        if (existingTransaction.status === 'PENDING') {
            return res.status(200).json({
                message: 'Transaction is pending',
            });
        }
        if (existingTransaction.status === 'FAILED') {
            return res.status(500).json({
                message: 'Transaction failed',
            });
        }
        if (existingTransaction.status === 'REVERSED') {
            return res.status(200).json({
                message: 'Transaction has been reversed try again',
            });
        }

    }

    // check account status
    if (fromUserAccount.status !== 'ACTIVE' || toUserAccount.status !== 'ACTIVE') {
        return res.status(400).json({error: 'Both accounts must be active to perform transactions'});
    }

    // Derive sender balance from ledger
    const balance = await fromUserAccount.getBalance();
    if (balance < amount) {
        return res.status(400).json({message: `Insufficient balance. Current balance is ${balance}`});
    }

    // Create transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    const transaction = new transactionModel({
        initiatedBy: req.user?._id,
        initiatedBySystemUser: req.user?.systemUser === true,
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: 'PENDING'
    });
    await transaction.save({ session });

    const debitLedgerEntry = await ledgerModel.create([{
        account: fromAccount,
        type: 'DEBIT',
        amount: amount,
        transaction: transaction._id
    }], { session });

    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        type: 'CREDIT',
        amount: amount,
        transaction: transaction._id
    }], { session });

    // Update transaction status to COMPLETED
    transaction.status = 'COMPLETED';
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Send email notifications 
    try {
    // Sender mail → only when debit happens
    if (debitLedgerEntry && debitLedgerEntry.length > 0) {
        await emailService.senderEmail(
            fromUserAccount.user.email,
            fromUserAccount.user.name,
            amount,
            toUserAccount.user.name
        );
    }

    // Receiver mail → only when credit happens
    if (creditLedgerEntry && creditLedgerEntry.length > 0) {
        await emailService.receiverEmail(
            toUserAccount.user.email,
            toUserAccount.user.name,
            amount,
            fromUserAccount.user.name
        );
    }

} catch (error) {
    console.error('Error sending transaction emails:', error);
}


    res.status(201).json({
        message: 'Transaction completed successfully',
        transaction: transaction
    });
}

async function createInitialFundsTransaction(req, res) {
    const {toAccount, amount, idempotencyKey} = req.body;
    console.log(req); 

    // Validate request
    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({error: 'Missing required fields'});
    }
    const toUserAccount= await accountModel.findOne({
        _id: toAccount
    }).populate('user')
    if (!toUserAccount) {
        return res.status(404).json({error: 'Account not found'});
    }

    const fromUserAccount= await accountModel.findOne({
        user: req.user._id
    }).populate('user')
    if (!fromUserAccount) {
        return res.status(404).json({error: 'System account not found for the user'});
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    const transaction = new transactionModel({
        initiatedBy: req.user?._id,
        initiatedBySystemUser: true,
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: 'PENDING'
    });

    await transaction.save({ session });

    // when session is used data is passed as an Array to ensure it is part of the transaction
    const debitLedgerEntry = await ledgerModel.create([{
        account: fromUserAccount._id,
        type: 'DEBIT',
        amount: amount, 
        transaction: transaction._id
    }], { session });

        const creditLedgerEntry = await ledgerModel.create([{
            account: toAccount,
            type: 'CREDIT',
            amount: amount,
            transaction: transaction._id
        }], { session });

    // Update transaction status to COMPLETED
    transaction.status = 'COMPLETED';
    await transaction.save({ session }); 

    await session.commitTransaction();
    session.endSession();
    
    // Send email notifications to both sender and receiver
    try {
    // Sender mail → only when debit happens
    if (debitLedgerEntry && debitLedgerEntry.length > 0) {
        await emailService.senderEmail(
            fromUserAccount.user.email,
            fromUserAccount.user.name,
            amount,
            toUserAccount.user.name
        );
    }

    // Receiver mail → only when credit happens
    if (creditLedgerEntry && creditLedgerEntry.length > 0) {
        await emailService.receiverEmail(
            toUserAccount.user.email,
            toUserAccount.user.name,
            amount,
            fromUserAccount.user.name
        );
    }

} catch (error) {
    console.error('Error sending transaction emails:', error);
}


    return res.status(201).json({
        message: 'Initial funds transaction completed successfully',
        transaction: transaction
    });
}

async function listTransactionsForAccount(req, res) {
    const { accountId } = req.params;

    try {
        const userAccount = await accountModel.findOne({
            _id: accountId,
            user: req.user._id
        });

        if (!userAccount) {
            return res.status(404).json({
                message: 'Account not found for this user'
            });
        }

        const transactions = await transactionModel
            .find({
                $or: [
                    { fromAccount: accountId },
                    { toAccount: accountId }
                ]
            })
            .sort({ createdAt: -1 })
            .populate({
                path: 'fromAccount',
                model: 'Accounts',
                select: '_id user',
                populate: {
                    path: 'user',
                    model: 'User',
                    select: 'name'
                }
            })
            .populate({
                path: 'toAccount',
                model: 'Accounts',
                select: '_id user',
                populate: {
                    path: 'user',
                    model: 'User',
                    select: 'name'
                }
            });

        return res.status(200).json({
            message: 'Transactions retrieved successfully',
            transactions
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch transactions'
        });
    }
}

async function listSystemUserTransactions(req, res) {
    try {
        const transactions = await transactionModel
            .find({ initiatedBySystemUser: true })
            .sort({ createdAt: -1 })
            .populate({
                path: 'fromAccount',
                model: 'Accounts',
                select: '_id user',
                populate: {
                    path: 'user',
                    model: 'User',
                    select: 'name'
                }
            })
            .populate({
                path: 'toAccount',
                model: 'Accounts',
                select: '_id user',
                populate: {
                    path: 'user',
                    model: 'User',
                    select: 'name'
                }
            })
            .populate({
                path: 'initiatedBy',
                model: 'User',
                select: 'name email'
            });

        return res.status(200).json({
            message: 'System user transactions retrieved successfully',
            transactions
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch system user transactions'
        });
    }
}

module.exports = {createTransaction, createInitialFundsTransaction, listTransactionsForAccount, listSystemUserTransactions};

