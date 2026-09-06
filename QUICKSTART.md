# Quick Start Guide

Get the Berza Autica marketplace running in 5 minutes!

## Prerequisites

- Node.js 20+ installed
- Git installed
- Accounts created:
  - [Neon](https://neon.tech) - PostgreSQL database
  - [Cloudinary](https://cloudinary.com) - Image storage

## Step 1: Clone and Install (1 min)

```bash
# Clone the repository
git clone <your-repo-url>
cd berza-autica

# Install dependencies
npm install
```

## Step 2: Configure Environment (2 min)

Copy `.env.example` to `.env` and `.env.local`:

```bash
cp .env.example .env
cp .env.example .env.local
```

Edit both files and add your credentials:

```env
# Get from Neon dashboard
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-random-secret-here"

# Get from Cloudinary dashboard
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

## Step 3: Setup Databases (1 min)

```bash
# Push schema to PostgreSQL
npm run db:push

# Generate Prisma client
npm run db:generate

# Seed initial data (categories, config)
npm run db:seed
```

## Step 4: Run Development Server (1 min)

```bash
npm run dev
```

Visit http://localhost:3000

## Step 5: Create Test Accounts

### Create Admin Account

1. Go to http://localhost:3000/auth/register
2. Register with:
   - Name: Admin User
   - Email: admin@test.com
   - Password: admin123

3. Update role in database:
```bash
# Connect to your Neon database and run:
UPDATE "Member" SET role = 'admin' WHERE email = 'admin@test.com';
```

### Create Seller Account

1. Register at http://localhost:3000/auth/register
2. Use:
   - Name: Test Seller
   - Email: seller@test.com
   - Password: seller123

### Create Buyer Account

1. Register at http://localhost:3000/auth/register
2. Use:
   - Name: Test Buyer
   - Email: buyer@test.com
   - Password: buyer123

## Step 6: Test the System

### As Seller:

1. Login as seller@test.com
2. Go to "Moji proizvodi"
3. Click "+ Novi proizvod"
4. Create a product:
   - Name: Test Product
   - Description: This is a test product
   - Price: 1000
   - Category: Elektronika
   - Image: https://via.placeholder.com/400
5. Submit

### As Buyer:

1. Logout and login as buyer@test.com
2. Browse products on home page
3. Click on the test product
4. Click "Dodaj u korpu"
5. Go to "Korpa"
6. Click "Kontaktiraj prodavca"
7. Send a message

### As Admin:

1. Logout and login as admin@test.com
2. Go to http://localhost:3000/admin/dashboard
3. View statistics
4. Go to "Konfiguracija"
5. Try changing a value
6. Go to "Članovi"
7. View all members

## Common Issues

### Database Connection Failed

- Check your DATABASE_URL is correct
- Verify Neon database is active

### Prisma Client Error

```bash
# Regenerate Prisma client
npm run db:generate
```

### Port Already in Use

```bash
# Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill
```

### Images Not Loading

- Verify Cloudinary credentials are correct
- Check image URLs are valid
- Try using placeholder: https://via.placeholder.com/400

## Next Steps

- Read [README.md](README.md) for full documentation
- Check [TESTING.md](TESTING.md) for testing guide
- See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment instructions

## Getting Help

If you encounter issues:

1. Check the error message in terminal
2. Check browser console for client errors
3. Verify all environment variables are set
4. Review database connection strings
5. Check Prisma schema is pushed: `npm run db:push`

## Development Tips

### Hot Reload

Next.js has hot reload enabled. Just save files and see changes instantly!

### Database Changes

When you modify `prisma/schema.prisma`:

```bash
npm run db:push
npm run db:generate
```

### View Database

```bash
# Open Prisma Studio
npx prisma studio
```

### Clear Cart

```bash
# In Prisma Studio, delete all CartItem records
```

### Reset Database

```bash
# Push schema (will reset data)
npm run db:push -- --force-reset

# Re-seed
npx tsx prisma/seed-simple.ts
```

## Production Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Generate new NEXTAUTH_SECRET
- [ ] Update NEXTAUTH_URL to production domain
- [ ] Enable database backups
- [ ] Set up monitoring
- [ ] Test all features
- [ ] Review security settings

Happy coding! 🚀

