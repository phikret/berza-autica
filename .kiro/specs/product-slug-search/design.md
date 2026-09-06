# Product Slug Search - Design Document

## Overview

The product detail page fetches products using `/api/products?search={slug}`, but the GET /api/products handler only searches `name` and `description` fields in the WHERE clause OR conditions. This prevents the API from finding products by their slug, breaking the product detail lookup functionality.

## Bug Condition

**isBugCondition(input):**
```
input.search = product.slug AND
product.slug NOT IN (product.name OR product.description)
```

**Concrete Example:**
- Product: `{ id: "prod-123", slug: "vintage-chair", name: "Classic Chair", description: "A beautiful classic chair" }`
- Request: `GET /api/products?search=vintage-chair`
- Current Behavior: Returns empty results (bug)
- Because: "vintage-chair" doesn't match name or description

**Counterexample that triggers the bug:**
- `GET /api/products?search=vintage-chair` → returns 0 products
- `GET /api/products?search=vintage-camera` → returns 0 products

## Expected Behavior

**expectedBehavior(result) where C(X) is true:**
```
For all products where search = product.slug:
- Product MUST be included in results
- Response contains product with matching slug
```

**Concrete Example After Fix:**
- Request: `GET /api/products?search=vintage-chair`
- Expected Result: Returns product with slug="vintage-chair"

## Preservation Requirements

The fix is purely additive - no existing behavior should change.

**Preserved Behavior (¬C(X)):**
```
For all products where search ≠ slug:
- Search by name: matches remain unchanged
- Search by description: matches remain unchanged
- Search by partial strings: behavior unchanged
- Sorting: remains unchanged
- Pagination: remains unchanged
- Category filtering: remains unchanged
- Promoted products: remains unchanged
```

**Concrete Examples to Preserve:**
1. Search by name: `GET /api/products?search=Classic` → still returns "Classic Chair"
2. Search by description: `GET /api/products?search=beautiful` → still returns "Classic Chair"
3. Sorting: `GET /api/products?sort=price_asc` → order unchanged
4. Empty results: `GET /api/products?search=nonexistent` → still returns empty

## Implementation Details

**Change Location:** `d:\Work\source\berza-autica\app\api\products\route.ts`

**Current WHERE clause (lines 70-73):**
```typescript
if (search) {
  where.OR = [
    { name: { contains: search, mode: 'insensitive' } },
    { description: { contains: search, mode: 'insensitive' } },
  ]
}
```

**Fixed WHERE clause:**
```typescript
if (search) {
  where.OR = [
    { name: { contains: search, mode: 'insensitive' } },
    { description: { contains: search, mode: 'insensitive' } },
    { slug: { contains: search, mode: 'insensitive' } },
  ]
}
```

**Scope of Change:** Add single line to OR array - purely additive, no modifications to existing logic.

## Test Strategy

1. **Bug Condition Exploration Test** - Property-based test that searches by slug on UNFIXED code
   - Should FAIL on unfixed code (confirms bug exists)
   - Should PASS after fix (confirms bug is fixed)

2. **Preservation Tests** - Property-based tests for non-slug searches on UNFIXED code
   - Should PASS on unfixed code (captures baseline behavior)
   - Should PASS after fix (confirms no regressions)
