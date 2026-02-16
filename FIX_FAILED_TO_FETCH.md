# Fix "Failed to Fetch" Error

## Problem
When signing up, you see: **"Failed to fetch"** or **"Cannot connect to server"**

## Root Causes (in order of likelihood)

### ❌ Issue 1: Backend Server NOT Running (Most Common!)

**Check:** Open your backend terminal. Do you see this message?
```
MongoDB Connected: cluster0.keeclhg.mongodb.net
Server running on port 5000
```

**If you see an error or the message is missing:**

#### Fix:
1. Open PowerShell and navigate to backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies (if not done):
   ```bash
   npm install
   ```

3. Start the backend:
   ```bash
   npm run dev
   ```

4. Wait for this message:
   ```
   MongoDB Connected: cluster0.keeclhg.mongodb.net
   Server running on port 5000
   ```

5. **Keep this terminal open!** ✅

---

### ❌ Issue 2: Port 5000 Already in Use

**Check:** If you see error:
```
listen EADDRINUSE: address already in use :::5000
```

#### Fix Option A: Kill the process on port 5000
```bash
# Windows PowerShell (as Administrator)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force

# Or just restart your computer
```

#### Fix Option B: Use a different port
1. Edit `backend/.env`:
   ```
   PORT=5001
   ```

2. Edit `frontend/.env`:
   ```
   VITE_API_URL=http://localhost:5001/api
   ```

3. Restart backend: `npm run dev`
4. Restart frontend: `npm run dev`

---

### ❌ Issue 3: Frontend Running on Wrong URL

**Check:** Look at your browser address bar. Should be:
```
http://localhost:5173
```

If it says something else (like `http://localhost:3000`), that's the problem!

#### Fix:
1. Stop your frontend (Ctrl+C in the terminal)
2. Start it again:
   ```bash
   npm run dev
   ```

3. Copy the exact URL from the terminal output
4. Paste it in your browser

---

### ❌ Issue 4: Frontend Not Finding .env File

**Check:** Open browser console (F12 → Console tab). Do you see:
```
API Error: Cannot connect to server...
```

#### Fix:
1. Stop frontend: `Ctrl+C`
2. Stop backend: `Ctrl+C`
3. Delete `node_modules` and reinstall:
   ```bash
   rm -r node_modules    # Mac/Linux
   rmdir /s node_modules # Windows
   npm install
   npm run dev
   ```

---

### ❌ Issue 5: MongoDB Connection Issue

**Check:** Does your backend show:
```
Error connecting to MongoDB
```

#### Fix:
1. Open `backend/.env`
2. Verify this line:
   ```
   MONGODB_URI=mongodb+srv://madhaneswaran2006_db_user:Madhan123@cluster0.keeclhg.mongodb.net/Academic_learning
   ```

3. If incorrect, go to MongoDB Atlas > Databases > Connect > Copy the correct URI

4. Restart backend: `npm run dev`

---

## Checklist to Fix "Failed to Fetch"

Follow this exact order:

```
□ 1. Open backend terminal
□ 2. Navigate to backend folder: cd backend
□ 3. Run: npm run dev
□ 4. Wait for "Server running on port 5000" message
□ 5. Keep that terminal open
□ 6. Open another terminal at project root
□ 7. Run: npm run dev
□ 8. Wait for localhost URL (usually http://localhost:5173)
□ 9. Open that URL in browser
□ 10. Try sign-up again
□ 11. Check browser Console (F12) for detailed errors
```

---

## How to Check Browser Console for Errors

1. **Open Frontend in Browser:** http://localhost:5173
2. **Press F12** to open Developer Tools
3. **Click "Console" tab**
4. **Try to sign up**
5. **Look for messages like:**
   - ✅ "Register request to: http://localhost:5000/api/auth/register" = Good!
   - ❌ "Cannot connect to server" = Backend not running
   - ❌ "Network error: 404" = Wrong URL or endpoint

---

## Windows PowerShell Commands Reference

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Start backend (development mode with auto-reload)
npm run dev

# Stop a running process
Ctrl + C

# Open another terminal (keep one for backend, one for frontend)
# Click the + button in the terminal tab or press Ctrl+Shift+`

# Check if port 5000 is in use
netstat -ano | findstr :5000
```

---

## Expected Terminal Outputs

### Backend Terminal (Should show):
```
MongoDB Connected: cluster0.keeclhg.mongodb.net
Server running on port 5000
```

### Frontend Terminal (Should show):
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Press h to show help
```

---

## Quick Test Steps

After both servers are running:

### Test 1: Backend is responsive
Open this in browser: http://localhost:5000
Should show:
```json
{
  "message": "Academic Learning Sustainability Platform API",
  "version": "1.0.0",
  "status": "Running"
}
```

### Test 2: Can connect from frontend
In browser console (F12):
```javascript
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'test@test.com', 
    password: 'test123', 
    role: 'student' 
  })
})
.then(r => r.json())
.then(data => console.log(data))
```

---

## Still Getting Error?

1. **Take a screenshot** of your terminal showing the error
2. **Check if MongoDB is down:**
   - Go to https://cloud.mongodb.com
   - Check your cluster status
3. **Check backend logs** - Look for error messages in backend terminal
4. **Check browser console** - Right-click → Inspect → Console tab

---

## Summary

| Error | Cause | Fix |
|-------|-------|-----|
| "Failed to fetch" | Backend not running | Run `npm run dev` in backend folder |
| "EADDRINUSE" | Port 5000 in use | Change PORT in .env to 5001 |
| "Cannot connect" | Wrong API URL | Check VITE_API_URL in .env |
| MongoDB error | DB connection failed | Check MONGODB_URI in backend/.env |

---

**Most Common Fix: Just make sure backend is running! 🚀**
