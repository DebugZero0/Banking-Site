import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { accountService, transactionService } from '../api/services';
import AccountBalance from '../components/AccountBalance';
import CreateAccount from '../components/CreateAccount';
import TransactionForm from '../components/TransactionForm';
import SystemTransactionForm from '../components/SystemTransactionForm';
import Navbar from '../components/Navbar';

const Dashboard = () => {
    const { user } = useAuth();
    const [account, setAccount] = useState(null);
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [hasAccount, setHasAccount] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState('');
    const [historyItems, setHistoryItems] = useState([]);
    const [adminUsers, setAdminUsers] = useState([]);
    const [adminUsersLoading, setAdminUsersLoading] = useState(false);
    const [adminUsersError, setAdminUsersError] = useState('');
    const [adminStatusDrafts, setAdminStatusDrafts] = useState({});
    const [updatingStatusForAccountId, setUpdatingStatusForAccountId] = useState('');
    const isAdmin = user?.systemUser === true;

    useEffect(() => {
        fetchAccountData();
    }, []);

    useEffect(() => {
        if (isAdmin) {
            fetchNormalUsersForAdmin();
        }
    }, [isAdmin]);

    const fetchAccountData = async () => {
        setLoading(true);
        setError('');

        try {
            try {
                const response = await accountService.getCurrentUserAccount();
                const accountData = response.account;
                setAccount(accountData);
                setHasAccount(true);
                localStorage.setItem('userAccount', JSON.stringify(accountData));
                if (!isAdmin) {
                    await fetchBalance(accountData._id);
                }
            } catch (err) {
                if (err.response?.status === 404) {
                    setAccount(null);
                    setHasAccount(false);
                    setBalance(null);
                    localStorage.removeItem('userAccount');
                } else {
                    setError('Failed to fetch account information');
                }
            }
        } catch (err) {
            console.error('Error in fetchAccountData:', err);
            setError('An error occurred while loading your account');
        } finally {
            setLoading(false);
        }
    };

    const fetchBalance = async (accountId) => {
        try {
            const response = await accountService.getAccountBalance(accountId);
            setBalance(response.balance);
        } catch (err) {
            console.error('Error fetching balance:', err);
            setError('Failed to fetch balance');
        }
    };

    const fetchNormalUsersForAdmin = async () => {
        setAdminUsersLoading(true);
        setAdminUsersError('');

        try {
            const response = await accountService.getNormalUsersForAdmin();
            const users = response.users || [];
            setAdminUsers(users);
            const draftMap = users.reduce((acc, item) => {
                acc[item.accountId] = item.status || 'ACTIVE';
                return acc;
            }, {});
            setAdminStatusDrafts(draftMap);
        } catch (err) {
            console.error('Error fetching normal users for admin:', err);
            setAdminUsersError('Failed to fetch normal users list');
        } finally {
            setAdminUsersLoading(false);
        }
    };

    const handleAccountCreated = (newAccount) => {
        setAccount(newAccount);
        setHasAccount(true);
        localStorage.setItem('userAccount', JSON.stringify(newAccount));
        if (!isAdmin) {
            fetchBalance(newAccount._id);
        }
    };

    const handleTransactionSuccess = () => {
        if (account) {
            if (!isAdmin) {
                fetchBalance(account._id);
            }
            if (showHistory) {
                fetchTransactionHistory(account._id);
            }
        }
    };

    const fetchTransactionHistory = async (accountId) => {
        setHistoryLoading(true);
        setHistoryError('');

        try {
            const response = isAdmin
                ? await transactionService.getSystemUserTransactions()
                : await transactionService.getAccountTransactions(accountId);
            setHistoryItems(response.transactions || []);
        } catch (err) {
            console.error('Error fetching transaction history:', err);
            setHistoryError('Failed to fetch transaction history');
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleToggleHistory = () => {
        const nextShow = !showHistory;
        setShowHistory(nextShow);
        if (nextShow && account) {
            fetchTransactionHistory(account._id);
        }
    };

    const formatAmount = (amount) => {
        const value = Number(amount) || 0;
        return `INR ${value.toFixed(2)}`;
    };

    const formatTime = (dateValue) => {
        if (!dateValue) return 'N/A';
        const date = new Date(dateValue);
        if (Number.isNaN(date.getTime())) return 'N/A';
        return date.toLocaleString('en-GB', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    const formatDate = (dateValue) => {
        if (!dateValue) return 'N/A';
        const date = new Date(dateValue);
        if (Number.isNaN(date.getTime())) return 'N/A';
        return date.toLocaleDateString('en-GB', {
            dateStyle: 'medium'
        });
    };

    const handleAdminStatusDraftChange = (accountId, nextStatus) => {
        setAdminStatusDrafts((prev) => ({
            ...prev,
            [accountId]: nextStatus
        }));
    };

    const handleAdminStatusUpdate = async (accountId) => {
        const nextStatus = adminStatusDrafts[accountId];
        if (!nextStatus) return;

        setUpdatingStatusForAccountId(accountId);
        setAdminUsersError('');

        try {
            await accountService.updateUserAccountStatusByAdmin(accountId, nextStatus);
            setAdminUsers((prev) =>
                prev.map((item) =>
                    item.accountId === accountId
                        ? { ...item, status: nextStatus }
                        : item
                )
            );
        } catch (err) {
            console.error('Error updating account status:', err);
            setAdminUsersError(err?.response?.data?.message || 'Failed to update account status');
        } finally {
            setUpdatingStatusForAccountId('');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome, {user?.name}!
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {hasAccount
                            ? 'Manage your account and transactions'
                            : 'Create your bank account to get started'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : !hasAccount || !account ? (
                    <div>
                        <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
                            <p className="font-semibold">No Account Found</p>
                            <p>You need to create a bank account before you can perform transactions or check your balance.</p>
                        </div>
                        <CreateAccount onAccountCreated={handleAccountCreated} />
                    </div>
                ) : isAdmin ? (
                    <div className="space-y-8">
                        <div
  className="p-6 rounded-2xl"
  style={{
    background: "#fef9c3", // soft yellow base
    boxShadow: `
      8px 8px 16px rgba(0, 0, 0, 0.15),
      -8px -8px 16px rgba(255, 255, 255, 0.8)
    `
  }}
>


                            <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to the Admin Dashboard</h2>
                            <p className="text-gray-700">You can transfer funds without balance checks.</p>
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-white border border-yellow-200 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Last Login</p>
                                    <p className="text-sm font-semibold text-gray-900">{formatTime(user?.lastLoginAt)}</p>
                                </div>
                                <div className="bg-white border border-yellow-200 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Last Logout</p>
                                    <p className="text-sm font-semibold text-gray-900">{formatTime(user?.lastLogoutAt)}</p>
                                </div>
                            </div>
                        </div>

                        <div
  className="p-6 rounded-2xl"
  style={{
    background: "#dbeafe", // soft blue base
    boxShadow: `
      8px 8px 16px rgba(0, 0, 0, 0.1),
      -8px -8px 16px rgba(255, 255, 255, 0.9)
    `
  }}
>

                            <h3 className="text-lg font-bold text-gray-900 mb-4">Admin Profile</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-600">Name</p>
                                    <p className="text-sm font-semibold text-gray-900">{user?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-600">Email</p>
                                    <p className="text-sm font-semibold text-gray-900">{user?.email || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-600">Account Number</p>
                                    <p className="text-sm font-semibold text-gray-900">{account?._id || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div
  className="bg-white rounded-lg shadow-md p-6"
  style={{
    background: "#f0f9ff", // soft blue base
    boxShadow: `
      8px 8px 16px rgba(0, 0, 0, 0.1),
      -8px -8px 16px rgba(255, 255, 255, 0.9)
    `
  }}
>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900"> Users</h3>
                                <button
                                    type="button"
                                    onClick={fetchNormalUsersForAdmin}
                                    className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                                >
                                    Refresh
                                </button>
                            </div>

                            {adminUsersLoading ? (
                                <div className="p-4 text-center text-gray-600">Loading users...</div>
                            ) : adminUsersError ? (
                                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                                    {adminUsersError}
                                </div>
                            ) : adminUsers.length === 0 ? (
                                <div className="p-4 text-center text-gray-600">No normal users found.</div>
                            ) : (
                                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Account ID</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Account Created Date</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {adminUsers.map((item) => (
                                                <tr key={item.accountId} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{item.name || 'N/A'}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{item.email || 'N/A'}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{item.accountId || 'N/A'}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                                                        <select
                                                            value={adminStatusDrafts[item.accountId] || item.status || 'ACTIVE'}
                                                            onChange={(e) => handleAdminStatusDraftChange(item.accountId, e.target.value)}
                                                            className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                            disabled={updatingStatusForAccountId === item.accountId}
                                                        >
                                                            <option value="ACTIVE">ACTIVE</option>
                                                            <option value="FROZEN">FROZEN</option>
                                                            <option value="CLOSED">CLOSED</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{formatDate(item.accountCreatedAt)}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAdminStatusUpdate(item.accountId)}
                                                            disabled={updatingStatusForAccountId === item.accountId}
                                                            className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold py-1.5 px-3 rounded-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                                        >
                                                            {updatingStatusForAccountId === item.accountId ? 'Updating...' : 'Update'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white rounded-lg shadow-md p-6"
                                style={{
                                    background: "#F7F0F0", // soft yellow base
                                    boxShadow: `8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.9)`
                                }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-900">Transactions</h2>
                                    <button
                                        type="button"
                                        onClick={handleToggleHistory}
                                        className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                                    >
                                        {showHistory ? 'Hide Transactions' : 'View Transactions'}
                                    </button>
                                </div>

                                {showHistory && (
                                    <div className="border border-gray-200 rounded-lg">
                                        {historyLoading ? (
                                            <div className="p-6 text-center text-gray-600">Loading transactions...</div>
                                        ) : historyError ? (
                                            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                                                {historyError}
                                            </div>
                                        ) : (() => {
                                            const outgoingTransactions = historyItems.filter(
                                                (txn) => txn?.fromAccount?._id === account?._id
                                            );

                                            if (outgoingTransactions.length === 0) {
                                                return (
                                                    <div className="p-6 text-center text-gray-600">
                                                        No outgoing transactions found.
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date & Time</th>
                                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount Sent</th>
                                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">To Account</th>
                                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">To Account Name</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {outgoingTransactions.map((txn) => (
                                                                <tr key={txn._id} className="hover:bg-gray-50">
                                                                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                                                                        {formatTime(txn.createdAt)}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm font-semibold text-red-600 whitespace-nowrap">
                                                                        -{formatAmount(txn.amount)}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                                                                        {txn?.toAccount?._id || 'N/A'}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                                                                        {txn?.toAccount?.user?.name || 'Unknown'}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>

                            <div>
                                <SystemTransactionForm
                                    onTransactionSuccess={handleTransactionSuccess}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <AccountBalance
                                account={account}
                                balance={balance}
                                onRefresh={() => fetchBalance(account._id)}
                            />

                            <div className="bg-blue-50 rounded-lg shadow-md p-6 h-100 overflow-y-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
                                    <button
                                        type="button"
                                        onClick={handleToggleHistory}
                                        className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                                    >
                                        {showHistory ? 'Hide History' : 'View History'}
                                    </button>
                                </div>

                                {showHistory && (
                                    <div className="border border-gray-200 rounded-lg">
                                        {historyLoading ? (
                                            <div className="p-6 text-center text-gray-600">Loading transactions...</div>
                                        ) : historyError ? (
                                            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                                                {historyError}
                                            </div>
                                        ) : historyItems.length === 0 ? (
                                            <div className="p-6 text-center text-gray-600">
                                                No transactions found.
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">From</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">To</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">To Account Holder</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {historyItems.map((txn) => {
                                                            const isDebit = txn?.fromAccount?._id === account._id;
                                                            const toAccountHolder = txn?.toAccount?.user?.name || 'Unknown';

                                                            return (
                                                                <tr key={txn._id} className="hover:bg-gray-50">
                                                                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                                                                        {formatTime(txn.createdAt)}
                                                                    </td>
                                                                    <td className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${isDebit ? 'text-red-600' : 'text-green-600'}`}>
                                                                        {isDebit ? '-' : '+'}{formatAmount(txn.amount)}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                                                                        {txn?.fromAccount?._id || 'N/A'}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                                                                        {txn?.toAccount?._id || 'N/A'}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                                                                        {toAccountHolder}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <TransactionForm
                                account={account}
                                onTransactionSuccess={handleTransactionSuccess}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
