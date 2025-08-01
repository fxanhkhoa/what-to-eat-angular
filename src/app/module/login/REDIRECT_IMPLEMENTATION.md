# Redirect URL Implementation

## Overview
The login component now properly handles redirect URLs from query parameters, allowing users to be redirected to their intended destination after successful authentication.

## How it works

### 1. Authentication Guard Flow
When a user tries to access a protected route without being authenticated:
1. The `authenticationGuard` intercepts the request
2. It redirects to `/login?redirect=<encoded_url>` 
3. The original URL is encoded and passed as a query parameter

### 2. Authorization Guard Flow
When a user has a valid token but lacks permissions:
1. The `authorizationGuard` intercepts the request
2. It redirects to `/forbidden` page
3. User can navigate back or go home from the forbidden page

### 3. Login Component Redirect Logic
After successful login, the `navigate()` method:
1. Checks for a `redirect` query parameter
2. If found, decodes and navigates to that URL
3. If not found, uses default role-based navigation:
   - ADMIN users → `/admin`
   - Other users → `/`

## Example Flow

1. User tries to access `/admin/dish/create`
2. `authenticationGuard` redirects to `/login?redirect=%2Fadmin%2Fdish%2Fcreate`
3. User logs in successfully
4. System redirects user to `/admin/dish/create`
5. If user lacks permissions, `authorizationGuard` redirects to `/forbidden`

## Code Changes

### LoginComponent (`login.component.ts`)
- Added `ActivatedRoute` injection
- Modified `navigate()` method to handle redirect URL
- Added URL decoding for proper navigation

### AuthorizationGuard (`authorization.guard.ts`)
- Updated to use `RedirectCommand` for consistency
- Added proper forbidden page redirect
- Improved error handling for insufficient permissions

## Testing the Flow

1. **Test redirect after login:**
   - Navigate to a protected route while logged out
   - Complete the login process
   - Verify redirect to original destination

2. **Test forbidden access:**
   - Login with insufficient permissions
   - Try to access restricted route
   - Verify redirect to forbidden page

3. **Test default navigation:**
   - Login without redirect parameter
   - Verify role-based default navigation
