const express = require('express');
const authMiddleware = require('../Middleware/auth.middlewire');
const accountController = require('../controllers/account.controller');

const router = express.Router();

// POST /api/accounts
router.post('/', authMiddleware.authMiddleware, accountController.createAccount);

// GET /api/accounts/my-account - Get current user's account (place before dynamic :accountId route)
router.get('/my-account', authMiddleware.authMiddleware, accountController.getCurrentUserAccount);

// GET /api/accounts/balance/:accountId
router.get('/balance/:accountId', authMiddleware.authMiddleware, accountController.getAccountBalance);

// GET /api/accounts/system/normal-users - Admin only normal users list with account details
router.get('/system/normal-users', authMiddleware.authSystemUserMiddleware, accountController.getNormalUsersWithAccounts);

// PATCH /api/accounts/system/status/:accountId - Admin updates user account status
router.patch('/system/status/:accountId', authMiddleware.authSystemUserMiddleware, accountController.updateAccountStatusByAdmin);


module.exports=router 