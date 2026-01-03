# Supabase Setup Guide for What They Meant

This guide walks you through setting up Supabase as the backend for the What They Meant app.

---

## Table of Contents
1. [Create Supabase Project](#1-create-supabase-project)
2. [Run Database Schema](#2-run-database-schema)
3. [Configure Authentication](#3-configure-authentication)
4. [Get API Keys](#4-get-api-keys)
5. [Install Dependencies](#5-install-dependencies)
6. [Configure Environment Variables](#6-configure-environment-variables)
7. [Test Connection](#7-test-connection)
8. [Optional: Storage Setup](#8-optional-storage-setup)

---

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"New Project"**
3. Sign in with GitHub or email
4. Create a new organization (if you don't have one)
5. Click **"New Project"**
6. Fill in project details:
   - **Name**: `what-they-meant` (or your preferred name)
   - **Database Password**: Generate a strong password and **SAVE IT**
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development
7. Click **"Create new project"**
8. Wait 2-3 minutes for project to be provisioned

---

## 2. Run Database Schema

1. In your Supabase project dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file `supabase/schema.sql` in this repository
4. Copy the entire contents
5. Paste into the Supabase SQL Editor
6. Click **"Run"** (or press Ctrl/Cmd + Enter)
7. You should see: `Success. No rows returned`

**What this does:**
- Creates tables for profiles, settings, analyses, custom library items, and queued analyses
- Sets up Row Level Security (RLS) policies for data privacy
- Creates triggers for automatic profile creation on signup
- Creates indexes for faster queries

**Verify setup:**
- Click **"Table Editor"** in the left sidebar
- You should see tables: `profiles`, `user_settings`, `analyses`, `custom_library_items`, `queued_analyses`

---

## 3. Configure Authentication

### Enable Email Authentication

1. Go to **Authentication** → **Providers** in the left sidebar
2. Find **"Email"** provider
3. Toggle it **ON**
4. Configure settings:
   - ✅ **Enable Email provider**
   - ✅ **Confirm email** (recommended for production)
   - Email Templates: Customize welcome/reset emails if desired
5. Click **"Save"**

### (Optional) Enable Social Authentication

**Google OAuth:**
1. Go to **Authentication** → **Providers**
2. Find **"Google"** and toggle **ON**
3. Follow instructions to create Google OAuth credentials
4. Enter **Client ID** and **Client Secret**
5. Add authorized redirect URL: `https://<your-project-ref>.supabase.co/auth/v1/callback`
6. Click **"Save"**

**GitHub OAuth:**
1. Go to **Authentication** → **Providers**
2. Find **"GitHub"** and toggle **ON**
3. Go to GitHub Settings → Developer Settings → OAuth Apps
4. Create new OAuth App
5. Enter callback URL: `https://<your-project-ref>.supabase.co/auth/v1/callback`
6. Copy **Client ID** and **Client Secret** to Supabase
7. Click **"Save"**

**Apple, Facebook, etc.:**
- Similar process - follow Supabase's inline instructions for each provider

---

## 4. Get API Keys

1. Go to **Settings** → **API** in the left sidebar
2. You'll see two important values:

### **Project URL**
```
https://your-project-ref.supabase.co
```
- Copy this value
- This is your `VITE_SUPABASE_URL`

### **API Keys**

**anon / public key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- This is safe to use in your frontend
- Copy this value
- This is your `VITE_SUPABASE_ANON_KEY`

**service_role key (SECRET):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- ⚠️ **NEVER expose this in frontend code**
- Only use in backend/server environments
- Has full admin access to your database
- This is your `SUPABASE_SERVICE_ROLE_KEY` (only if you build a backend)

---

## 5. Install Dependencies

Install the Supabase JavaScript client library:

```bash
npm install @supabase/supabase-js
```

This library handles:
- Authentication (signup, login, logout, password reset)
- Database queries with TypeScript support
- Real-time subscriptions
- File storage
- Row Level Security automatically applied

---

## 6. Configure Environment Variables

### Create `.env` file

Create a file named `.env` in the root of your project:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Google Gemini API (for AI features)
VITE_GOOGLE_GEMINI_API_KEY=your-existing-gemini-key
```

### Replace placeholders:

1. Replace `your-project-ref` with your actual project reference from step 4
2. Replace `your-anon-key-here` with your anon key from step 4
3. Keep your existing Google Gemini API key

### Add `.env` to `.gitignore`

**CRITICAL:** Make sure `.env` is in your `.gitignore` file:

```gitignore
# Environment variables
.env
.env.local
.env.production
```

**Why:** API keys should NEVER be committed to Git or GitHub!

---

## 7. Test Connection

### Test in Browser Console

1. Start your dev server: `npm run dev`
2. Open browser to `http://localhost:3000`
3. Open browser console (F12)
4. Run this test:

```javascript
// Test Supabase connection
const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Test query
const { data, error } = await supabase.from('profiles').select('*');
console.log('Data:', data);
console.log('Error:', error);
```

**Expected result:**
- `Data: []` (empty array - no profiles yet)
- `Error: null`

If you see an error, check:
- Environment variables are correct
- .env file is in the root directory
- You restarted the dev server after creating .env
- RLS policies are set up correctly

---

## 8. Optional: Storage Setup

If you want to store large files (PDFs, images) in Supabase Storage instead of base64 in the database:

### Create Storage Bucket

1. Go to **Storage** in the left sidebar
2. Click **"New bucket"**
3. Name: `library-files`
4. Set as **Public** if you want files to be accessible without auth
5. Click **"Create bucket"**

### Set Storage Policies

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Users can upload own files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'library-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to read their own files
CREATE POLICY "Users can read own files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'library-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'library-files' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### Upload Files in Code

```typescript
// Upload file
const { data, error } = await supabase.storage
  .from('library-files')
  .upload(`${userId}/filename.pdf`, file);

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('library-files')
  .getPublicUrl(`${userId}/filename.pdf`);
```

---

## Database Schema Overview

### Tables Created

1. **profiles** - User profile information
   - Automatically created on signup
   - Extends auth.users with custom fields

2. **user_settings** - User preferences
   - Font, text size, voice settings
   - Analysis preferences
   - Subscription tier

3. **analyses** - Analysis history
   - All message analyses
   - Clarity scores, responses, hidden rules
   - Replaces localStorage history

4. **custom_library_items** - User's custom resources
   - URLs and uploaded files
   - Icons and categorization
   - Replaces localStorage library

5. **queued_analyses** - Offline queue
   - Analyses to process when back online
   - Includes image/audio data

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring:
- Users can only see their own data
- Users can only modify their own data
- No user can see another user's data
- Even with the anon key, data is protected

---

## Next Steps

1. ✅ Run the database schema in Supabase SQL Editor
2. ✅ Configure authentication providers
3. ✅ Get API keys from Settings → API
4. ✅ Install `@supabase/supabase-js` via npm
5. ✅ Create `.env` file with your keys
6. ✅ Add `.env` to `.gitignore`
7. ✅ Test connection in browser console
8. 📝 Update your app code to use Supabase (see main documentation)

---

## Troubleshooting

### "relation does not exist" error
- Schema wasn't run successfully
- Re-run the schema.sql file in SQL Editor

### "JWT expired" or "Invalid JWT" error
- Check that your anon key is correct
- Make sure you're using VITE_ prefix for environment variables

### "row level security policy violation" error
- User is not authenticated
- RLS policies are working correctly (this is good!)
- Implement authentication before querying data

### Environment variables not loading
- Restart dev server after creating/updating .env
- Check file is named exactly `.env` not `.env.txt`
- Make sure VITE_ prefix is used for Vite to expose them

### Can't connect to Supabase
- Check project URL is correct
- Check internet connection
- Verify project is not paused (free tier pauses after inactivity)

---

## Security Best Practices

1. ✅ **Never commit `.env` to Git**
2. ✅ **Use anon key in frontend only** - RLS protects your data
3. ✅ **Never expose service_role key** - only use in backend
4. ✅ **Keep RLS policies enabled** - don't disable them
5. ✅ **Use HTTPS in production** - Capacitor does this automatically
6. ✅ **Validate user input** - never trust frontend data
7. ✅ **Implement rate limiting** - prevent abuse
8. ✅ **Monitor Supabase logs** - check for suspicious activity

---

## Support

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- GitHub Issues: https://github.com/supabase/supabase/issues
