# Berza Autica - Trade Marketplace

A peer-to-peer marketplace platform built with Next.js 14, featuring token-based economy, product listings, cart management, buyer-seller messaging, ratings, and subscriptions.

## 🚀 Features Implemented

### ✅ Core Features
- **Authentication System** - Registration, login, and session management with NextAuth.js
- **Token Balance System** - Virtual currency (1 token = 1 RSD) with transaction logging
- **Product Listings** - CRUD operations with automatic slug generation and image support
- **Listing Fees** - First 15 listings free, then 10 tokens per listing
- **Shopping Cart** - Items grouped by seller with persistence
- **Messaging System** - Buyer-seller conversations with product links
- **Rating System** - Mutual ratings with buyer-first enforcement
- **Subscriptions** - Follow sellers for new product notifications
- **Product Promotion** - Highlight products (300 tokens, max 3 per seller)

### 🛠️ Tech Stack
- **Frontend/Backend**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Neon) - All structured and document data
- **ORM**: Prisma with Neon adapter
- **Auth**: NextAuth.js with credentials provider
- **Image Storage**: Cloudinary
- **Validation**: Zod

## 📁 Project Structure

```
berza-autica/
├── app/
│   ├── api/
│   │   ├── auth/              # Authentication endpoints
│   │   ├── balance/           # Token balance management
│   │   ├── products/          # Product CRUD + promotion
│   │   ├── cart/              # Shopping cart operations
│   │   ├── messages/          # Messaging system
│   │   ├── ratings/           # Rating system
│   │   └── subscriptions/     # Seller subscriptions
│   ├── auth/                  # Login & register pages
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── lib/
│   ├── services/
│   │   ├── balance.ts         # Balance operations
│   │   ├── products.ts        # Product utilities
│   │   └── notifications.ts   # Notification service
│   ├── types/
│   │   └── domain.ts          # Domain type definitions
│   ├── auth.ts                # NextAuth configuration
│   ├── prisma.ts              # Prisma client
│   └── cloudinary.ts          # Image upload utilities
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed-simple.ts         # Database seeding
└── scripts/
```

## 🗄️ Database Schema

### PostgreSQL (Prisma)
- **Member** - Users with balance, notification preferences
- **Category** - Product categories with hierarchy support
- **Product** - Listings with images, pricing, promotion status
- **CartItem** - Shopping cart items
- **Rating** - Mutual ratings between buyers/sellers
- **Subscription** - Seller subscriptions
- **PlatformConfig** - System configuration
- **BalanceTransaction** - Token transaction history
- **Deal** - Transaction records between buyers/sellers
- **Conversation** - Message threads
- **Message** - Chat messages
- **Notification** - User notifications
- **ActivityLog** - User activity tracking

## 🚦 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database (Neon account)
- Cloudinary account

### Installation

1. **Clone and install dependencies**
```bash
npm install
```

2. **Configure environment variables**
Update `.env` and `.env.local` with your credentials:
```env
DATABASE_URL="your-neon-postgresql-url"
NEXTAUTH_SECRET="your-secret-key"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

3. **Set up database**
```bash
# Push Prisma schema to PostgreSQL
npm run db:push

# Generate Prisma client
npm run db:generate

# Seed initial data
npm run db:seed
```

4. **Run development server**
```bash
npm run dev
```

Visit `http://localhost:3000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Balance
- `GET /api/balance` - Get balance and history
- `POST /api/balance/topup` - Add tokens

### Products
- `GET /api/products` - Search/browse products
- `POST /api/products` - Create product (with fee)
- `GET /api/products/[id]` - Get product details
- `PATCH /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product
- `POST /api/products/[id]/promote` - Promote product
- `DELETE /api/products/[id]/promote` - Remove promotion

### Cart
- `GET /api/cart` - Get cart (grouped by seller)
- `POST /api/cart` - Add to cart
- `DELETE /api/cart/[itemId]` - Remove from cart

### Messages
- `GET /api/messages` - Get conversations
- `POST /api/messages` - Send message
- `GET /api/messages/[conversationId]` - Get conversation messages

### Ratings
- `POST /api/ratings` - Create rating
- `GET /api/ratings?memberId=xxx` - Get member ratings

### Subscriptions
- `GET /api/subscriptions` - Get user subscriptions
- `POST /api/subscriptions` - Subscribe to seller
- `DELETE /api/subscriptions/[id]` - Unsubscribe

## 🎯 What's Included

### ✅ Complete Features

**Backend API (20+ endpoints)**
- Full CRUD for products, cart, messages, ratings, subscriptions
- Token balance management with transaction history
- Admin panel with statistics and configuration
- Automatic listing fee calculation
- Promotion system with limits

**Frontend Pages**
- Home page with product browsing and search
- Product detail pages
- Seller dashboard with product management
- Shopping cart with seller grouping
- Messaging interface
- User profile with balance management
- Admin dashboard, config, and member management
- Authentication pages (login/register)

**Business Logic**
- First 15 listings free, then 10 tokens each
- Product promotion: 300 tokens, max 3 per seller
- Buyer-first rating enforcement
- Seller subscriptions with notifications
- Cart grouped by seller for easy messaging

## 🚀 Deployment

The application is ready to deploy to Vercel. See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

**Quick Deploy:**
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

## 🧪 Testing

See [TESTING.md](TESTING.md) for comprehensive testing guide including:
- Manual testing checklist
- API testing with Postman
- Performance testing
- Security testing

## 📚 Additional Documentation

- **README.md** - This file, project overview
- **DEPLOYMENT.md** - Deployment guide for Vercel
- **TESTING.md** - Testing guide and checklist
- **design.txt** - Original design document
- **requirements.txt** - Detailed requirements
- **tasks.txt** - Implementation tasks

## 🔮 Future Enhancements

- Email/SMS notification integration (Resend, Twilio)
- Direct image upload to Cloudinary (currently URL-based)
- Advanced search with filters
- Product reviews and ratings display
- Seller analytics dashboard
- Payment gateway integration
- Mobile app (React Native)

## 📝 License

ISC

