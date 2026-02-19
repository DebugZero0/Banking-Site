# Render Deployment Guide

## Prerequisites
- Render account (render.com)
- GitHub repository with the Banking System code
- MongoDB Atlas database (free tier available)

## Backend Deployment Steps

### 1. Prepare Backend on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the Banking System repository

### 2. Configure Backend Service

**Service Details:**
- Name: `banking-backend`
- Runtime: `Node`
- Build Command: `npm install`
- Start Command: `npm start`
- Region: Choose closest to your users

### 3. Add Environment Variables to Backend

In Render dashboard, go to your service → Environment:

```
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/banking
JWT_SECRET=your_strong_jwt_secret_here
CORS_ORIGINS=http://localhost:3000,https://your-frontend-domain.onrender.com
EMAIL_USER=your_email@gmail.com
CLIENT_ID=your_google_client_id
CLIENT_SECRET=your_google_client_secret
REFRESH_TOKEN=your_google_refresh_token
```

**Note:** Replace placeholders with actual values

### 4. Deploy Backend

1. Click "Deploy Service"
2. Wait for deployment to complete (5-10 minutes)
3. Note the backend URL (e.g., `https://banking-backend.onrender.com`)

## Frontend Deployment Steps

### 1. Create Frontend Service

1. In Render dashboard, click "New +" → "Static Site"
2. Connect the same GitHub repository
3. Select the repository

### 2. Configure Frontend Service

**Service Details:**
- Name: `banking-frontend`
- Publish directory: `Frontend/dist`
- Build Command: `cd Frontend && npm install && npm run build`
- Region: Same as backend

### 3. Add Environment Variables to Frontend

In Render dashboard, go to your service → Environment:

```
VITE_API_BASE_URL=https://banking-backend.onrender.com/api
```

Replace with your actual backend URL from Step 4 above.

### 4. Deploy Frontend

1. Click "Deploy"
2. Wait for deployment (3-5 minutes)
3. Your app will be live at the provided URL

## Production Checklist

- [ ] All sensitive data removed from code
- [ ] Environment variables configured on Render
- [ ] Backend URL updated in Frontend
- [ ] CORS_ORIGINS updated with production domain
- [ ] MongoDB connection verified
- [ ] JWT_SECRET is strong (30+ characters, random)
- [ ] Email service credentials are correct
- [ ] Database backups enabled in MongoDB Atlas

## Testing After Deployment

1. Visit the frontend URL
2. Register a new account
3. Login with credentials
4. Create a bank account
5. Test transaction functionality

## Troubleshooting

**Backend not connecting to MongoDB:**
- Check MONGO_URI in environment variables
- Ensure MongoDB IP whitelist includes Render IPs (0.0.0.0/0 for development)

**CORS errors:**
- Verify CORS_ORIGINS includes your frontend domain
- Ensure credentials: true is set in backend

**Frontend can't reach API:**
- Check VITE_API_BASE_URL is correct
- Verify backend is running (check logs)

## Local Development

To test locally before deploying:

```bash
# Backend
cd Backend
npm install
NODE_ENV=development npm run dev

# Frontend (in new terminal)
cd Frontend
npm install
npm run dev
```

Then visit `http://localhost:3000`

## Logs

View deployment logs in Render:
- Backend: Dashboard → Service → Logs
- Frontend: Dashboard → Service → Build Logs
