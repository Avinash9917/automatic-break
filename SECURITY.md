# Security Documentation - Automatic Break Time

## Overview

This document outlines the security measures implemented in the Automatic Break Time application.

## Authentication & Authorization

### User Authentication
- Supabase Auth for user management
- Email/password authentication with secure password hashing
- Google OAuth integration for seamless sign-in
- Session management with automatic token refresh
- Secure token storage in localStorage

### Authorization Checks
- JWT token verification on all edge functions
- User-specific data access enforced via RLS policies
- Protected routes requiring valid authentication
- Authorization headers required for all API calls

## Row Level Security (RLS)

All database tables have RLS enabled with strict policies:

### user_profiles
- Users can only view and update their own profile
- Profile creation restricted to authenticated users

### user_preferences
- Users can only access their own preferences
- Real-time updates restricted to preference owner

### break_sessions
- Users can only create and view their own sessions
- Session updates restricted to session creator

### content_ratings
- Users can only rate their own content
- Ratings tied to authenticated user ID

## API Security

### Edge Functions

#### ai-recommendations
- Requires valid JWT token
- Validates user authentication before processing
- Uses authenticated user ID from token (not from request body)
- Rate limiting for AI API calls (429 responses)
- Credit validation (402 responses)

#### fetch-photos
- Requires valid JWT token
- Input validation on all parameters
- Access token validation
- Count limits (1-50) to prevent abuse
- Error handling without exposing sensitive data

### Input Validation

All edge functions implement:
- Type checking on input parameters
- Range validation on numeric inputs
- String validation on tokens and IDs
- Sanitization of user-provided data

### CORS Configuration

- Appropriate CORS headers on all endpoints
- Restricted to necessary origins in production
- OPTIONS method support for preflight requests

## Data Privacy

### Google Photos Integration
- User consent required before accessing photos
- OAuth tokens stored securely
- Photos cached with user permission
- No persistent storage of photo content
- Users can disconnect integration anytime

### AI Processing
- User data anonymized where possible
- AI processing uses aggregated statistics
- No sensitive user information sent to AI
- Recommendations based on usage patterns only

## Secrets Management

### Environment Variables
- All secrets stored in Supabase environment
- Service role key never exposed to client
- LOVABLE_API_KEY auto-generated and secured
- Google OAuth credentials encrypted at rest

### Client-Side Security
- No secrets in frontend code
- API keys never committed to repository
- Environment variables properly scoped
- Publishable keys only used where appropriate

## Network Security

### HTTPS
- All communications over HTTPS
- Secure WebSocket connections for real-time features
- Certificate validation enforced

### API Rate Limiting
- Rate limits on AI recommendation endpoint
- Graceful handling of 429 (Rate Limit) errors
- User-friendly error messages for limits

## Session Management

### Token Handling
- Automatic token refresh before expiration
- Secure token storage
- Session cleanup on logout
- No token logging or exposure

### Session Lifecycle
- Automatic session validation
- Expired session handling
- Secure session termination

## Error Handling

### Security-Conscious Errors
- Generic error messages to users
- Detailed logs only server-side
- No stack traces exposed to client
- Proper HTTP status codes

### Logging
- Server-side error logging only
- No sensitive data in logs
- User actions auditable
- AI API errors tracked

## Content Security

### Photo Caching
- Cache expiry after 7 days
- User-specific cache isolation
- Cache clearing on logout
- Secure cache storage

### Content Ratings
- User-specific ratings only
- No public exposure of ratings
- Ratings tied to authenticated user
- Validation on rating values

## Security Best Practices

### Code Review
- All edge functions reviewed for security
- Input validation on all endpoints
- SQL injection prevention via parameterized queries
- XSS prevention via React's built-in escaping

### Dependencies
- Regular dependency updates
- Security vulnerability scanning
- Minimal dependency usage
- Trusted package sources only

## Compliance

### Data Protection
- GDPR-ready data export functionality
- User data deletion on account removal
- Privacy-by-design architecture
- Minimal data collection

### User Consent
- Clear permission requests
- Opt-in for all data collection
- Transparent data usage
- Easy opt-out mechanisms

## Incident Response

### Monitoring
- Edge function error rates tracked
- Authentication failures monitored
- Unusual activity detection
- Rate limit violations logged

### Response Plan
1. Immediate issue identification
2. Edge function rollback if needed
3. User notification if data affected
4. Security patch deployment
5. Post-mortem analysis

## Security Auditing

Regular audits should include:
- RLS policy effectiveness
- Edge function authorization
- Input validation coverage
- Error handling completeness
- Token management security

## Recommendations for Production

1. **Enable additional monitoring**
   - Set up Sentry or similar for error tracking
   - Monitor API usage patterns
   - Track authentication failures

2. **Regular security reviews**
   - Quarterly RLS policy audits
   - Monthly dependency updates
   - Regular penetration testing

3. **User education**
   - Clear privacy policy
   - Transparent data usage
   - Security best practices guide

4. **Backup and recovery**
   - Regular database backups
   - Disaster recovery plan
   - Data retention policy

## Contact

For security concerns or to report vulnerabilities:
- Create a private GitHub issue
- Email: security@yourdomain.com (replace with actual)
- Never post security issues publicly
