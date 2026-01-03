/**
 * Supabase Service
 *
 * This service provides helper functions for interacting with Supabase:
 * - Authentication (signup, login, logout)
 * - Database operations (CRUD for all tables)
 * - Real-time subscriptions
 *
 * SETUP REQUIRED:
 * 1. Run supabase/schema.sql in your Supabase project
 * 2. Create .env file with:
 *    VITE_SUPABASE_URL=your-project-url
 *    VITE_SUPABASE_ANON_KEY=your-anon-key
 * 3. Install: npm install @supabase/supabase-js
 */

import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { AnalysisResult, UserSettings, CustomLibraryItem, QueuedAnalysis } from '../types';

// ============================================
// SUPABASE CLIENT INITIALIZATION
// ============================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables not found. Using localStorage fallback.');
  console.warn('To enable Supabase, add to .env:');
  console.warn('  VITE_SUPABASE_URL=your-project-url');
  console.warn('  VITE_SUPABASE_ANON_KEY=your-anon-key');
}

export const supabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Sign up a new user with email and password
 */
export const signUp = async (email: string, password: string) => {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

/**
 * Sign in an existing user
 */
export const signIn = async (email: string, password: string) => {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async () => {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });

  if (error) throw error;
  return data;
};

/**
 * Sign in with GitHub OAuth
 */
export const signInWithGitHub = async () => {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
  });

  if (error) throw error;
  return data;
};

/**
 * Sign out current user
 */
export const signOut = async () => {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

/**
 * Reset password - sends email with reset link
 */
export const resetPassword = async (email: string) => {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
};

/**
 * Update password
 */
export const updatePassword = async (newPassword: string) => {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
};

// ============================================
// USER SETTINGS FUNCTIONS
// ============================================

/**
 * Get user settings from database
 */
export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching settings:', error);
    return null;
  }

  // Map database columns to UserSettings interface
  return {
    textSize: data.text_size,
    fontFamily: data.font_family,
    voiceName: data.voice_name,
    analysisDetail: data.analysis_detail,
    audioOutput: data.audio_output,
    audioSpeed: data.audio_speed,
    defaultMode: data.default_mode,
    darkMode: data.dark_mode,
    tier: data.tier,
    analysesCount: data.analyses_count,
    subscriptionExpiry: data.subscription_expiry ? new Date(data.subscription_expiry).getTime() : undefined,
  };
};

/**
 * Update user settings in database
 */
export const updateUserSettings = async (userId: string, settings: Partial<UserSettings>) => {
  if (!supabase) return;

  // Map UserSettings interface to database columns
  const dbSettings: any = {};
  if (settings.textSize !== undefined) dbSettings.text_size = settings.textSize;
  if (settings.fontFamily !== undefined) dbSettings.font_family = settings.fontFamily;
  if (settings.voiceName !== undefined) dbSettings.voice_name = settings.voiceName;
  if (settings.analysisDetail !== undefined) dbSettings.analysis_detail = settings.analysisDetail;
  if (settings.audioOutput !== undefined) dbSettings.audio_output = settings.audioOutput;
  if (settings.audioSpeed !== undefined) dbSettings.audio_speed = settings.audioSpeed;
  if (settings.defaultMode !== undefined) dbSettings.default_mode = settings.defaultMode;
  if (settings.darkMode !== undefined) dbSettings.dark_mode = settings.darkMode;
  if (settings.tier !== undefined) dbSettings.tier = settings.tier;
  if (settings.analysesCount !== undefined) dbSettings.analyses_count = settings.analysesCount;
  if (settings.subscriptionExpiry !== undefined) {
    dbSettings.subscription_expiry = settings.subscriptionExpiry
      ? new Date(settings.subscriptionExpiry).toISOString()
      : null;
  }

  const { error } = await supabase
    .from('user_settings')
    .update(dbSettings)
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

// ============================================
// ANALYSES (HISTORY) FUNCTIONS
// ============================================

/**
 * Save an analysis to the database
 */
export const saveAnalysis = async (userId: string, analysis: AnalysisResult) => {
  if (!supabase) return;

  const { error } = await supabase
    .from('analyses')
    .insert({
      id: analysis.id,
      user_id: userId,
      timestamp: analysis.timestamp,
      mode: analysis.mode,
      original_message: analysis.originalMessage,
      what_was_said: analysis.whatWasSaid,
      what_is_expected: analysis.whatIsExpected,
      what_is_optional: analysis.whatIsOptional,
      what_carries_risk: analysis.whatCarriesRisk,
      what_is_not_asking_for: analysis.whatIsNotAskingFor,
      hidden_rules: analysis.hiddenRules,
      clarity_score: analysis.clarityScore,
      responses: analysis.responses,
      confidence_level: analysis.confidenceLevel,
    });

  if (error) {
    console.error('Error saving analysis:', error);
    throw error;
  }
};

/**
 * Get all analyses for a user
 */
export const getUserAnalyses = async (userId: string, limit: number = 100): Promise<AnalysisResult[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching analyses:', error);
    return [];
  }

  // Map database rows to AnalysisResult interface
  return data.map(row => ({
    id: row.id,
    timestamp: row.timestamp,
    mode: row.mode,
    originalMessage: row.original_message,
    whatWasSaid: row.what_was_said,
    whatIsExpected: row.what_is_expected,
    whatIsOptional: row.what_is_optional,
    whatCarriesRisk: row.what_carries_risk,
    whatIsNotAskingFor: row.what_is_not_asking_for,
    hiddenRules: row.hidden_rules,
    clarityScore: row.clarity_score,
    responses: row.responses,
    confidenceLevel: row.confidence_level,
  }));
};

/**
 * Delete an analysis
 */
export const deleteAnalysis = async (userId: string, analysisId: string) => {
  if (!supabase) return;

  const { error } = await supabase
    .from('analyses')
    .delete()
    .eq('user_id', userId)
    .eq('id', analysisId);

  if (error) {
    console.error('Error deleting analysis:', error);
    throw error;
  }
};

/**
 * Clear all analyses for a user
 */
export const clearAllAnalyses = async (userId: string) => {
  if (!supabase) return;

  const { error } = await supabase
    .from('analyses')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Error clearing analyses:', error);
    throw error;
  }
};

// ============================================
// CUSTOM LIBRARY ITEMS FUNCTIONS
// ============================================

/**
 * Get all custom library items for a user
 */
export const getCustomLibraryItems = async (userId: string): Promise<CustomLibraryItem[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('custom_library_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching library items:', error);
    return [];
  }

  // Map database rows to CustomLibraryItem interface
  return data.map(row => ({
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    url: row.url,
    fileData: row.file_data,
    fileName: row.file_name,
    mimeType: row.mime_type,
    icon: row.icon,
    createdAt: new Date(row.created_at).getTime(),
  }));
};

/**
 * Add a custom library item
 */
export const addCustomLibraryItem = async (userId: string, item: Omit<CustomLibraryItem, 'id' | 'createdAt'>) => {
  if (!supabase) return;

  const { error } = await supabase
    .from('custom_library_items')
    .insert({
      user_id: userId,
      title: item.title,
      description: item.description,
      type: item.type,
      url: item.url,
      file_data: item.fileData,
      file_name: item.fileName,
      mime_type: item.mimeType,
      icon: item.icon,
    });

  if (error) {
    console.error('Error adding library item:', error);
    throw error;
  }
};

/**
 * Delete a custom library item
 */
export const deleteCustomLibraryItem = async (userId: string, itemId: string) => {
  if (!supabase) return;

  const { error } = await supabase
    .from('custom_library_items')
    .delete()
    .eq('user_id', userId)
    .eq('id', itemId);

  if (error) {
    console.error('Error deleting library item:', error);
    throw error;
  }
};

// ============================================
// QUEUED ANALYSES FUNCTIONS (Offline Support)
// ============================================

/**
 * Add analysis to offline queue
 */
export const addQueuedAnalysis = async (userId: string, queuedAnalysis: QueuedAnalysis) => {
  if (!supabase) return;

  const { error } = await supabase
    .from('queued_analyses')
    .insert({
      id: queuedAnalysis.id,
      user_id: userId,
      message: queuedAnalysis.message,
      mode: queuedAnalysis.mode,
      detail_level: queuedAnalysis.detailLevel,
      image_data: queuedAnalysis.image?.data,
      image_mime_type: queuedAnalysis.image?.mimeType,
      audio_data: queuedAnalysis.audio?.data,
      audio_mime_type: queuedAnalysis.audio?.mimeType,
    });

  if (error) {
    console.error('Error adding queued analysis:', error);
    throw error;
  }
};

/**
 * Get all queued analyses for a user
 */
export const getQueuedAnalyses = async (userId: string): Promise<QueuedAnalysis[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('queued_analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching queued analyses:', error);
    return [];
  }

  return data.map(row => ({
    id: row.id,
    message: row.message,
    mode: row.mode,
    detailLevel: row.detail_level,
    image: row.image_data ? { data: row.image_data, mimeType: row.image_mime_type } : undefined,
    audio: row.audio_data ? { data: row.audio_data, mimeType: row.audio_mime_type } : undefined,
  }));
};

/**
 * Remove a queued analysis after processing
 */
export const removeQueuedAnalysis = async (userId: string, queuedId: string) => {
  if (!supabase) return;

  const { error } = await supabase
    .from('queued_analyses')
    .delete()
    .eq('user_id', userId)
    .eq('id', queuedId);

  if (error) {
    console.error('Error removing queued analysis:', error);
    throw error;
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if Supabase is configured and available
 */
export const isSupabaseAvailable = (): boolean => {
  return supabase !== null;
};

/**
 * Subscribe to auth state changes
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (!supabase) return () => {};

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  return () => subscription.unsubscribe();
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  if (!supabase) return false;
  const user = await getCurrentUser();
  return user !== null;
};
