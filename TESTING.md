# Testing Guide

## Manual Testing Checklist

### Authentication Flow

- [ ] Register new user
  - Navigate to `/auth/register`
  - Fill in name, email, password
  - Verify account is created
  - Check default balance is 0

- [ ] Login
  - Navigate to `/auth/login`
  - Enter credentials
  - Verify redirect to home page
  - Check session is maintained

- [ ] Logout
  - Click logout in profile
  - Verify redirect to home
  - Check session is cleared

### Product Management

- [ ] Create Product (Free Tier)
  - Login as seller
  - Navigate to `/seller/products/new`
  - Fill in product details
  - Add at least 1 image URL
  - Submit form
  - Verify product appears in dashboard
  - Check no tokens were deducted (first 15 free)

- [ ] Create Product (Paid)
  - Create 15 products
  - Try to create 16th product
  - Verify 10 tokens are deducted
  - Check balance is updated

- [ ] Edit Product
  - Go to seller dashboard
  - Click on product
  - Update details
  - Verify changes are saved

- [ ] Delete Product
  - Go to seller dashboard
  - Delete a product
  - Confirm deletion
  - Verify product is removed

### Shopping Cart

- [ ] Add to Cart
  - Browse products as buyer
  - Click "Add to cart"
  - Verify item appears in cart
  - Check items are grouped by seller

- [ ] Remove from Cart
  - Go to cart page
  - Click remove on an item
  - Verify item is removed

- [ ] Cannot Add Own Product
  - Login as seller
  - Try to add own product to cart
  - Verify error message

### Messaging

- [ ] Send Message
  - Go to product detail
  - Click "Contact seller"
  - Send a message
  - Verify message appears

- [ ] Receive Message
  - Login as seller
  - Check messages page
  - Verify new conversation appears
  - Reply to message

- [ ] Message with Product Links
  - Send message from cart
  - Verify product links are included

### Token Balance

- [ ] Top Up Balance
  - Go to profile page
  - Enter amount
  - Click "Add tokens"
  - Verify balance increases

- [ ] View Transaction History
  - Check profile page
  - Verify all transactions are listed
  - Check amounts are correct

- [ ] Insufficient Balance
  - Set balance to 0
  - Try to create 16th product
  - Verify error message

### Product Promotion

- [ ] Promote Product
  - Have at least 300 tokens
  - Go to seller dashboard
  - Click "Promote" on a product
  - Confirm payment
  - Verify product is promoted
  - Check 300 tokens deducted

- [ ] Promotion Limit
  - Promote 3 products
  - Try to promote 4th
  - Verify error message

- [ ] Promoted Products Display
  - Go to home page
  - Verify promoted products appear first
  - Check yellow highlight

### Subscriptions

- [ ] Subscribe to Seller
  - View a seller's product
  - Subscribe to seller
  - Verify subscription is created

- [ ] Unsubscribe
  - Go to subscriptions page
  - Unsubscribe from seller
  - Verify subscription is removed

- [ ] Cannot Subscribe to Self
  - Try to subscribe to own account
  - Verify error message

### Admin Panel

- [ ] Access Admin Dashboard
  - Login as admin user
  - Navigate to `/admin/dashboard`
  - Verify stats are displayed

- [ ] Update Configuration
  - Go to `/admin/config`
  - Change a config value
  - Save changes
  - Verify value is updated

- [ ] Manage Members
  - Go to `/admin/members`
  - Deactivate a member
  - Verify member status changes
  - Reactivate member

### Search and Browse

- [ ] Search Products
  - Enter search query
  - Verify results match query

- [ ] Filter by Category
  - Select a category
  - Verify only products in that category show

- [ ] View Product Details
  - Click on a product
  - Verify all details are displayed
  - Check images load correctly

## API Testing with Postman/Thunder Client

### Setup

1. Import environment variables
2. Get auth token by logging in
3. Use token in Authorization header

### Test Endpoints

#### Authentication
```
POST /api/auth/register
POST /api/auth/[...nextauth]
```

#### Products
```
GET /api/products
POST /api/products
GET /api/products/[id]
PATCH /api/products/[id]
DELETE /api/products/[id]
POST /api/products/[id]/promote
```

#### Cart
```
GET /api/cart
POST /api/cart
DELETE /api/cart/[itemId]
```

#### Messages
```
GET /api/messages
POST /api/messages
GET /api/messages/[conversationId]
```

#### Balance
```
GET /api/balance
POST /api/balance/topup
```

#### Admin
```
GET /api/admin/stats
GET /api/admin/config
PUT /api/admin/config
GET /api/admin/members
PATCH /api/admin/members/[memberId]
```

## Performance Testing

### Load Testing

Use tools like Apache Bench or k6:

```bash
# Test home page
ab -n 1000 -c 10 http://localhost:3000/

# Test API endpoint
ab -n 1000 -c 10 http://localhost:3000/api/products
```

### Database Performance

Monitor query times:
- Product listing should load < 500ms
- Cart operations < 200ms
- Message sending < 300ms

## Security Testing

- [ ] SQL Injection - Try malicious input in forms
- [ ] XSS - Try script tags in text fields
- [ ] CSRF - Verify tokens are required
- [ ] Authentication - Try accessing protected routes without login
- [ ] Authorization - Try accessing other users' data

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers

## Responsive Design

Test on:
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

## Known Issues

Document any bugs found during testing here.

## Test Data

### Sample Users

```
Admin:
- Email: admin@example.com
- Password: admin123

Seller:
- Email: seller@example.com
- Password: seller123

Buyer:
- Email: buyer@example.com
- Password: buyer123
```

### Sample Products

Create products in different categories with various prices to test sorting and filtering.

## Automated Testing (Future)

Consider adding:
- Jest for unit tests
- Playwright for E2E tests
- Cypress for integration tests

