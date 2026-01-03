# API Keys Quick Start - Where to Add Your Keys

**TL;DR:** Create a file named `.env` in the root of your project and paste your API keys there.

---

## Step 1: Get Your Supabase Keys

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Open your project (or create one)
3. Click **Settings** (gear icon) → **API**
4. Copy these two values:

   **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

   **anon / public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## Step 2: Create .env File

In the **root directory** of your project (same level as `package.json`), create a file named `.env`

**Windows:**
```bash
type nul > .env
```

**Mac/Linux:**
```bash
touch .env
```

**Or:** Just create it in your code editor (File → New File → Save as `.env`)

---

## Step 3: Add Your Keys to .env

Open the `.env` file and paste this, replacing with your actual keys:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Gemini API (if you have one)
VITE_GOOGLE_GEMINI_API_KEY=AIzaSy...
```

**Replace:**
- `your-project-ref` with your actual Supabase project URL
- The anon key with your actual anon/public key from Supabase
- The Gemini key with your Google AI Studio API key (if using AI features)

---

## Step 4: Restart Dev Server

**IMPORTANT:** After creating or editing `.env`, you MUST restart your dev server:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

---

## Step 5: Verify It Works

Open browser console (F12) and check:

```javascript
console.log(import.meta.env.VITE_SUPABASE_URL);
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY);
```

You should see your values printed. If you see `undefined`, the .env file wasn't loaded correctly.

---

## File Structure

Your project should look like this:

```
What-They-Might-Mean/
├── .env                    ← Your API keys (CREATE THIS)
├── .env.example            ← Template (already exists)
├── .gitignore              ← Updated to exclude .env
├── package.json
├── App.tsx
├── supabase/
│   ├── schema.sql          ← Run this in Supabase
│   ├── SETUP_GUIDE.md      ← Full setup instructions
│   └── INTEGRATION_GUIDE.md
└── services/
    └── supabaseService.ts  ← Helper functions
```

---

## Where Keys Are Used

### In Your Code

The `supabaseService.ts` file automatically reads these environment variables:

```typescript
// services/supabaseService.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

You don't need to manually pass keys anywhere else. The service handles it.

### In Your App

When you import and use the Supabase service:

```typescript
// App.tsx
import { signIn, signUp, saveAnalysis } from './services/supabaseService';

// Now you can use these functions without passing keys
await signIn(email, password);
await saveAnalysis(userId, analysis);
```

---

## Security Rules

✅ **DO:**
- Keep `.env` file in your `.gitignore`
- Use `VITE_SUPABASE_ANON_KEY` in frontend
- Restart dev server after changing .env
- Use different keys for dev and production

❌ **DON'T:**
- Commit `.env` to Git/GitHub
- Share your `.env` file with anyone
- Use `SUPABASE_SERVICE_ROLE_KEY` in frontend (backend only!)
- Hardcode keys directly in your code

---

## Common Issues

### "Cannot find module" or "undefined"

**Problem:** .env file not loading

**Fix:**
1. Check file is named exactly `.env` (not `.env.txt`)
2. Check it's in the root directory (same level as `package.json`)
3. Restart dev server
4. Check variable names have `VITE_` prefix

### "Invalid API key"

**Problem:** Wrong key or project URL

**Fix:**
1. Go to Supabase Dashboard → Settings → API
2. Copy keys again carefully
3. Make sure you copied the **anon/public** key, not service_role
4. Check there are no extra spaces or line breaks

### ".env is being committed to Git"

**Problem:** .gitignore not set up correctly

**Fix:**
1. Check `.gitignore` includes `.env` (it should now)
2. If already committed, remove it:
   ```bash
   git rm --cached .env
   git commit -m "Remove .env from Git"
   ```
3. Regenerate your keys in Supabase if they were exposed

---

## What's Next?

1. ✅ Create `.env` file with your keys
2. ✅ Restart dev server
3. ✅ Run `supabase/schema.sql` in Supabase SQL Editor
4. ✅ Install Supabase client: `npm install @supabase/supabase-js`
5. 📖 Read `supabase/INTEGRATION_GUIDE.md` for code integration
6. 🧪 Test connection works

---

## Getting Your API Keys

### Supabase Keys

1. **Create Project:** [https://app.supabase.com](https://app.supabase.com)
2. **Get Keys:** Settings → API → Copy URL and anon key

### Google Gemini API Key (for AI features)

1. **Get Key:** [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. **Create Key:** Click "Create API Key"
3. **Copy:** Add to your `.env` as `VITE_GOOGLE_GEMINI_API_KEY`

---

## Support

**Supabase Issues:**
- Docs: [https://supabase.com/docs](https://supabase.com/docs)
- Discord: [https://discord.supabase.com](https://discord.supabase.com)

**App Integration Issues:**
- Check `supabase/SETUP_GUIDE.md`
- Check `supabase/INTEGRATION_GUIDE.md`
- Check browser console for errors (F12)

---

## Example .env File

Copy this template and fill in your real keys:

```env
# ==============================================
# What They Meant - Environment Variables
# ==============================================

# Supabase Configuration
# Get from: https://app.supabase.com/project/_/settings/api
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Google Gemini API
# Get from: https://aistudio.google.com/app/apikey
VITE_GOOGLE_GEMINI_API_KEY=your-google-gemini-api-key-here
```

**Remember:** Replace the example values with your actual keys!

---

That's it! Your API keys are now configured and ready to use.
