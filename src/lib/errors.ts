/**
 * Maps database errors to user-friendly messages.
 * Prevents leaking internal schema details to users.
 */
export function mapDatabaseError(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'An unexpected error occurred. Please try again.';
  }

  const err = error as { code?: string; message?: string };
  
  // PostgreSQL error codes
  if (err.code === '23505') {
    return 'This record already exists.';
  }
  if (err.code === '23503') {
    return 'Invalid reference. The related record may not exist.';
  }
  if (err.code === '23514') {
    return 'Invalid data format. Please check your input.';
  }
  if (err.code === '23502') {
    return 'Required field is missing.';
  }
  if (err.code === '42501') {
    return 'You do not have permission to perform this action.';
  }
  if (err.code === 'P0001') {
    // Custom RAISE EXCEPTION - extract user-friendly message if present
    if (err.message?.includes('Invalid phone format')) {
      return 'Invalid phone format. Use Bangladeshi format: 01XXXXXXXXX';
    }
    return 'Validation error. Please check your input.';
  }

  // Supabase Auth errors
  if (err.message?.toLowerCase().includes('jwt')) {
    return 'Your session has expired. Please log in again.';
  }
  if (err.message?.toLowerCase().includes('invalid login credentials')) {
    return 'Invalid email or password.';
  }
  if (err.message?.toLowerCase().includes('email not confirmed')) {
    return 'Please verify your email address before signing in.';
  }
  if (err.message?.toLowerCase().includes('user already registered')) {
    return 'An account with this email already exists.';
  }
  if (err.message?.toLowerCase().includes('password')) {
    return 'Password does not meet requirements.';
  }
  if (err.message?.toLowerCase().includes('rate limit')) {
    return 'Too many attempts. Please try again later.';
  }

  // Log the full error for debugging (only in development)
  console.error('Database error:', err);

  return 'An error occurred. Please try again.';
}

/**
 * Maps authentication errors to user-friendly messages.
 */
export function mapAuthError(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'An authentication error occurred. Please try again.';
  }

  const err = error as { message?: string; status?: number };

  if (err.message?.toLowerCase().includes('invalid login credentials')) {
    return 'Invalid email or password.';
  }
  if (err.message?.toLowerCase().includes('email not confirmed')) {
    return 'Please check your email and verify your account before signing in.';
  }
  if (err.message?.toLowerCase().includes('user already registered')) {
    return 'An account with this email already exists. Please sign in instead.';
  }
  if (err.message?.toLowerCase().includes('password')) {
    if (err.message.toLowerCase().includes('weak')) {
      return 'Password is too weak. Use at least 8 characters with letters and numbers.';
    }
    return 'Invalid password format.';
  }
  if (err.message?.toLowerCase().includes('rate limit')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (err.status === 429) {
    return 'Too many requests. Please wait a moment and try again.';
  }

  console.error('Auth error:', err);
  return 'An error occurred during authentication. Please try again.';
}
