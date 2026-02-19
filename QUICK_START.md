# Banking System - Quick Start Guide

## 🚀 Getting Started

### Backend Setup

1. Navigate to the Backend folder:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_HOST=your_email_host
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

4. Start the backend server:
```bash
npm start
```

Backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to the Frontend folder:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will run on http://localhost:3000

## 📱 Using the Application

### 1. Register a New Account
- Go to http://localhost:3000
- Click "Get Started" or "Register"
- Fill in your name, email, and password
- Click "Create Account"

### 2. Create a Bank Account
- After registration, you'll be redirected to the dashboard
- Click "Create Account" button
- Your bank account will be created instantly

### 3. Send Money
- Copy your Account ID (last 8-12 characters shown on balance card)
- To test transactions, you can:
  - Register another user in a different browser/incognito window
  - Create their bank account
  - Use one account to send money to the other using the Account ID
- Fill in the recipient's Account ID and amount
- Click "Send Money"

### 4. Check Balance
- Your balance updates automatically after transactions
- Click the refresh button on the balance card to manually refresh

## 🎯 Key Features

### Authentication
- ✅ User registration with email verification
- ✅ Secure login with JWT tokens
- ✅ Automatic session management
- ✅ Secure logout with token blacklisting

### Account Management
- ✅ One account per user
- ✅ Real-time balance tracking
- ✅ Account status monitoring (ACTIVE/FROZEN/CLOSED)
- ✅ Multi-currency support (Default: INR)

### Transactions
- ✅ Instant money transfers
- ✅ Double-entry ledger system
- ✅ Transaction idempotency (prevents duplicate transactions)
- ✅ Email notifications for sender and receiver
- ✅ Transaction status tracking

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Token blacklisting on logout
- Protected API routes
- Input validation
- MongoDB injection prevention

## 📊 Transaction Flow

1. **Create Transaction Request**
   - Sender initiates transfer with recipient Account ID and amount
   - System generates unique idempotency key

2. **Validation**
   - Check if both accounts exist and are active
   - Verify sender has sufficient balance
   - Check for duplicate idempotency key

3. **Processing**
   - Create transaction record (status: PENDING)
   - Create debit entry in sender's ledger
   - Create credit entry in recipient's ledger
   - Update transaction status to COMPLETED
   - All within a MongoDB transaction for atomicity

4. **Notification**
   - Send email to sender confirming debit
   - Send email to recipient confirming credit

5. **Balance Update**
   - Balance is calculated from ledger entries
   - No direct balance field (prevents inconsistencies)

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT for authentication
- Nodemailer for emails
- bcrypt for password hashing

### Frontend
- React 18
- React Router v6
- Axios for API calls
- Tailwind CSS for styling
- Vite as build tool

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Accounts
- `POST /api/accounts` - Create bank account
- `GET /api/accounts/balance/:accountId` - Get account balance

### Transactions
- `POST /api/transactions` - Create transaction
- `POST /api/transactions/system/initial-funds` - Add initial funds (system user only)

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
- Verify MongoDB is running
- Check MONGODB_URI in .env file
- Ensure IP is whitelisted (if using MongoDB Atlas)

**JWT Error:**
- Check JWT_SECRET is set in .env
- Verify token hasn't expired

### Frontend Issues

**API Connection Error:**
- Ensure backend is running on port 5000
- Check console for CORS errors
- Verify API_BASE_URL in axios.js

**Balance Not Showing:**
- Make sure account is created
- Check localStorage for 'userAccount'
- Verify account ID is correct

**Transaction Failed:**
- Verify both accounts exist
- Check sender has sufficient balance
- Ensure both accounts are ACTIVE
- Verify recipient Account ID is correct

## 💡 Tips

1. **Testing Transactions:**
   - Create two accounts (use different browsers or incognito mode)
   - Copy the full Account ID from MongoDB or from the UI
   - Start with small amounts to test

2. **Account IDs:**
   - Account IDs are MongoDB ObjectIDs (24 characters)
   - Must be copied exactly for transactions
   - Case sensitive

3. **Email Notifications:**
   - Configure email settings in backend .env
   - Use a test email service like Mailtrap for development

## 📚 Additional Resources

- Backend folder structure: see Backend/README.md
- Frontend folder structure: see Frontend/README.md
- API documentation: see Backend/API_DOCS.md (if available)

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend logs in terminal
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly

Happy Banking! 🏦
