# Supabase Integration Guide

This guide shows you how to integrate Supabase authentication and database sync into the existing What They Meant app.

---

## Overview

The app currently uses **localStorage** for all data persistence. This integration adds:
- ✅ User authentication (email/password and OAuth)
- ✅ Cloud database sync (Supabase PostgreSQL)
- ✅ Cross-device synchronization
- ✅ Offline-first with automatic sync when online
- ✅ Row Level Security for data privacy

**Important:** localStorage will remain as a fallback for offline use and for users who don't create accounts.

---

## Prerequisites

Before starting integration:

1. ✅ Complete Supabase setup from `supabase/SETUP_GUIDE.md`
2. ✅ Run `supabase/schema.sql` in your Supabase project
3. ✅ Install dependencies: `npm install @supabase/supabase-js`
4. ✅ Create `.env` file with your Supabase keys
5. ✅ Verify `.env` is in `.gitignore`

---

## Integration Steps

### 1. Import Supabase Service in App.tsx

At the top of `App.tsx`, add the import:

```typescript
// Add this with other imports
import {
  supabase,
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  onAuthStateChange,
  getUserSettings,
  updateUserSettings,
  saveAnalysis,
  getUserAnalyses,
  deleteAnalysis,
  getCustomLibraryItems,
  addCustomLibraryItem,
  deleteCustomLibraryItem,
  isSupabaseAvailable,
} from './services/supabaseService';
```

**File location:** `App.tsx:1` (top of file with other imports)

---

### 2. Add Authentication State

Add user authentication state to track logged-in user:

```typescript
// Add after other useState declarations (around line 142)
const [currentUser, setCurrentUser] = useState<any>(null);
const [isAuthInitialized, setIsAuthInitialized] = useState(false);
```

**File location:** `App.tsx:142` (in state declarations section)

---

### 3. Initialize Auth and Sync on Mount

Add a useEffect to initialize authentication and sync data from Supabase:

```typescript
// Add after existing useEffects (around line 199)
useEffect(() => {
  // Only run if Supabase is available
  if (!isSupabaseAvailable()) {
    setIsAuthInitialized(true);
    return;
  }

  // Initialize auth state
  const initAuth = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
    setIsAuthInitialized(true);

    // If user is logged in, sync data from Supabase
    if (user) {
      await syncFromSupabase(user.id);
    }
  };

  initAuth();

  // Listen for auth state changes
  const unsubscribe = onAuthStateChange((user) => {
    setCurrentUser(user);
    if (user) {
      syncFromSupabase(user.id);
    } else {
      // User logged out - fall back to localStorage
      console.log('User logged out, using localStorage');
    }
  });

  return () => unsubscribe();
}, []);
```

**File location:** `App.tsx:199` (after existing useEffect hooks)

---

### 4. Add Sync Functions

Add helper functions to sync data between localStorage and Supabase:

```typescript
// Add before render (around line 230)

// Sync data FROM Supabase TO local state
const syncFromSupabase = async (userId: string) => {
  try {
    // Sync settings
    const dbSettings = await getUserSettings(userId);
    if (dbSettings) {
      setSettings(prev => ({ ...prev, ...dbSettings }));
    }

    // Sync history
    const dbAnalyses = await getUserAnalyses(userId, 100);
    if (dbAnalyses.length > 0) {
      setHistory(dbAnalyses);
    }

    // Sync custom library
    const dbLibrary = await getCustomLibraryItems(userId);
    if (dbLibrary.length > 0) {
      setCustomLibraryItems(dbLibrary);
    }

    console.log('✅ Data synced from Supabase');
  } catch (error) {
    console.error('❌ Error syncing from Supabase:', error);
  }
};

// Sync data TO Supabase FROM local state
const syncToSupabase = async () => {
  if (!currentUser) return;

  try {
    // Sync settings to Supabase
    await updateUserSettings(currentUser.id, settings);

    // Sync history to Supabase (only new items)
    for (const analysis of history) {
      await saveAnalysis(currentUser.id, analysis);
    }

    // Sync custom library (handled per-item on add/delete)

    console.log('✅ Data synced to Supabase');
  } catch (error) {
    console.error('❌ Error syncing to Supabase:', error);
  }
};
```

**File location:** `App.tsx:230` (before the render/JSX section)

---

### 5. Update Settings to Sync to Supabase

Modify the settings useEffect to also sync to Supabase:

```typescript
// Update existing useEffect for settings (around line 201)
useEffect(() => {
  localStorage.setItem('wtm_settings', JSON.stringify(settings));

  // Also sync to Supabase if user is logged in
  if (currentUser && isAuthInitialized) {
    updateUserSettings(currentUser.id, settings).catch(err => {
      console.error('Failed to sync settings to Supabase:', err);
    });
  }
}, [settings, currentUser, isAuthInitialized]);
```

**File location:** `App.tsx:201` (update existing useEffect)

---

### 6. Update History Save to Sync to Supabase

When saving a new analysis, also save to Supabase:

```typescript
// Update in handleSubmitAnalysis function (around line 450)
// After adding to history state, add:
if (currentUser) {
  saveAnalysis(currentUser.id, newAnalysis).catch(err => {
    console.error('Failed to save analysis to Supabase:', err);
    showToast('Analysis saved locally only', 'info');
  });
}
```

**File location:** `App.tsx:450` (in handleSubmitAnalysis function)

---

### 7. Update Custom Library to Sync to Supabase

Update library item handlers:

```typescript
// Update handleAddLibraryItem (around line 530)
const handleAddLibraryItem = async (item: Omit<CustomLibraryItem, 'id' | 'createdAt'>) => {
  const newItem: CustomLibraryItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };

  setCustomLibraryItems(prev => [...prev, newItem]);

  // Save to Supabase if user is logged in
  if (currentUser) {
    try {
      await addCustomLibraryItem(currentUser.id, item);
      showToast('Resource added to library', 'success');
    } catch (error) {
      console.error('Failed to save library item to Supabase:', error);
      showToast('Saved locally only', 'info');
    }
  } else {
    showToast('Resource added to library', 'success');
  }
};

// Update handleDeleteLibraryItem (around line 550)
const handleDeleteLibraryItem = async (id: string) => {
  setCustomLibraryItems(prev => prev.filter(item => item.id !== id));

  // Delete from Supabase if user is logged in
  if (currentUser) {
    try {
      await deleteCustomLibraryItem(currentUser.id, id);
      showToast('Resource removed', 'success');
    } catch (error) {
      console.error('Failed to delete library item from Supabase:', error);
      showToast('Removed locally only', 'info');
    }
  } else {
    showToast('Resource removed', 'success');
  }
};
```

**File location:** `App.tsx:530 and App.tsx:550` (update existing functions)

---

### 8. Add Authentication UI

You have two options for adding authentication:

#### Option A: Simple Modal (Recommended for MVP)

Add a basic auth modal to the settings screen:

```typescript
// Add state for auth modal
const [showAuthModal, setShowAuthModal] = useState(false);
const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
const [authEmail, setAuthEmail] = useState('');
const [authPassword, setAuthPassword] = useState('');

// Add auth handler
const handleAuth = async () => {
  try {
    if (authMode === 'signup') {
      await signUp(authEmail, authPassword);
      showToast('Account created! Check your email to verify.', 'success');
    } else {
      await signIn(authEmail, authPassword);
      showToast('Signed in successfully!', 'success');
    }
    setShowAuthModal(false);
    setAuthEmail('');
    setAuthPassword('');
  } catch (error: any) {
    showToast(error.message || 'Authentication failed', 'error');
  }
};

// Add to settings screen (around line 1100)
<div className={`rounded-3xl p-6 space-y-4 ${cardClass} shadow-sm`}>
  <div className="flex justify-between items-center">
    <p className="font-lexend font-bold text-sm">Account</p>
    {currentUser ? (
      <div className="text-xs opacity-60">{currentUser.email}</div>
    ) : (
      <div className="text-xs opacity-60">Not signed in</div>
    )}
  </div>

  {currentUser ? (
    <button
      onClick={async () => {
        await signOut();
        showToast('Signed out', 'success');
      }}
      className="w-full py-3 rounded-xl bg-red-500 text-white font-bold"
    >
      Sign Out
    </button>
  ) : (
    <button
      onClick={() => setShowAuthModal(true)}
      className="w-full py-3 rounded-xl bg-[#5B4A8F] text-white font-bold"
    >
      Sign In / Sign Up
    </button>
  )}
</div>
```

Then add the modal component at the end of your render (before the closing div):

```typescript
{/* Auth Modal */}
{showAuthModal && (
  <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 p-4">
    <div className={`w-full max-w-md rounded-3xl p-8 space-y-6 ${cardClass}`}>
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-2xl">
          {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
        </h2>
        <button onClick={() => setShowAuthModal(false)}>
          <X size={24} />
        </button>
      </div>

      <input
        type="email"
        placeholder="Email"
        value={authEmail}
        onChange={(e) => setAuthEmail(e.target.value)}
        className={`w-full p-4 rounded-xl border-2 ${inputClass}`}
      />

      <input
        type="password"
        placeholder="Password"
        value={authPassword}
        onChange={(e) => setAuthPassword(e.target.value)}
        className={`w-full p-4 rounded-xl border-2 ${inputClass}`}
      />

      <button
        onClick={handleAuth}
        className="w-full py-4 rounded-xl bg-[#5B4A8F] text-white font-bold"
      >
        {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
      </button>

      <button
        onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
        className="w-full text-sm opacity-60"
      >
        {authMode === 'signin'
          ? "Don't have an account? Sign up"
          : 'Already have an account? Sign in'}
      </button>
    </div>
  </div>
)}
```

**File location:** Add around `App.tsx:1100` for button, and at end of render for modal

#### Option B: Dedicated Auth Screen

Create a new screen state `'AUTH'` and build a full authentication screen with:
- Email/password sign in
- Email/password sign up
- OAuth buttons (Google, GitHub)
- Password reset
- Email verification status

---

### 9. Add Sync Status Indicator

Add a visual indicator showing sync status:

```typescript
// Add state
const [isSyncing, setIsSyncing] = useState(false);

// Update syncToSupabase function
const syncToSupabase = async () => {
  if (!currentUser) return;
  setIsSyncing(true);
  try {
    await updateUserSettings(currentUser.id, settings);
    // ... rest of sync logic
    console.log('✅ Data synced to Supabase');
  } catch (error) {
    console.error('❌ Error syncing to Supabase:', error);
  } finally {
    setIsSyncing(false);
  }
};

// Add indicator to top bar (around line 700)
{currentUser && (
  <div className="flex items-center gap-2 text-xs opacity-60">
    {isSyncing ? (
      <>
        <Loader2 size={14} className="animate-spin" />
        <span>Syncing...</span>
      </>
    ) : (
      <>
        <CheckCircle size={14} className="text-green-500" />
        <span>Synced</span>
      </>
    )}
  </div>
)}
```

**File location:** `App.tsx:700` (in top navigation bar)

---

## Testing Integration

### Test Authentication

1. Start dev server: `npm run dev`
2. Go to Settings
3. Click "Sign In / Sign Up"
4. Create new account with email/password
5. Check email for verification link (if enabled)
6. Verify you can see user email in settings

### Test Data Sync

1. Sign in to account
2. Create a new analysis
3. Check Supabase dashboard → Table Editor → analyses
4. Verify analysis appears in database
5. Open app in incognito/different browser
6. Sign in with same account
7. Verify analysis history syncs

### Test Settings Sync

1. Sign in
2. Change text size, font, dark mode
3. Open app in different browser/device
4. Sign in with same account
5. Verify settings are synced

### Test Custom Library Sync

1. Sign in
2. Add custom library item
3. Open app elsewhere
4. Sign in
5. Verify library item synced

### Test Offline Fallback

1. Sign out
2. Use app normally
3. Verify data still saves to localStorage
4. Sign in again
5. Verify localStorage data is preserved

---

## Migration Strategy

### For Existing Users

When a user signs up/in for the first time with existing localStorage data:

```typescript
// Add to syncFromSupabase function
const syncFromSupabase = async (userId: string) => {
  try {
    // Check if this is first sync (no data in Supabase)
    const dbAnalyses = await getUserAnalyses(userId, 1);

    if (dbAnalyses.length === 0 && history.length > 0) {
      // First time signing in - migrate localStorage to Supabase
      console.log('🔄 Migrating local data to Supabase...');

      // Upload all existing history
      for (const analysis of history) {
        await saveAnalysis(userId, analysis);
      }

      // Upload settings
      await updateUserSettings(userId, settings);

      // Upload custom library
      for (const item of customLibraryItems) {
        await addCustomLibraryItem(userId, item);
      }

      showToast('Your data has been synced to the cloud!', 'success');
    }

    // Normal sync from Supabase
    // ... rest of sync logic
  } catch (error) {
    console.error('Migration error:', error);
  }
};
```

---

## Environment Variables Reference

### Development (.env)

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_GOOGLE_GEMINI_API_KEY=AIza...
```

### Production (Vercel/Netlify/etc.)

Add these as environment variables in your hosting platform's dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GOOGLE_GEMINI_API_KEY`

---

## Security Checklist

- ✅ `.env` is in `.gitignore`
- ✅ Using `VITE_SUPABASE_ANON_KEY` (not service_role)
- ✅ RLS policies are enabled on all tables
- ✅ Never exposing service_role key in frontend
- ✅ Validating user input before saving
- ✅ Using prepared statements (Supabase does this)
- ✅ HTTPS enabled in production (Capacitor default)

---

## Troubleshooting

### "relation does not exist"
- Run schema.sql in Supabase SQL Editor
- Check table names match exactly

### "JWT expired" or auth errors
- Check VITE_SUPABASE_ANON_KEY is correct
- Restart dev server after changing .env
- Clear browser cache/cookies

### Data not syncing
- Check browser console for errors
- Verify user is authenticated: `console.log(currentUser)`
- Check Supabase logs in dashboard
- Verify RLS policies are correct

### "VITE_SUPABASE_URL is undefined"
- Restart dev server after creating .env
- Check .env is in project root
- Verify no typos in variable names

---

## Next Steps

1. ✅ Complete basic authentication UI
2. ✅ Test all sync functions
3. ✅ Add real-time subscriptions (optional)
4. ✅ Implement password reset flow
5. ✅ Add OAuth providers
6. ✅ Build onboarding for new users
7. ✅ Add subscription/payment integration
8. ✅ Migrate to Supabase Storage for large files

---

## File Locations Summary

**Created Files:**
- `supabase/schema.sql` - Database schema
- `supabase/SETUP_GUIDE.md` - Setup instructions
- `supabase/INTEGRATION_GUIDE.md` - This file
- `services/supabaseService.ts` - Supabase helper functions
- `.env.example` - Environment variable template

**Modified Files:**
- `.gitignore` - Added .env exclusion
- `App.tsx` - Add imports, state, sync functions (this guide)

**Environment Files:**
- `.env` - Your actual API keys (create from .env.example)
