# Product Slug Lookup Bugfix Design

## Overview

The product detail page (`/products/[slug]`) fetches products using `/api/products?search={slug}`, but the API endpoint only searches the `name` and `description` fields. This causes product lookups to fail when navigating directly to a product via its slug URL (e.g., `/products/143-vw-buba-zksa8y`), even though the product exists in the database with a matching slug. The fix will add slug-based search to the API endpoint while maintaining full backwards compatibility with existing name/description search functionality.

## Glossary

- **Bug_Condition (C)**: When the search parameter matches a product's slug field but no products match in the name/description fields
- **Property (P)**: The API should return the product with the matching slug as if it were found by name or description search
- **Preservation**: All existing search functionality by name and description must continue to work exactly as before
- **slug**: A URL-friendly unique identifier for a product (e.g., "143-vw-buba-zksa8y")
- **GET /api/products**: The endpoint that searches and filters products
- **OR condition**: Prisma query condition that matches if any of the OR clauses evaluate to true

## Bug Details

### Bug Condition

The bug manifests when a user navigates to a product using its slug URL or when the product detail page attempts to fetch a product by slug. The `GET /api/products` endpoint is either not including the slug field in its search criteria, or the product detail page is using an incorrect fetch method.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { search: string }
  OUTPUT: boolean
  
  RETURN EXISTS product WHERE product.slug = input.search
         AND product.name NOT CONTAINS input.search (case-insensitive)
         AND product.description NOT CONTAINS input.search (case-insensitive)
         AND fetchedProducts.length = 0
END FUNCTION
```

### Examples

**Example 1 - Direct Slug Lookup (Current Bug)**
- URL: `/products/143-vw-buba-zksa8y`
- Query: `GET /api/products?search=143-vw-buba-zksa8y`
- Product in DB: `{ id: "123", slug: "143-vw-buba-zksa8y", name: "VW Buba", description: "Classic car..." }`
- Current Result: Empty products array (product not found)
- Expected Result: Product is returned in the results

**Example 2 - Slug with Numbers at Start**
- URL: `/products/456-bmw-x5`
- Query: `GET /api/products?search=456-bmw-x5`
- Product in DB: `{ id: "456", slug: "456-bmw-x5", name: "BMW X5", description: "Luxury SUV..." }`
- Current Result: Empty products array
- Expected Result: Product is returned

**Example 3 - Edge Case: Slug Partially Matches Description**
- URL: `/products/789-rare-part`
- Query: `GET /api/products?search=789-rare-part`
- Product in DB: `{ id: "789", slug: "789-rare-part", name: "Engine Component", description: "This is a rare part..." }`
- Current Result: Empty or incorrect product (searching "789-rare-part" finds "rare" in description but not the full string)
- Expected Result: Exact product with matching slug is returned

**Example 4 - Preservation: Search by Product Name**
- Query: `GET /api/products?search=BMW`
- Product in DB: `{ slug: "456-bmw-x5", name: "BMW X5", description: "Luxury SUV..." }`
- Expected Result: Product should still be returned (existing functionality preserved)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Searching by product name must continue to work exactly as before
- Searching by text in product description must continue to work exactly as before
- Case-insensitive search must continue to work for all fields
- Pagination, sorting, and category filtering must work correctly with slug search
- Promoted products must display correctly when searched by slug
- All other query parameters (categoryId, sort, page, limit) must continue to work

**Scope:**
All search queries that do NOT use a slug as the search parameter should be completely unaffected by this fix. This includes:
- Text searches matching product names
- Text searches matching product descriptions
- Empty search queries (returning all products)
- Searches combined with category filters
- All sorting and pagination operations

## Hypothesized Root Cause

Based on the bug description, the most likely issue is:

1. **Incomplete Search Fields**: The `GET /api/products` endpoint's WHERE clause only searches the `name` and `description` fields, excluding the `slug` field entirely
   - The `where.OR` condition in the route handler only includes name and description
   - The slug field exists in the database with a unique index but is not included in search logic
   - Product detail page relies on slug search but the API never implemented this feature

2. **Frontend Fetch Strategy**: The product detail page uses a generic search query instead of a dedicated slug lookup
   - The page calls `/api/products?search={slug}` instead of a dedicated slug endpoint
   - It then filters client-side for `p.slug === params.slug`, which fails when no results are returned from the search
   - This suggests slug search was intended but not implemented on the backend

3. **Missing Direct Slug Endpoint**: There's no dedicated endpoint for fetching a product by its slug
   - The API architecture requires all product lookups to go through the general search endpoint
   - This means slug support must be integrated into the existing search logic

## Correctness Properties

Property 1: Bug Condition - Product Lookup by Slug

_For any_ search query where the search parameter exactly matches a product's slug field, the fixed GET /api/products endpoint SHALL return that product in the results, regardless of whether the slug matches the product's name or description.

**Validates: Requirements 2.1, 2.2**

Property 2: Preservation - Existing Search Functionality

_For any_ search query that does NOT match the exact slug of any product, the fixed endpoint SHALL produce exactly the same results as the original endpoint, preserving all existing search behavior for name, description, category filtering, sorting, and pagination.

**Validates: Requirements 3.1, 3.2, 3.3**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `d:\Work\source\berza-autica\app\api\products\route.ts`

**Function**: `GET` handler in the products route

**Specific Changes**:

1. **Expand Search Fields in WHERE Clause**: Add slug to the OR conditions
   - Current OR logic: searches name and description only
   - Updated OR logic: add slug field to the search conditions
   - Impact: Minimal - extends the existing OR array with one additional condition

2. **Exact Match vs. Partial Match Strategy**: Determine how to handle slug matching
   - Slugs are unique and typically used for exact matching
   - Names/descriptions use "contains" for partial matching
   - Solution: Add slug with contains for consistency, or add as primary exact-match condition
   - Recommendation: Use `contains` for consistency with existing search behavior

3. **Query Optimization**: Ensure the query remains performant
   - The Product model already has an index on the slug field (`@@index([slug])`)
   - Adding slug to the OR condition will leverage the existing index
   - No new database indexes needed

4. **Preserve Backwards Compatibility**: Ensure existing search parameters continue working
   - The change is purely additive: adding a new field to the OR conditions
   - No existing conditions are removed or modified
   - The change maintains the same search semantics (case-insensitive, contains-based)

5. **Frontend Considerations**: No changes required
   - The product detail page already expects slug matching behavior
   - Current implementation has the right intent, just the backend doesn't deliver it
   - After fix, the page will find products by slug without modification

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that search for products by slug when the slug doesn't match the product name or description. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **Slug-Only Lookup Test**: Create a product with slug "123-unique-slug" and name "Common Product", then search by slug "123-unique-slug" (will fail on unfixed code)
2. **Numeric Slug Prefix Test**: Create a product with slug "456-bmw-x5" and name "BMW X5", then search by "456-bmw-x5" (will fail on unfixed code because "456" doesn't match name or description)
3. **Slug Without Name Match**: Create a product with slug "789-part-xyz" and name "Engine Component", then search by "789-part-xyz" (will fail on unfixed code)
4. **Edge Case: Special Characters in Slug**: Create a product with slug "000-test-prod", then search by "000-test-prod" (will fail on unfixed code)

**Expected Counterexamples**:
- Product search returns empty array when searching by slug
- Possible causes: slug field not included in search WHERE clause, incorrect OR condition logic, slug field indexing issue

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds (search parameter matches a slug), the fixed function produces the expected behavior (returns the product).

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := GET /api/products?search=input.slug (on fixed code)
  ASSERT result.products.length > 0
  ASSERT result.products.some(p => p.slug === input.slug)
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold (search parameter does not match a slug, or matches name/description), the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  original_result := GET /api/products?search=input (on unfixed code)
  fixed_result := GET /api/products?search=input (on fixed code)
  ASSERT original_result.products = fixed_result.products
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain (various product names, descriptions, search terms)
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-slug searches
- It verifies pagination and sorting still work correctly

**Test Plan**: Observe behavior on UNFIXED code for searches by name and description, then write property-based tests capturing that exact behavior across many scenarios.

**Test Cases**:
1. **Name Search Preservation**: Verify searching by product name continues to return the same results before and after fix
2. **Description Search Preservation**: Verify searching by words in description continues to work identically
3. **Empty Search Preservation**: Verify searching with empty string continues to return all products
4. **Category Filter Preservation**: Verify category filtering works the same with and without slug in search logic
5. **Pagination Preservation**: Verify pagination parameters (page, limit) work identically
6. **Sort Preservation**: Verify sorting (price_asc, price_desc, recent) works identically
7. **Case Insensitivity Preservation**: Verify case-insensitive search still works for all fields

### Unit Tests

- Test that exact slug match returns the correct product
- Test that slug search works when slug contains numbers (e.g., "123-product")
- Test that slug search works when slug contains hyphens and special patterns
- Test that slug search is case-insensitive (if applicable)
- Test that partial slug matches work (e.g., searching "123" should find "123-product")
- Test that non-existent slugs return empty results
- Test that slug search combined with category filter works correctly
- Test that slug search respects the isActive flag

### Property-Based Tests

- Generate random product data with various slug patterns and verify slug search returns the product
- Generate random search queries and verify name/description search behavior is unchanged
- Test that slug search combined with pagination returns the correct subset of results
- Test that all sorting options work with slug search (recent, price_asc, price_desc)
- Verify that inactive products are not returned even when slug matches

### Integration Tests

- Test full product detail page flow: navigate to `/products/[slug]` and verify product loads
- Test that slug search works for all product categories
- Test switching between different product slugs on the detail page
- Test that promoted products are returned correctly when searched by slug
- Test that seller information loads correctly for products found by slug search
