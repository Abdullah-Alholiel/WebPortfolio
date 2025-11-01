# Upstash Redis Setup Guide

## ✅ Changes Completed

All code has been updated to use **Upstash Redis** instead of Vercel KV:
- ✅ Package changed from `@vercel/kv` to `@upstash/redis`
- ✅ All Redis client initializations updated
- ✅ Environment variables changed to `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- ✅ Migration script updated
- ✅ All API routes updated

## 📋 Next Steps

### Step 1: Install Dependencies
```bash
npm install @upstash/redis
```

### Step 2: Add Upstash Redis to Your Vercel Project

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your project: **web-portfolio-si7b**
3. Go to the **Storage** tab in the left sidebar
4. Click **"Create Database"**
5. In the marketplace, find and select **"Upstash"**
6. Click **"Connect"** to add it to your project
7. You'll be redirected to Upstash
8. Select the **Free** plan (10,000 commands/day - more than enough!)
9. Name your database (e.g., `portfolio-redis`)
10. Create the database

### Step 3: Environment Variables

Vercel will automatically add these to your project:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

**Also make sure you have these env vars set:**
- `ADMIN_EMAIL` = your-email@gmail.com
- `NEXT_PUBLIC_BASE_URL` = https://your-domain.vercel.app (or localhost for dev)
- `RESEND_API_KEY` = (for sending magic link emails - you already have this)

### Step 4: Create `.env.local` for Development

Create `.env.local` in your project root:
```env
# Upstash Redis (added by Vercel when you connect Upstash)
UPSTASH_REDIS_REST_URL=https://your-upstash-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Admin Auth
ADMIN_EMAIL=a.alholaiel@gmail.com
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Email (you already have this)
RESEND_API_KEY=your-resend-key
```

### Step 5: Run Migration (One-Time)

This populates Upstash with your existing portfolio data:
```bash
npx tsx scripts/migrate-data.ts
```

Expected output:
```
✅ Starting data migration to Upstash Redis...
📦 Migrating projects...
  ✓ Migrated 8 projects
💼 Migrating experiences...
  ✓ Migrated 6 experiences
...
✅ Data migration completed successfully!
```

### Step 6: Deploy to Vercel

```bash
git add .
git commit -m "Add admin panel with Upstash Redis"
git push origin main
```

Vercel will automatically deploy. The environment variables from Upstash integration will be available.

### Step 7: Test Admin Panel

1. Visit: `https://your-domain.vercel.app/admin`
2. Enter your admin email
3. Check your email for magic link
4. Click link to login
5. Start editing!

---

## 🎉 What You Can Edit

Once logged in, you can manage:

### 📁 Projects Tab
- Add, edit, delete projects
- Update title, description, tags, image URLs

### 💼 Experience Tab
- Manage work experience entries
- Update titles, locations, descriptions, dates

### 🛠️ Skills Tab
- Edit skill categories
- Add/remove individual skills

### 🏆 Achievements Tab
- Manage certifications
- Update titles, descriptions, certificate URLs

### 👨‍🏫 Mentorship Tab
- Manage mentorship experiences
- Update titles, descriptions, icons, images

### 👤 Personal Info Tab
- Edit CV link
- Update intro text
- Update about text
- Edit contact email, LinkedIn, GitHub URLs

---

## 🔒 Security

- **Magic Link Authentication**: Passwordless login via email
- **24-hour Sessions**: Auto-expiring for security
- **Protected Routes**: Only authenticated admins can access
- **Private Data**: All data stored securely in Upstash

---

## 💡 Free Tier Limits

**Upstash Free Tier:**
- 10,000 commands per day
- More than enough for admin panel usage
- No pausing or cold starts

---

## 🐛 Troubleshooting

**"Redis not configured" error:**
- Make sure `UPSTASH_REDIS_REST_TOKEN` is set in Vercel
- Check that Upstash database is created and connected

**Magic link not working:**
- Verify `RESEND_API_KEY` is set
- Check spam folder for magic link email
- Make sure `ADMIN_EMAIL` matches your email exactly

**Data not loading:**
- Run migration script again if data seems missing
- Check browser console for errors
- Verify all environment variables are set

---

## 🚀 You're Ready!

Your admin panel is now fully integrated with Upstash Redis. Start editing your portfolio content immediately after deployment!

