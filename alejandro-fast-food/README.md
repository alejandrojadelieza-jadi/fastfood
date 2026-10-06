# Alejandro Fast Food - Touchscreen POS Kiosk

A Jollibee-style self-order kiosk built with plain HTML, CSS and JavaScript (no frameworks, no backend). Payments are simulated.

## Files
- `index.html` - page structure and all screens
- `style.css` - purple and gold light theme, kiosk-sized buttons
- `script.js` - product data, cart, payment logic, receipt

## Run
Open `index.html` in any modern browser. An internet connection is needed for the food photos (loremflickr.com) and the Baloo 2 font. Without it, a plate icon shows in place of each photo.

## Flow
Welcome -> Dine In / Take Out -> Item Selection -> Order Summary -> Payment Method -> Processing -> Payment Successful -> Receipt -> New Transaction

## Customize
Edit the `PRODUCTS` array at the top of `script.js`:
- `name`, `price` - shown on the card, cart and receipt
- `cat` - one of the names in `CATS`
- `kw` - keywords used to find the photo; replace the image URL in `render()` to use your own images

## Notes
- Transaction numbers (TXN-2026-00001) and order numbers (A-001) come from a counter saved in `localStorage`, with an in-memory fallback.
- Cash payments reject blank, invalid, negative and insufficient amounts. QR and card payments pay the exact total.
- Starting a new transaction clears the cart, payment data and receipt.
