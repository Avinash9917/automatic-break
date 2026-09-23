# Deployment Guide - Automatic Break Time

## Prerequisites

Before deploying, ensure you have:
- A Lovable Cloud project set up
- Supabase database properly configured
- All required secrets added to your environment
- Google OAuth credentials configured

## Required Environment Variables

### Supabase Secrets
These are automatically configured in Lovable Cloud:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for server operations
- `LOVABLE_API_KEY` - Auto-generated for AI features

### Required Custom Secrets
Add these via the Supabase dashboard:
1. `GOOGLE_PHOTOS_CLIENT_ID` - Google OAuth client ID
2. `GOOGLE_PHOTOS_CLIENT_SECRET` - Google OAuth client secret

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Photos Library API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `https://yourdomain.com/auth/callback`
5. Copy Client ID and Client Secret to Supabase secrets

## Database Configuration

All database migrations should already be applied. Verify these tables exist:
- `user_profiles`
- `user_preferences`
- `break_sessions`
- `content_ratings`

## Edge Functions

The following edge functions are deployed:
- `ai-recommendations` - Generates personalized break suggestions
- `fetch-photos` - Fetches photos from Google Photos API

Verify they are properly configured in `supabase/config.toml`

## Security Checklist

- [ ] All edge functions have JWT verification enabled
- [ ] RLS policies are enabled on all tables
- [ ] Input validation is implemented on all endpoints
- [ ] CORS headers are properly configured
- [ ] Rate limiting is in place for AI endpoints
- [ ] Environment variables are properly secured

## Performance Optimizations

The app includes:
- Lazy loading for all major routes
- Service worker for offline support
- Image caching strategy
- Code splitting for optimal bundle size
- React Query for efficient data fetching

## Deployment Steps

1. **Test Locally**
   ```bash
   npm run dev
   ```

2. **Build for Production**
   ```bash
   npm run build
   ```

3. **Deploy via Lovable**
   - Click "Publish" button in Lovable editor
   - Or connect to GitHub and use CI/CD

4. **Verify Deployment**
   - Test authentication flow
   - Verify Google Photos integration
   - Check AI recommendations functionality
   - Test break scheduling and notifications

## Post-Deployment Testing

1. Create a test account
2. Complete onboarding flow
3. Connect Google Photos
4. Trigger a break session
5. Verify AI recommendations
6. Check notification permissions
7. Test offline functionality

## Monitoring

Monitor these metrics:
- Edge function error rates
- AI API usage and costs
- User authentication success rates
- Break session completion rates
- Google Photos API quotas

## Troubleshooting

### AI Recommendations Not Working
- Verify `LOVABLE_API_KEY` is configured
- Check Lovable workspace credits
- Review edge function logs for errors

### Google Photos Connection Issues
- Verify OAuth credentials are correct
- Check redirect URI configuration
- Ensure Google Photos API is enabled

### Notification Issues
- Verify user has granted notification permissions
- Check browser compatibility
- Review service worker registration

## Support

For issues or questions:
- Review edge function logs in Supabase dashboard
- Check browser console for client-side errors
- Contact support@lovable.dev for Lovable-specific issues
