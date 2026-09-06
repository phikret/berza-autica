# Bugfix Requirements Document

## Introduction

The product detail page fails to load products when accessed via URL slug (e.g., `/products/143-vw-buba-zksa8y`). The product page makes a search API request using the slug as a search parameter, but the API endpoint searches only against product name and description fields, not the slug field. Since the slug is not indexed in the search, products cannot be found, resulting in a "Product not found" error even though the product exists in the database.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user navigates to a product detail page via the slug URL (e.g., `/products/143-vw-buba-zksa8y`) THEN the system calls `/api/products?search={slug}` which searches product name and description fields

1.2 WHEN the API search does not match the slug against any product name or description THEN the system returns an empty products array

1.3 WHEN the products array is empty THEN the product detail page displays "Proizvod nije pronađen" (Product not found) error, even though the product exists in the database with that slug

### Expected Behavior (Correct)

2.1 WHEN a user navigates to a product detail page via the slug URL THEN the system SHALL retrieve the product by matching the slug against the product's slug field

2.2 WHEN the product lookup by slug finds a match in the database THEN the system SHALL return the complete product record including all fields (id, name, slug, description, price, images, seller, category)

2.3 WHEN the product is successfully retrieved THEN the product detail page SHALL display all product information without error

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user searches for products using the search API with a search term THEN the system SHALL CONTINUE TO search against product name and description fields as before

3.2 WHEN a user filters products by category via the categoryId parameter THEN the system SHALL CONTINUE TO return filtered results as before

3.3 WHEN a user sorts products by price or date THEN the system SHALL CONTINUE TO apply the correct sorting as before

3.4 WHEN a user accesses the product listing page (home page) with multiple products THEN the system SHALL CONTINUE TO display all products correctly as before
