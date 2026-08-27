# Stillward — Ecommerce Client Pitch Prototype

## Short design plan
1. **Brand concept:** Stillward, a fictional home-and-lifestyle shop focused on useful objects and quieter rooms.
2. **Target customer:** design-conscious apartment and home owners who prefer natural materials and restrained forms.
3. **Palette:** warm paper `#f4f0e8`, soft surface `#fffdf8`, charcoal `#25231f`, deep olive `#405246`, clay accent `#b56543`.
4. **Heading font:** Newsreader.
5. **Body font:** DM Sans.
6. **Photography:** warm natural light, pale wood, ceramics, linen, muted interiors.
7. **Product cards:** image-led, nearly borderless, restrained badges, explicit stock text.
8. **Buttons:** compact pill shape, deep olive primary, dark outline secondary.
9. **Spacing/density:** editorial but not sparse; product grids remain commercially dense.
10. **Signature detail:** one offset clay-colored “room line” around campaign imagery.
11. **Deliberately avoided:** gradients, glass cards, floating blobs, fake awards, SaaS-style feature grids.
12. **Prototype disclaimer:** brand, products, inventory, pricing, reviews, policies, order numbers, and transactions are demo content.

## Site map
- `index.html` — editorial homepage
- `shop.html` — live search, filters, sort, items-per-page, pagination, quick view
- `product.html?id=1` — dynamic product detail page
- `cart.html` — quantity, remove, promo code, totals
- `checkout.html` — validation and safe payment placeholder
- `order-confirmation.html` — generated fictional order confirmation
- `about.html` — brand story and materials direction
- `contact.html` — validated support form with success state
- `faq.html` — searchable Bootstrap accordion FAQ
- `reviews.html` — rating/product filters, sorting, load more
- `wishlist.html` — persistent saved products
- `account.html` — login/register and authenticated-account integration mock
- `shipping.html` — shipping policy mock
- `returns.html` — returns policy mock

## Shared assets
- `assets/css/styles.css` — design system and responsive styling
- `assets/js/products.js` — 24 demo products
- `assets/js/store.js` — shared header/footer, cart, wishlist, quick view, localStorage
- `assets/js/shop.js` — catalog state, URL params, filters, sorting, pagination
- `assets/js/product.js` — dynamic product detail rendering
- `assets/js/cart.js` — cart page interactions
- `assets/js/checkout.js` — validation and demo order creation
- additional small page scripts for reviews, FAQ, contact, wishlist, and order confirmation

## Demo interactions to try
1. Open `index.html`.
2. Search from the header or choose a category.
3. Filter/sort the catalog and change items per page.
4. Open Quick view, save a product, and add it to cart.
5. Open a product detail page using `product.html?id=7`.
6. Change quantities in the cart and try promo code `PITCH10`.
7. Complete checkout with fictional form data; no real payment data is requested.
8. Review the generated order confirmation.
9. Open Wishlist, Reviews, FAQ, About, Contact, Shipping, and Returns.

## Image sources
The prototype uses remote photography from Unsplash photo download URLs. Source intent and attribution context were selected from public Unsplash results; no image files are redistributed inside this project.

## Production handoff notes
- Replace `window.DEMO_PRODUCTS` with ecommerce API data.
- Replace localStorage cart/wishlist with authenticated server-side state when required.
- Replace the checkout placeholder with a payment provider such as Stripe, Shopify, or another PCI-compliant flow.
- Connect contact/newsletter forms to real backend endpoints.
- Add real tax, fulfillment, inventory, shipping, account, transactional email, and analytics integrations.
