# Migration Plan: Client to Server-Side Authentication

## Overview

Currently, the application has two authentication implementations:

1. Server-side (in `app/auth/actions.ts`)
2. Client-side (in `app/sign-in/page.tsx` and `app/sign-up/page.tsx`)

The client-side implementation is causing magic link redirects to go to `supabase.lemonspace.io` instead of `lemonspace.io`. This plan outlines the migration to a consistent server-side authentication implementation.

## Current Issues

- Inconsistent redirect handling between client and server implementations
- Magic links defaulting to Supabase URL for redirects
- Potential race conditions with two auth implementations

## Migration Steps

### 1. Update Sign-In Page

- Remove client-side Supabase client creation
- Replace client-side auth handlers with server actions
- Update form to use server actions
- Maintain loading states and error handling

### 2. Update Sign-Up Page

- Remove client-side Supabase client creation
- Replace client-side auth handlers with server actions
- Update form to use server actions
- Maintain loading states and error handling

### 3. Update Auth Actions

- Ensure consistent error handling
- Add proper TypeScript types
- Implement proper session management
- Add logging for debugging

### 4. Code Changes Required

#### a) Sign-In Page Updates

```typescript
// Before (client-side):
const handleEmailLogin = async (e: React.FormEvent) => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });
};

// After (server action):
const handleEmailLogin = async (formData: FormData) => {
  "use server";
  const result = await signIn(formData);
  // Handle result
};
```

#### b) Sign-Up Page Updates

```typescript
// Before (client-side):
const handleEmailSignUp = async (e: React.FormEvent) => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });
};

// After (server action):
const handleEmailSignUp = async (formData: FormData) => {
  "use server";
  const result = await signUp(formData);
  // Handle result
};
```

### 5. Testing Plan

1. Test magic link flow

   - Sign-in with magic link
   - Sign-up with magic link
   - Verify redirect URLs
   - Check error handling

2. Test OAuth flow

   - Google authentication
   - Apple authentication
   - Verify redirect URLs
   - Check error handling

3. Test session management
   - Session creation
   - Session persistence
   - Session expiry
   - Session refresh

### 6. Rollout Strategy

1. Implement changes in development environment
2. Test thoroughly in staging environment
3. Monitor error rates and auth success rates
4. Deploy to production with ability to rollback

### 7. Success Metrics

- Magic links redirect correctly to `lemonspace.io`
- No authentication errors in logs
- Successful sign-in/sign-up flows
- Proper session management

## Benefits

1. Consistent authentication handling
2. Better error management
3. Improved security
4. Simplified codebase maintenance
5. Reliable redirect behavior

## Risks and Mitigation

1. Risk: Session handling during migration
   Mitigation: Implement proper cleanup of old sessions

2. Risk: User experience during rollout
   Mitigation: Clear error messages and logging

3. Risk: OAuth integration changes
   Mitigation: Thorough testing of all auth providers

## Timeline

1. Development: 1-2 days
2. Testing: 1 day
3. Deployment: 1 day
4. Monitoring: 1-2 days

## Rollback Plan

1. Keep old client-side implementation in commented code
2. Maintain ability to switch back to client-side auth
3. Monitor error rates for quick detection of issues

## Next Steps

1. Review and approve migration plan
2. Set up development environment
3. Begin implementation
4. Schedule testing phase
5. Plan production deployment
