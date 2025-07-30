# SecureShare - File Sharing Platform

A modern, secure file sharing platform built with React, Supabase, and Paddle payments.

## 🚀 Features

### 🔐 Secure File Sharing
- **Multiple sharing methods**: Direct links, email sharing, and share codes
- **Password protection**: Secure sensitive files with password protection  
- **Expiration control**: Set custom expiry dates or permanent links
- **Download limits**: Control how many times files can be downloaded

### 💼 Subscription Management
- **Free tier**: 10 uploads per day with basic features
- **Pro tier**: Unlimited uploads with advanced features
- **Paddle integration**: Secure payment processing
- **Flexible billing**: Monthly and yearly subscription options

### 📊 Analytics & Management
- **Download tracking**: Monitor who downloads your files and when
- **Link management**: View and manage all active share links with copy functionality
- **File organization**: Public/private visibility controls
- **Usage analytics**: Track your sharing activity

### 🛡️ Security Features
- **Authentication**: Secure user accounts via Supabase Auth
- **Row-level security**: Database-level access controls
- **File encryption**: Secure storage in Supabase Storage
- **Audit logging**: Complete download and access logging

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payments**: Paddle
- **Email**: Resend (optional)
- **Deployment**: Lovable Platform

## 🚦 Quick Start

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd secureshare
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   PADDLE_API_KEY=your_paddle_api_key
   PADDLE_PRICE_ID_MONTHLY=your_monthly_price_id
   PADDLE_PRICE_ID_YEARLY=your_yearly_price_id
   RESEND_API_KEY=your_resend_api_key # Optional
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 📋 Production Setup

### Required Configuration
1. **Supabase Project**: Set up with database migrations from `supabase/migrations/`
2. **Database Update**: Run the SQL script in `supabase/update_upload_limit.sql` to set correct upload limits
3. **Paddle Account**: Configure subscription products and get API keys
4. **Edge Functions**: Deploy `create-paddle-checkout` and `send-email` functions
5. **Environment Variables**: Set all required keys in production

### Database Tables
- `profiles` - User profiles and subscription information
- `files` - File metadata and storage paths  
- `shared_links` - Shareable links with access controls
- `download_logs` - Download tracking and analytics

## 🔧 Features Status

### ✅ Implemented
- [x] File upload with drag & drop
- [x] Multiple sharing methods (link, email, code)
- [x] Password protection for files
- [x] Download limits and expiration
- [x] Copy-to-clipboard functionality
- [x] Email sharing with automatic composition
- [x] Subscription management with Paddle
- [x] Download tracking and analytics
- [x] Responsive design with dark theme

### 🏗️ Production Ready
- [x] Row-level security policies
- [x] Error handling and loading states
- [x] File cleanup and management
- [x] Subscription success page
- [x] Email service integration
- [x] Secure authentication flow

## 📝 Usage

1. **Sign up** for a free account
2. **Upload files** using drag-and-drop
3. **Create share links** with custom settings
4. **Track downloads** from your dashboard
5. **Upgrade to Pro** for unlimited features

## 🔒 Security

- All user data protected by row-level security
- Files stored securely in Supabase Storage  
- Download access logged and monitored
- Secure password hashing for protected files

## 📞 Support

For technical support, see `DEPLOYMENT_GUIDE.md` for detailed setup instructions.

## 🎯 Deployment

Simply open [Lovable](https://lovable.dev/projects/ad044e5e-107b-438b-bc91-d872c4842f8b) and click on Share -> Publish.

## 🌐 Custom Domain

To connect a custom domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
