# SecureShare Platform - Production Deployment Guide

## Overview
SecureShare is a file sharing platform with advanced security features, subscription management, and multiple sharing options.

## Environment Variables Required

### Supabase Configuration
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for edge functions

### Paddle Payment Configuration
- `PADDLE_API_KEY`: Your Paddle API key for subscription management
- `PADDLE_PRICE_ID_MONTHLY`: Paddle price ID for monthly subscriptions
- `PADDLE_PRICE_ID_YEARLY`: Paddle price ID for yearly subscriptions

### Email Service Configuration (Optional)
- `RESEND_API_KEY`: API key for Resend email service (for email sharing functionality)

## Database Setup

The platform includes a complete database schema. Make sure to run the migration in `supabase/migrations/` to set up all required tables:

- `profiles` - User profiles and subscription information
- `files` - File metadata and storage information
- `shared_links` - Shareable links with access controls
- `download_logs` - Download tracking and analytics

## Features Implemented

### File Management
- ✅ Secure file upload with size limits
- ✅ File metadata tracking
- ✅ Download counting and analytics
- ✅ File expiration dates
- ✅ Public/private file visibility
- ✅ File locking mechanism

### Sharing Options
- ✅ Direct link sharing with copy functionality
- ✅ Email sharing with automatic email composition
- ✅ Share code generation (8-character codes)
- ✅ Password-protected shares
- ✅ Download limits per share
- ✅ Link expiration dates

### Security Features
- ✅ User authentication via Supabase Auth
- ✅ Row-level security (RLS) policies
- ✅ Password protection for sensitive files
- ✅ Secure file storage in Supabase Storage
- ✅ Download logging and tracking

### Subscription Management
- ✅ Paddle integration for payments
- ✅ Free and Pro tiers
- ✅ Subscription success page
- ✅ Usage limits based on subscription tier

### User Interface
- ✅ Responsive design with Tailwind CSS
- ✅ Dark theme implementation
- ✅ Toast notifications for user feedback
- ✅ Loading states and error handling
- ✅ File manager with bulk operations

## Edge Functions Deployed

1. **create-paddle-checkout** - Handles subscription payments
2. **send-email** - Sends email notifications for file sharing

## Paddle Setup Instructions

1. Create a Paddle account at https://paddle.com
2. Set up your products with monthly and yearly pricing
3. Get your API key from Paddle dashboard
4. Update the environment variables with your Paddle configuration
5. Configure webhook endpoints (optional) for subscription management

## Email Service Setup (Optional)

1. Sign up for Resend at https://resend.com
2. Verify your sending domain
3. Get your API key
4. Update the send-email edge function with your domain

## Production Checklist

### Required Configuration
- [ ] Set up Supabase project with all environment variables
- [ ] Configure Paddle with real price IDs
- [ ] Set up proper domain for email sending
- [ ] Configure storage bucket policies
- [ ] Set up backup strategies

### Security Hardening
- [ ] Review and test all RLS policies
- [ ] Enable audit logging
- [ ] Set up monitoring and alerts
- [ ] Configure rate limiting
- [ ] Review CORS settings

### Testing
- [ ] Test file upload/download functionality
- [ ] Test all sharing methods (link, email, code)
- [ ] Test subscription flow end-to-end
- [ ] Test password protection features
- [ ] Verify email sending functionality

### Performance
- [ ] Enable CDN for file delivery
- [ ] Configure appropriate caching headers
- [ ] Monitor database performance
- [ ] Set up file cleanup for expired files

## Support and Maintenance

### Regular Tasks
- Clean up expired files and links
- Monitor subscription status changes
- Review download analytics
- Update security patches

### Monitoring
- Track subscription conversions
- Monitor file sharing usage
- Watch for abuse patterns
- Performance metrics

## Known Limitations

1. **Password Validation**: Currently uses basic password validation. For production, implement proper bcrypt/scrypt hashing.
2. **File Size Limits**: Configure appropriate limits based on your storage plan.
3. **Email Rate Limits**: Implement rate limiting for email sharing to prevent abuse.
4. **File Cleanup**: Implement automated cleanup for expired files.

## Support

For technical support or feature requests, refer to the code documentation and Supabase/Paddle documentation.