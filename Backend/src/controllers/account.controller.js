const accountModel = require('../Models/account.model');

async function createAccount(req, res) {
    const user= req.user; // Get user from auth middleware
    // Check if user already has an account
    const existingAccount = await accountModel.findOne({ user: user._id });
    if (existingAccount) {
        return res.status(400).json({ message: 'User already has an account', user });
    }
    const account= await accountModel.create({ user: user._id });
    res.status(201).json({
        message: 'Account created successfully',
        status:'success',
        account: account
    });
}

async function getCurrentUserAccount(req, res) {
    try {
        const userId = req.user._id;
        const account = await accountModel.findOne({ user: userId });
        
        if (!account) {
            return res.status(404).json({
                message: 'User does not have an account',
                status: 'no_account',
                account: null
            });
        }
        
        res.status(200).json({
            message: 'User account retrieved successfully',
            status: 'success',
            account: account
        });
    } catch (err) {
        res.status(500).json({
            message: 'Error fetching account',
            status: 'error'
        });
    }
}

async function getAccountBalance(req, res) {
    const {accountId} = req.params;

    const account = await accountModel.findOne({ _id: accountId, user: req.user._id }); // Ensure the account belongs to the authenticated user
    if (!account) {
        return res.status(404).json({ message: 'Account not found' });
    }
    const balance= await account.getBalance(); // Use the method defined in the model to get balance
    res.status(200).json({
        message: 'Account balance retrieved successfully',
        status:'success',
        balance: balance
    });
}

module.exports = { createAccount, getCurrentUserAccount, getAccountBalance };
