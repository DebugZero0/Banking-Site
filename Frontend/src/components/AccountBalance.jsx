const AccountBalance = ({ account, balance, onRefresh }) => {
  return (
   <div
  className="p-6 rounded-2xl text-white"
  style={{
    background: "linear-gradient(145deg, #2563eb, #1d4ed8)", // similar to primary-600 → 700
    boxShadow: `
      10px 10px 20px rgba(0, 0, 0, 0.25),
      -6px -6px 16px rgba(255, 255, 255, 0.15)
    `
  }}
>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-lg font-semibold opacity-90">Account Balance</h2>
          <p className="text-sm opacity-75">Account ID: {account._id}</p>
        </div>
        <button
          onClick={onRefresh}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-full transition-all duration-200"
          title="Refresh balance"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      <div className="mb-4">
        <p className="text-4xl font-bold">
          ₹{balance !== null ? balance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
        </p>
      </div>

      <div className="flex items-center space-x-2 text-sm opacity-90">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full ${
            account.status === 'ACTIVE'
              ? 'bg-green-500 bg-opacity-100'
              : 'bg-yellow-500 bg-opacity-30'
          }`}
        >
          {account.status}
        </span>
        <span>Currency: {account.currency}</span>
      </div>
    </div>
  );
};

export default AccountBalance;
