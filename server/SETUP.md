# Quick Setup Guide

## 1. Create .env file

Create a file named `.env` in the server directory with this content:

```bash
# MongoDB Connection
MONGODB_URI=mongodb+srv://abhinavDB:YOUR_ACTUAL_PASSWORD@cluster0.e6u3u.mongodb.net/complaint-management?retryWrites=true&w=majority&appName=Cluster0

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRES_IN=90d

# Server Configuration
PORT=5000
CORS_ORIGIN=*
NODE_ENV=development

# Email Configuration
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=YOUR_PASSWORD
```

**Replace `YOUR_ACTUAL_PASSWORD` with your real MongoDB password**

## 2. Install dependencies

```bash
npm install
```

## 3. Start the server

```bash
npm run dev
```

## 4. Test the connection

Visit: http://localhost:5000/health

You should see the database status as "connected" if everything is working correctly.
