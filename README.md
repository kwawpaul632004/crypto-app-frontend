# Crypto Platform Frontend

Static HTML/CSS/JS frontend consuming backend API.

## Deploy to Netlify

1. **Drag `public/` folder** to Netlify dashboard
2. Update `public/js/config.js`:
```js
window.BACKEND_URL = 'https://your-render-backend.onrender.com';
```
3. Deploy complete

## Pages

- `index.html` - Home/crypto list
- `login.html` - Login
- `register.html` - Register
- `profile.html` - Profile (protected)
- `add-crypto.html` - Add crypto
- `crypto/gainers.html` - Top gainers
- `crypto/new.html` - New listings
