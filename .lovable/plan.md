# Next step: make the core shopper flow genuinely premium

Goal: turn the current working skeleton into a polished, end-to-end shopping experience that feels like a real Indian girls-first fashion + beauty app.

## What we'll ship in this phase

### 1. Product page overhaul (highest impact)
- Replace the hardcoded `SIZES = ["S","M","L","XL"]` with sizes pulled from actual `product_variants`.
- Build a real gallery from `product_images`:
  - thumbnail strip
  - swipeable mobile gallery
  - image zoom on desktop
  - variant-specific images switch automatically when colour changes
- Update price, SKU and availability live when colour/size changes.
- Add a size-guide modal that reads `products.size_chart`.
- Add "Complete the look" section using products in the same mood/category.
- Improve "Similar products" with mood/category scoring instead of first 3 items.
- Keep the sticky mobile Buy/Add-to-Bag bar and make it smarter.
- Fix remaining "Esko" branding in titles and copy.

### 2. Cart & checkout polish
- Make sure cart/checkout item images resolve correctly from `image_key` / `product_images`.
- Add coupon support to checkout (apply valid coupon, show discount, respect `min_cart` and `max_discount`).
- Add a saved-address selector for signed-in users (pull from `addresses` table).
- Keep guest checkout working.

### 3. Wishlist & account touches
- Verify wishlist toggle works everywhere the heart appears.
- Add "Move to bag" and "Remove" actions on the wishlist page.
- Link profile sub-pages from `/account` so users can reach orders, addresses, etc.

### 4. Discovery pages
- Add mood/occasion/price filters to `/shop` with a mobile bottom-sheet.
- Keep `/search` fast and add recent-searches + trending chips.
- Wire `/category/$slug` so category pages actually filter products.

### 5. End-to-end verification
- Place a test order on the preview and confirm:
  - variant stock decrements
  - order confirmation page renders
  - tracking timeline appears
  - no console errors on product / cart / checkout / order pages
  - mobile 320–1440px looks good

## What we're NOT doing in this phase
- Admin features (already started; will come back later).
- Real payment gateway integration (COD / UPI / card remain mock-select).
- Real-time tracking beyond the existing timeline.

## Success criteria
- A shopper can: pick a mood → browse → view a product → switch colour/size → see correct images/price → add to bag → apply a coupon → check out → see order confirmation → view tracking.
- Product page feels premium: smooth gallery, live variant updates, size guide, related picks.
- No "Esko" copy, no broken images, no console errors.
