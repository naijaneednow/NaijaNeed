# NaijaNeed Deployment Guide 🚀

This guide explains how to deploy the **NaijaNeed** ecosystem for production.

## 📦 Tech Stack
- **Frontend**: Next.js (Deployed on **Vercel**)
- **Backend**: Node/Express (Deployed on **Render** or **Heroku**)
- **Database**: PostgreSQL / Auth (Managed by **Supabase**)
- **SMS Gateway**: **Termii**

## 🏗️ 1. Database Setup
1. Use any **PostgreSQL** provider (e.g. Supabase, Neon, AWS RDS).
2. Go to the SQL Editor and run the contents of [database_schema.sql](file:///C:/Users/OmiD/.gemini/antigravity/brain/9aaee75c-19b2-48c7-bdfb-fbe90ab7d712/database_schema.sql).
3. Copy your Database connection details (Host, Port, User, Password, Database Name).

## 🌐 2. Backend Deployment (Render)
1. Create a new "Web Service" on [Render.com](https://render.com).
2. Connect your GitHub repository and point to the `backend` directory.
3. Configure the following **Environment Variables**:
   - `PORT`: 5000
   - `NODE_ENV`: production
   - `DB_HOST`: (Your Host)
   - `DB_PORT`: (Your Port)
   - `DB_USER`: (Your User)
   - `DB_PASSWORD`: (Your Password)
   - `DB_NAME`: (Your Database)
   - `JWT_SECRET`: (A long random string)
   - `FRONTEND_URL`: https://your-app.vercel.app
   - `TERMII_API_KEY`: (Your Termii Key)
   - `TERMII_SENDER_ID`: NaijaNeed
4. Build Command: `npm install && npm run build`
5. Start Command: `npm start`

## 🎨 3. Frontend Deployment (Vercel)
1. High-speed deployment on [Vercel.com](https://vercel.com).
2. Connect your repository and point to the `frontend` directory.
3. Add **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: https://your-backend-url.onrender.com

4. Vercel will automatically detect Next.js and build it.

## 🔒 4. Security Check
- [ ] Ensure `CORS` in the backend points EXACTLY to your Vercel URL.
- [ ] Verify HTTP-only cookies are working for device tokens in production (SSL required).
- [ ] Test the Public Audit page to ensure metrics are visible without Auth.

---
© 2026 NaijaNeed · Civic Impact Platform
