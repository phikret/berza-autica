# Implementation Plan

- [ ] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Products searchable by slug
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: For this deterministic bug, scope the property to the concrete failing case(s): searching by product slug should return the product
  - **Test Details from Bug Condition**:
    - Create test products with unique slugs (e.g., "vintage-chair", "modern-desk", "antique-lamp")
    - Call `GET /api/products?search=<slug>` for each product's slug
    - Assert that the returned products include the product with matching slug
    - Property: For all test products, searching by their slug returns them in results
  - **Bug Condition Scope**: input.search = product.slug AND slug NOT IN (product.name OR description)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing name/description search behavior unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - **Test Details from Preservation Requirements**:
    - Observe: `GET /api/products?search=Classic` returns products with "Classic" in name on unfixed code
    - Observe: `GET /api/products?search=beautiful` returns products with "beautiful" in description on unfixed code
    - Write property-based tests capturing these observed patterns:
      1. Search by name substring: returns all products where name contains search (case-insensitive)
      2. Search by description substring: returns all products where description contains search (case-insensitive)
      3. Combined search: returns products matching name OR description
  - **Non-Bug Condition Scope**: input.search ≠ slug OR (slug IN (name OR description))
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 2.1, 2.2_

- [ ] 3. Fix product slug search

  - [ ] 3.1 Implement the fix
    - Add slug field to the WHERE clause OR conditions in GET /api/products handler
    - File: `d:\Work\source\berza-autica\app\api\products\route.ts` (lines 70-73)
    - Change the OR array from 2 conditions (name, description) to 3 conditions (name, description, slug)
    - Add: `{ slug: { contains: search, mode: 'insensitive' } },` to the OR array
    - Ensure the slug condition uses same pattern: case-insensitive substring match
    - _Bug_Condition: search = product.slug AND slug NOT IN (name OR description)_
    - _Expected_Behavior: For all products where search = slug, product is included in results_
    - _Preservation: Name/description searches unchanged, sorting/pagination/filtering unchanged_
    - _Requirements: 1.1, 2.1, 2.2_

  - [ ] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Products searchable by slug
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - Verify all slug searches return matching products
    - _Requirements: 1.1_

  - [ ] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing name/description search behavior unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm name/description searches unchanged after fix
    - Confirm sorting/pagination behavior unchanged

- [ ] 4. Checkpoint - Ensure all tests pass
  - Verify bug condition exploration test passes (confirms fix works)
  - Verify preservation tests pass (confirms no regressions)
  - Verify API still respects sorting, pagination, category filtering
  - All tests green - bug is fixed and preserved behavior is intact
