# 🏦 Banking System (MERN)

A full-stack banking application built with **Node.js/Express + MongoDB** on the backend and **React + Vite + Tailwind CSS** on the frontend.

This project supports secure authentication, account creation, ledger-based balances, money transfers, admin/system-user operations, and email notifications.

![Digital Banking Hero](./Assets/hero.png)

---

## 📌 Table of Contents

- [Project Overview](#-project-overview)
- [Core Features](#-core-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [How It Works](#-how-it-works)
- [Folder Structure](#-folder-structure)
- [API Endpoints](#-api-endpoints)
- [Environment Variables](#-environment-variables)
- [Getting Started (Local Development)](#-getting-started-local-development)
- [Deployment (Render)](#-deployment-render)
- [Security & Reliability Highlights](#-security--reliability-highlights)
- [Troubleshooting](#-troubleshooting)
- [Available Scripts](#-available-scripts)
- [Future Improvements](#-future-improvements)

---

## 📖 Project Overview

The Banking System provides a modern web interface and secure backend APIs for:

- User registration/login/logout with JWT
- Creating one bank account per user
- Sending money between accounts
- Recording all movements in a **double-entry ledger**
- Viewing account balances and transaction history
- Admin/system-user flows for funding and account control

The backend exposes REST APIs under `/api/*`, while the frontend consumes them through Axios services.

---

## ✨ Core Features

### 👤 Authentication
- Register new users
- Login/logout flow
- JWT-based auth (token in cookie + Authorization header support)
- Token blacklist on logout
- Protected routes (user and admin/system-user variants)

### 🧾 Account Management
- One account per user
- Get current user account (`/accounts/my-account`)
- Balance lookup from ledger (`/accounts/balance/:accountId`)
- Account status support: `ACTIVE`, `FROZEN`, `CLOSED`

### 💸 Transactions
- User-to-user money transfer
- Idempotency key support to prevent duplicate processing
- Atomic transaction processing using MongoDB sessions/transactions
- Transaction history per account
- Admin/system-user transaction history endpoint

### 🛠️ Admin / System User Features
- Add initial funds to accounts (system endpoint)
- View normal users with accounts
- Update user account status (`ACTIVE` / `FROZEN` / `CLOSED`)

### 📧 Email Notifications
- Registration email support
- Sender/receiver transfer notifications

### 🎨 Frontend UX
- Protected dashboard
- Account creation flow
- Balance display + refresh
- Transaction form and system transaction form
- Admin dashboard utilities

---

## 🧰 Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JSON Web Token (`jsonwebtoken`)
- `bcryptjs` for password hashing
- `cookie-parser`
- `cors`
- `nodemailer`

### Frontend
- React 18
- React Router v6
- Axios
- Tailwind CSS
- Vite

---

## 🏗️ System Architecture

- **Frontend** (`Frontend/`) sends requests to backend APIs (default `http://localhost:5000/api`).
- **Backend** (`Backend/`) handles auth, account, and transaction logic.
- **MongoDB** stores users, accounts, ledgers, and transactions.
- **Ledger-first design** derives balances from debit/credit entries instead of storing a mutable balance field.

---

## ⚙️ How It Works

1. **User registers/logs in** and receives JWT token.
2. User creates an account (one per user).
3. For transfers:
   - Request is validated (accounts, amount, status, idempotency key)
   - Balance is computed from sender ledger entries
   - MongoDB transaction creates:
     - `transaction` record
     - sender `DEBIT` ledger entry
     - receiver `CREDIT` ledger entry
   - Transaction is marked `COMPLETED`
4. Optional email notifications are sent to sender/receiver.
5. Dashboard retrieves account details, balances, and history.

---

## 📁 Folder Structure

```text
Banking System/
├── Backend/
│   ├── .env.example
│   ├── package.json
│   ├── render.yaml
│   ├── server.js
│   └── src/
│       ├── app.js
│       ├── config/
│       │   └── database.js
│       ├── controllers/
│       │   ├── account.controller.js
│       │   ├── auth.controller.js
│       │   └── transaction.controller.js
│       ├── Middleware/
│       │   └── auth.middlewire.js
│       ├── Models/
│       │   ├── account.model.js
│       │   ├── blackList.model.js
│       │   ├── ledger.model.js
│       │   ├── transaction.model.js
│       │   └── user.model.js
│       ├── Routes/
│       │   ├── accounts.routes.js
│       │   ├── auth.route.js
│       │   └── transaction.routes.js
│       └── services/
│           └── email.service.js
├── Frontend/
│   ├── .env.example
│   ├── package.json
│   ├── render.yaml
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── api/
│       │   ├── axios.js
│       │   └── services.js
│       ├── components/
│       │   ├── AccountBalance.jsx
│       │   ├── CreateAccount.jsx
│       │   ├── Navbar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── SystemTransactionForm.jsx
│       │   └── TransactionForm.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       └── pages/
│           ├── Dashboard.jsx
│           ├── Home.jsx
│           ├── Login.jsx
│           └── Register.jsx
├── QUICK_START.md
├── TROUBLESHOOTING.md
├── PRODUCTION_CHANGES.md
└── RENDER_DEPLOYMENT.md
```

---

## 🔌 API Endpoints

### Auth
- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login user
- `POST /api/auth/logout` — Logout user (blacklist token)

### Accounts
- `POST /api/accounts` — Create account (auth required)
- `GET /api/accounts/my-account` — Current user account
- `GET /api/accounts/balance/:accountId` — Get account balance
- `GET /api/accounts/system/normal-users` — Admin: list normal users
- `PATCH /api/accounts/system/status/:accountId` — Admin: update account status

### Transactions
- `POST /api/transactions` — Create user transfer
- `GET /api/transactions/account/:accountId` — Account transactions
- `POST /api/transactions/system/initial-funds` — Admin/system initial funding
- `GET /api/transactions/system/admin-transactions` — Admin/system transaction list

### Utility
- `GET /health` — Service health check

---

## 🔐 Environment Variables

Create a `.env` file in `Backend/`.

Example (`Backend/.env.example`):

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
EMAIL_USER=your_email@gmail.com
CLIENT_ID=your_google_client_id
CLIENT_SECRET=your_google_client_secret
REFRESH_TOKEN=your_google_refresh_token
NODE_ENV=development
```

For frontend, set `Frontend/.env` (optional for local):

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🚀 Getting Started (Local Development)

### 1) Clone repository

```bash
git clone <your-repo-url>
cd "Banking System"
```

### 2) Start Backend

```bash
cd Backend
npm install
# create .env file (see section above)
npm start
```

Backend runs on: `http://localhost:5000`

### 3) Start Frontend

Open a new terminal:

```bash
cd Frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:3000`

---

## ☁️ Deployment (Render)

The project includes `render.yaml` files and deployment notes.

Recommended docs:
- `RENDER_DEPLOYMENT.md`
- `PRODUCTION_CHANGES.md`

Typical order:
1. Deploy backend web service
2. Set backend environment variables
3. Deploy frontend static site
4. Set `VITE_API_BASE_URL` to deployed backend `/api` URL

---

## 🛡️ Security & Reliability Highlights

- Password hashing with `bcryptjs`
- JWT-based authentication
- Token blacklisting on logout
- Route protection middleware
- Configurable CORS allow-list
- Global error handling and 404 middleware
- Health check endpoint for monitoring
- Graceful shutdown handlers (`SIGTERM`, `SIGINT`)
- MongoDB transactions for transfer atomicity

---

## 🧪 Troubleshooting

If you face login/API issues:

- Confirm backend is running on port `5000`
- Confirm frontend API base URL is correct
- Hard refresh browser (`Ctrl + Shift + R`)
- Check browser Console + Network tab
- Verify MongoDB connection and `.env` values

Detailed guide: `TROUBLESHOOTING.md`

---

## 📜 Available Scripts

### Backend (`Backend/package.json`)
- `npm run dev` — Start with nodemon
- `npm start` — Start production server (`node server.js`)
- `npm run build` — Placeholder build command

### Frontend (`Frontend/package.json`)
- `npm run dev` — Start Vite dev server
- `npm run build` — Build production bundle
- `npm run preview` — Preview production build

---

## 🔮 Future Improvements

- Add automated tests (unit/integration/e2e)
- Add role management beyond system user flag
- Add pagination/filtering for transaction history
- Add rate limiting and audit logging
- Add API documentation with Swagger/OpenAPI

---

## 📄 License

No explicit license is currently defined in the root project. Add a `LICENSE` file if you want to open-source the repository under a specific license.

---

If this repo helps you, consider adding a ⭐ on GitHub.
