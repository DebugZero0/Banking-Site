# SecureBank Frontend

A modern, responsive React-based frontend for the Banking System.

## Features

- **User Authentication**
  - Register new account
  - Login / Logout
  - JWT token-based authentication
  - Protected routes

- **Account Management**
  - Create bank account
  - View account balance
  - Real-time balance updates

- **Transactions**
  - Send money to other accounts
  - Transaction history tracking
  - Idempotency key for safe transactions
  - Real-time transaction status

## Tech Stack

- **React 18** - UI Library
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Backend server running on http://localhost:5000

### Installation

1. Navigate to the Frontend directory:
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

The application will be available at http://localhost:3000

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

## Project Structure

```
Frontend/
├── src/
│   ├── api/                  # API configuration and services
│   │   ├── axios.js          # Axios instance with interceptors
│   │   └── services.js       # API service functions
│   ├── components/           # Reusable components
│   │   ├── AccountBalance.jsx
│   │   ├── CreateAccount.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── TransactionForm.jsx
│   ├── context/              # React Context
│   │   └── AuthContext.jsx   # Authentication context
│   ├── pages/                # Page components
│   │   ├── Dashboard.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── App.jsx               # Main App component
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## API Integration

The frontend connects to the backend API at `http://localhost:5000/api` with the following endpoints:

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /accounts` - Create bank account
- `GET /accounts/balance/:accountId` - Get account balance
- `POST /transactions` - Create transaction

## Features Overview

### Authentication Flow
1. Users can register with name, email, and password
2. Login receives a JWT token stored in localStorage
3. Token is automatically sent with all API requests
4. Protected routes redirect to login if not authenticated

### Dashboard
- Displays account balance
- Shows account status and information
- Transaction form for sending money
- Real-time balance refresh

### Transactions
- Enter recipient account ID
- Specify amount to send
- Automatic idempotency key generation
- Transaction confirmation and error handling

## Environment Configuration

The API base URL can be configured in `src/api/axios.js`:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

## Security Features

- JWT token authentication
- Automatic token refresh
- Protected routes
- Secure password handling
- HTTPS ready

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.
