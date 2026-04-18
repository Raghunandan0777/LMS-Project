# 🚀 EduFlow Backend-Frontend Production Deployment Guide

## **EASY 3-STEP CONNECTION**

### **STEP 1: Backend Setup (Render/Railway/Heroku)**

1. Deploy your backend to Render/Railway/Vercel
2. Copy your backend URL (e.g., `https://lms-backend.onrender.com`)
3. Set environment variables on your hosting platform:

```
PORT=5000
NODE_ENV=production
MONGO_URI=<your_mongodb_url>
JWT_SECRET=<generate_strong_key>
CLIENT_URL=https://your-frontend-domain.com
CLOUDINARY_CLOUD_NAME=<your_key>
CLOUDINARY_API_KEY=<your_key>
CLOUDINARY_API_SECRET=<your_secret>
```

### **STEP 2: Frontend Setup (Vercel/Netlify/GitHub Pages)**

1. In your frontend repository, create `.env.production`:

```env
REACT_APP_API_URL=https://lms-backend.onrender.com/api
```

2. Or set as environment variable in your hosting platform

3. Deploy frontend

### **STEP 3: Verify Connection**

After deployment, check the browser console:

- Open DevTools → Network tab
- Click any API request
- Should see requests going to: `https://lms-backend.onrender.com/api/...`

---

## **🔧 LOCAL DEVELOPMENT SETUP**

### **Terminal 1: Start Backend**

```bash
cd backend
npm install
npm start
# Should show: ✓ Server running on port 5000
```

### **Terminal 2: Start Frontend**

```bash
cd frontend
npm install
# Create .env.local
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env.local
npm start
# Opens on http://localhost:3000
```

---

## **📋 PRODUCTION URLS REFERENCE**

| Service         | Local Dev                 | Production Example                   |
| --------------- | ------------------------- | ------------------------------------ |
| **Backend API** | http://localhost:5000/api | https://lms-backend.onrender.com/api |
| **Frontend**    | http://localhost:3000     | https://your-app.vercel.app          |
| **CORS Origin** | http://localhost:3000     | https://your-app.vercel.app          |

---

## **🔐 Security Checklist**

- ✅ Never commit `.env` file to GitHub
- ✅ Add `.env` to `.gitignore`
- ✅ Use strong JWT_SECRET (min 32 chars)
- ✅ Set `NODE_ENV=production` in production
- ✅ Use HTTPS URLs in production
- ✅ Set exact CLIENT_URL (not wildcard)
- ✅ Use API Keys from environment variables only

---

## **🐛 Troubleshooting**

### **"CORS Error" on frontend?**

```
❌ Error: Access to XMLHttpRequest blocked by CORS
```

**Fix:** Backend CORS must include your frontend URL

```javascript
// In server.js
CLIENT_URL=https://your-frontend-domain.com
```

### **"Admin-Service Unavailable" in browser?**

```
❌ Network Error 503
```

**Fix:** Backend is not running or URL is wrong

- Check `REACT_APP_API_URL` in frontend
- Verify backend is deployed and running
- Check backend API responds: `https://your-backend.com/`

### **"Unauthorized 401"?**

```
❌ 401 Unauthorized on API calls
```

**Fix:** JWT token issue

- Clear localStorage: DevTools → Application → Storage → Clear All
- Login again to get new token
- Check JWT_SECRET is same in backend env

---

## **📦 Environment Variables Quick Copy**

### Frontend `.env.production`:

```
REACT_APP_API_URL=https://your-backend-url.com/api
```

### Backend Production Variables (Set in hosting dashboard):

```
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/?appName=Cluster0
JWT_SECRET=your-32-char-random-secret-key-here
CLIENT_URL=https://your-frontend-domain.com
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

---

## **🎯 Quick Deploy Steps**

### Deploy to Render:

1. Push code to GitHub
2. Connect GitHub repo to Render
3. Set environment variables
4. Deploy

### Deploy Frontend to Vercel:

1. Push code to GitHub
2. Import project in Vercel
3. Add `REACT_APP_API_URL` env var
4. Deploy

Done! 🎉
