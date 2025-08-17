# 🚀 Complete Setup Guide - Authentication System

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- Your MongoDB connection string

## 🔧 Backend Setup

### 1. **Navigate to Server Directory**
```bash
cd server
```

### 2. **Create Environment File**
Create a `.env` file in the server directory:

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
```

**Important**: Replace `YOUR_ACTUAL_PASSWORD` with your actual MongoDB password!

### 3. **Install Dependencies**
```bash
npm install
```

### 4. **Start Backend Server**
```bash
npm run dev
```

You should see:
```
🚀 Server is running on port 5000
🌐 Server URL: http://localhost:5000
✅ Connected to MongoDB successfully!
📊 Database: complaint-management
```

## ✉️ Email Notification Setup

This system sends email notifications to all admin users when a new complaint is submitted, and notifies users when their complaint is resolved by an admin.

### 1. Configure SMTP Credentials

Set up email credentials in your `.env` file (in the `server` directory). For Gmail, use an **App Password** (recommended for security):

```
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

**Important:**
- Do **not** use your regular Gmail password. Use a Gmail App Password ([Google App Passwords Guide](https://support.google.com/accounts/answer/185833?hl=en)).
- For other providers, update the SMTP settings in `server/controllers/complaintController.js`.

### 2. How It Works
- When a user submits a complaint, all admins receive an email notification.
- When an admin marks a complaint as resolved, the user receives an email notification.

### 3. Custom SMTP Providers
To use another email service (e.g., Outlook, SendGrid), update the transporter configuration in `server/controllers/complaintController.js`:

```
const transporter = nodemailer.createTransport({
  host: 'smtp.yourprovider.com',
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

Refer to your provider's documentation for correct SMTP settings.


## 🖼️ Setup Screenshots

Below are screenshots to help you visualize the setup and running system:

### Image 1
![Image 1](../public/Screenshot%20(795).png)

### Image 2
![Image 2](../public/Screenshot%20(796).png)

### Image 3
![Image 3](../public/Screenshot%20(797).png)

### Image 4
![Image 4](../public/Screenshot%20(798).png)

### Image 5
![Image 5](../public/Screenshot%20(799).png)

### Image 6
![Image 6](../public/Screenshot%20(800).png)

---
This guide will help you set up and test the complete authentication system with role-based access control.

## 🌐 Frontend Setup

### 1. **Navigate to Root Directory**
```bash
cd ..
```

### 2. **Install Frontend Dependencies**
```bash
npm install
```

### 3. **Start Frontend Development Server**
```bash
npm run dev
```

You should see:
```
- ready started server on 0.0.0.0:3000
```

## 🧪 Testing the System

### **Step 1: Test Backend Connection**
Visit: `http://localhost:5000/health`

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🎯 User Roles & Access

### **Regular User (`user`)**
- ✅ Register and login
- ✅ Submit complaints
- ✅ View own complaints
- ✅ Update profile
- ✅ Change password

### **Administrator (`admin`)**
- ✅ All regular user permissions
- ✅ View all complaints
- ✅ Manage complaint status
- ✅ Create new admin users
- ✅ View all users
- ✅ Change user roles
