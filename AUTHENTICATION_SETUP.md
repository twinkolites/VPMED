# VPMED Authentication Setup

## Overview
This document explains how to set up and troubleshoot authentication for the VPMED dashboard application.

## Authentication Flow
The application uses Supabase for authentication with enhanced session persistence:

1. **Login Process**: Users authenticate via email/password
2. **Session Persistence**: Sessions are stored in localStorage with auto-refresh
3. **Protected Routes**: Dashboard requires valid authentication
4. **Automatic Redirects**: Unauthenticated users are redirected to login

## Environment Setup

### 1. Create Environment File
Copy `env.example` to `.env.local`:
```bash
cp env.example .env.local
```

### 2. Configure Supabase Variables
Edit `.env.local` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

### 3. Get Supabase Credentials
1. Go to [https://supabase.com](https://supabase.com)
2. Create or select your project
3. Go to Settings > API
4. Copy the Project URL and anon public key
5. Paste them into your `.env.local` file

## Authentication Features

### Enhanced Session Management
- **Auto-refresh tokens**: Keeps users logged in automatically
- **Persistent sessions**: Sessions survive browser restarts
- **Secure storage**: Uses localStorage with error handling
- **Session monitoring**: Logs authentication state changes

### User Experience Improvements
- **Loading states**: Shows progress during authentication
- **Error handling**: Displays clear error messages
- **Success feedback**: Confirms successful login
- **Automatic redirects**: Seamless navigation flow

### Debug Information
The application logs authentication events to the browser console:
- Sign in attempts and results
- Session state changes
- Token refresh events
- Authentication status checks

## Troubleshooting

### Common Issues

#### 1. "Missing Supabase environment variables"
**Problem**: Environment variables not loaded
**Solution**: 
- Ensure `.env.local` exists in project root
- Check variable names match exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart development server after creating/modifying `.env.local`

#### 2. Login appears successful but redirects back to login
**Problem**: Session not persisting
**Solutions**:
- Check browser console for authentication errors
- Clear localStorage: `localStorage.clear()`
- Verify Supabase project settings allow your domain
- Check if browser blocks localStorage (private/incognito mode)

#### 3. "Authentication failed" error
**Problem**: Invalid credentials or Supabase configuration
**Solutions**:
- Verify email/password are correct
- Check Supabase project is active
- Ensure RLS (Row Level Security) policies allow authentication
- Check Supabase Auth settings

#### 4. Page keeps loading indefinitely
**Problem**: Authentication context stuck in loading state
**Solutions**:
- Check browser console for errors
- Clear browser cache and localStorage
- Verify Supabase URL is accessible
- Check network connectivity

### Development Testing

#### Test Authentication Flow
1. Open browser developer tools (F12)
2. Go to Console tab to see authentication logs
3. Navigate to `/login`
4. Enter credentials and submit
5. Check console for authentication events
6. Verify redirect to `/dashboard`

#### Check Session Persistence
1. Login successfully
2. Close browser tab
3. Open new tab and navigate to `/dashboard`
4. Should automatically load dashboard without login

#### Clear Authentication State
To reset authentication for testing:
```javascript
// In browser console
localStorage.clear()
location.reload()
```

## Security Notes

### Production Deployment
- Never commit `.env.local` to git (already in .gitignore)
- Use environment variables in production hosting
- Ensure HTTPS is enabled for production
- Configure CORS properly in Supabase

### User Data Protection
- Only email is stored in local state
- Passwords never stored locally
- Session tokens handled securely by Supabase
- Automatic token refresh prevents stale sessions

## Support

If you continue experiencing authentication issues:

1. Check the browser console for error messages
2. Verify your Supabase project configuration
3. Test with a fresh browser profile
4. Review Supabase documentation for recent changes

For development questions, check the authentication context in `src/context/AuthContext.tsx` and the Supabase configuration in `src/lib/supabase.ts`.

## Features
- 🔐 Secure Supabase authentication
- 🎨 Premium UI design with glass morphism effects
- 📱 Fully responsive design
- 🌙 Dark theme login page
- ⚡ Fast loading with smooth animations
- 🔄 Auto session management
- 👤 Social login support (Google, GitHub)
- 🔒 Protected routes

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Supabase Configuration
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key
4. Enable authentication providers if needed (Google, GitHub, etc.)

### 3. URL Configuration
The authentication system is configured for:
- **Login**: `/login` (hidden from public navigation)
- **Dashboard**: `/dashboard` (protected route)
- **Public routes**: `/`, `/services`, `/gallery`, `/contact`

### 4. Authentication Features

#### Login Page (`/login`)
- Modern glass morphism design
- Two authentication modes:
  - Quick Login (Supabase Auth UI)
  - Custom Form (manual email/password)
- Social login support
- Real-time validation
- Smooth animations

#### Dashboard (`/dashboard`)
- Full admin interface
- Responsive sidebar navigation
- Statistics cards
- Recent activity feed
- Quick action buttons
- User profile display
- Secure logout

### 5. Security Features
- Protected routes with automatic redirects
- Session persistence
- Auto token refresh
- Secure logout
- Type-safe authentication context

## Usage

### Access the Login Page
Navigate to: `https://yourdomain.com/login`

### Default Credentials
Create an account through the signup form or use social login.

### Navigation
- Public users only see the main site pages
- Authenticated users can access `/dashboard`
- Login page is hidden from public navigation

## Architecture

### Authentication Context
- Global authentication state management
- User session handling
- Automatic redirects

### Protected Routes
- Dashboard routes require authentication
- Automatic redirect to login for unauthenticated users
- Preserves intended destination after login

### UI Components
- Modern, responsive design
- Smooth animations with Framer Motion
- Premium visual effects
- Consistent design system

## Dependencies Added
- `@supabase/supabase-js` - Supabase client
- `@supabase/auth-ui-react` - Pre-built auth components
- `@supabase/auth-ui-shared` - Shared auth UI themes
- `@heroicons/react` - Modern icon library
- `framer-motion` - Smooth animations
- `clsx` & `tailwind-merge` - Utility styling

## Development
```bash
npm run dev
```

## Production Notes
- Ensure environment variables are properly set
- Configure Supabase redirect URLs for production domain
- Test authentication flows thoroughly
- Set up proper CORS policies in Supabase 