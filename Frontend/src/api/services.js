import api from './axios';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.removeItem('userAccount');
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.removeItem('userAccount');
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userAccount');
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export const accountService = {
  createAccount: async () => {
    const response = await api.post('/accounts');
    return response.data;
  },

  getCurrentUserAccount: async () => {
    const response = await api.get('/accounts/my-account');
    return response.data;
  },

  getAccountBalance: async (accountId) => {
    const response = await api.get(`/accounts/balance/${accountId}`);
    return response.data;
  },
};

export const transactionService = {
  createTransaction: async (transactionData) => {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },

  getAccountTransactions: async (accountId) => {
    const response = await api.get(`/transactions/account/${accountId}`);
    return response.data;
  },

  createInitialFunds: async (fundData) => {
    const response = await api.post('/transactions/system/initial-funds', fundData);
    return response.data;
  },

  getSystemUserTransactions: async () => {
    const response = await api.get('/transactions/system/admin-transactions');
    return response.data;
  },
};
