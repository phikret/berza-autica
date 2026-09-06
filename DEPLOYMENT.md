# Deployment Guide

## Deploying to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier works)
- Neon PostgreSQL database
- MongoDB Atlas database
- Cloudinary account

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/berza-autica.git
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next

### Step 3: Configure Environment Variables

In Vercel project settings, add these environment variables:

```
DATABASE_URL=your-neon-postgresql-url
MONGODB_URI=your-mongodb-atlas-url
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generate-random-secret-here
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Visit your deployed app!

### Step 5: Initialize Database

After first deployment, run the seed script:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Run seed command
vercel env pull .env.production
npx tsx prisma/seed-simple.ts
```

## Post-Deployment

### Database Migrations

When you update the Prisma schema:

```bash
# Push schema changes
npx prisma db push

# Generate new client
npx prisma generate

# Commit and push
git add .
git commit -m "Update database schema"
git push
```

Vercel will automatically redeploy.

### Monitoring

- Check Vercel dashboard for deployment logs
- Monitor database usage in Neon and MongoDB Atlas
- Check Cloudinary usage

### Custom Domain (Optional)

1. Go to Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update `NEXTAUTH_URL` environment variable

## Troubleshooting

### Build Errors

Check Vercel build logs for specific errors. Common issues:
- Missing environment variables
- TypeScript errors
- Prisma client not generated

### Database Connection Issues

- Verify DATABASE_URL is correct
- Check Neon database is active
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

### Authentication Issues

- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Clear browser cookies and try again

## Scaling

### Free Tier Limits

- Vercel: 100GB bandwidth/month
- Neon: 3GB storage, 100 hours compute
- MongoDB Atlas: 512MB storage
- Cloudinary: 25GB storage, 25GB bandwidth

### Upgrade Path

When you exceed free tier:
1. Upgrade Vercel to Pro ($20/month)
2. Upgrade Neon to Scale plan ($19/month)
3. Upgrade MongoDB Atlas to M10 ($57/month)
4. Upgrade Cloudinary to Plus ($99/month)

## Backup Strategy

### Database Backups

**PostgreSQL (Neon):**
- Automatic daily backups included
- Manual backup: Use Neon dashboard

**MongoDB Atlas:**
- Configure automated backups in Atlas
- Export collections manually if needed

### Code Backups

- GitHub serves as primary backup
- Tag releases: `git tag v1.0.0 && git push --tags`

## Security Checklist

- [ ] All environment variables are set
- [ ] NEXTAUTH_SECRET is strong and random
- [ ] Database credentials are secure
- [ ] API keys are not exposed in client code
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled (future enhancement)
- [ ] SSL/HTTPS is enforced

## Performance Optimization

### Recommended Vercel Settings

- Enable Edge Functions for API routes
- Configure caching headers
- Use Image Optimization (built-in)
- Enable compression

### Database Optimization

- Add indexes for frequently queried fields (already done)
- Monitor slow queries
- Use connection pooling (Neon provides this)

## Monitoring & Analytics

### Recommended Tools

- **Vercel Analytics**: Built-in, free
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Mixpanel**: User analytics

## Support

For issues:
1. Check Vercel deployment logs
2. Review database logs in Neon/MongoDB
3. Check browser console for client errors
4. Review this deployment guide

## Next Steps

After successful deployment:
1. Test all features in production
2. Set up monitoring and alerts
3. Configure custom domain
4. Add analytics
5. Plan for scaling

