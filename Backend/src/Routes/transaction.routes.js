const {Router} = require('express');
const authMiddleware = require('../Middleware/auth.middlewire.js');
const transactionController = require('../controllers/transaction.controller.js');

const transactionRoutes = Router();

// POST /api/transactions - Create a new transaction
transactionRoutes.post('/', authMiddleware.authMiddleware, transactionController.createTransaction);

// GET /api/transactions/account/:accountId - List transactions for an account
transactionRoutes.get('/account/:accountId', authMiddleware.authMiddleware, transactionController.listTransactionsForAccount);

// POST /api/transactions/system/initial-funds
transactionRoutes.post('/system/initial-funds', authMiddleware.authSystemUserMiddleware, transactionController.createInitialFundsTransaction);

// GET /api/transactions/system/admin-transactions
transactionRoutes.get('/system/admin-transactions', authMiddleware.authSystemUserMiddleware, transactionController.listSystemUserTransactions);

module.exports = transactionRoutes;