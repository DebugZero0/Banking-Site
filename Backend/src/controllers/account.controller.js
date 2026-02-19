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

async function getNormalUsersWithAccounts(req, res) {
    try {
        const users = await accountModel.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userData'
                }
            },
            { $unwind: '$userData' },
            { $match: { 'userData.systemUser': false } },
            {
                $project: {
                    _id: 0,
                    name: '$userData.name',
                    email: '$userData.email',
                    accountId: '$_id',
                    status: '$status',
                    accountCreatedAt: '$createdAt'
                }
            },
            { $sort: { accountCreatedAt: -1 } }
        ]);

        return res.status(200).json({
            message: 'Normal users retrieved successfully',
            status: 'success',
            users
        });
    } catch (err) {
        console.error('Error fetching normal users:', err);
        return res.status(500).json({
            message: 'Error fetching normal users',
            status: 'error'
        });
    }
}

async function updateAccountStatusByAdmin(req, res) {
    try {
        const { accountId } = req.params;
        const { status } = req.body;

        const allowedStatuses = ['ACTIVE', 'FROZEN', 'CLOSED'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: 'Invalid status. Allowed values: ACTIVE, FROZEN, CLOSED',
                status: 'failed'
            });
        }

        const account = await accountModel.findById(accountId);
        if (!account) {
            return res.status(404).json({
                message: 'Account not found',
                status: 'failed'
            });
        }

        account.status = status;
        await account.save();

        return res.status(200).json({
            message: 'Account status updated successfully',
            status: 'success',
            account: {
                id: account._id,
                status: account.status
            }
        });
    } catch (err) {
        console.error('Error updating account status:', err);
        return res.status(500).json({
            message: 'Error updating account status',
            status: 'error'
        });
    }
}

module.exports = { createAccount, getCurrentUserAccount, getAccountBalance, getNormalUsersWithAccounts, updateAccountStatusByAdmin };
