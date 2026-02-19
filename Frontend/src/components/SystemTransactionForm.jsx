import { useState } from 'react';
import { transactionService } from '../api/services';

const SystemTransactionForm = ({ onTransactionSuccess }) => {
  const [formData, setFormData] = useState({
    toAccount: '',
    amount: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitHovered, setIsSubmitHovered] = useState(false);
  const [isSubmitPressed, setIsSubmitPressed] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const generateIdempotencyKey = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        toAccount: formData.toAccount,
        amount: parseFloat(formData.amount),
        idempotencyKey: generateIdempotencyKey(),
      };

      await transactionService.createInitialFunds(payload);
      setSuccess('System transfer completed successfully!');
      setFormData({ toAccount: '', amount: '' });
      onTransactionSuccess();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'System transfer failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
  className="p-6 rounded-2xl"
  style={{
                                    background: "#F7F0F0", // soft yellow base
                                    boxShadow: `8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.9)`
                                }}
>



      <h2 className="text-2xl font-bold text-gray-900 mb-6">System Transfer</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div>
          <label htmlFor="toAccount" className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Account ID
          </label>
          <input
            type="text"
            id="toAccount"
            name="toAccount"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter recipient's account ID"
            value={formData.toAccount}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount (INR)
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            required
            min="0.01"
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="0.00"
            value={formData.amount}
            onChange={handleChange}
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Transfer Mode:</span>
            <span className="font-medium text-gray-900">System</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full  text-yellow-800 font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          onMouseEnter={() => setIsSubmitHovered(true)}
          onMouseLeave={() => {
            setIsSubmitHovered(false);
            setIsSubmitPressed(false);
          }}
          onMouseDown={() => setIsSubmitPressed(true)}
          onMouseUp={() => setIsSubmitPressed(false)}
          style={{
            background: isSubmitHovered && !loading ? '#FFF19B' : '#EDDCC6',
            boxShadow: `4px 4px 8px rgba(0, 0, 0, 0.1), -4px -4px 8px rgba(255, 255, 255, 0.9)`,
            transform: loading
              ? 'scale(1)'
              : isSubmitPressed
                ? 'scale(0.97)'
                : 'scale(1)'
          }}
        >
          {loading ? 'Processing...' : 'Send System Transfer'}
        </button>
      </form> 

      <div className="mt-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> System transfers are not limited by account balance. Verify the recipient account ID before submitting.
        </p>
      </div>
    </div>
  );
};

export default SystemTransactionForm;
