const API_BASE = window.BACKEND_URL || window.location.origin;

// Helper function for API calls
async function apiCall(url, method = 'GET', body = null) {
  const options = {
    method,
    headers: {},
    credentials: 'include',
    mode: 'cors'
  };

  const token = localStorage.getItem('token');
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  let fullUrl = `${API_BASE}${url}`;

  // For GET requests, send data as query params
  if (method === 'GET' && body) {
    const params = new URLSearchParams(body).toString();
    fullUrl += (url.includes('?') ? '&' : '?') + params;
  } else if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(fullUrl, options);

    if (!response.ok) {
      console.error(`HTTP error ${response.status} for ${fullUrl}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    return {
      success: false,
      message: 'Network error. Please try again.'
    };
  }
}

// Register
async function register(name, email, password) {
  const result = await apiCall('/register', 'POST', { name, email, password });
  if (result.success && result.token) {
    localStorage.setItem('token', result.token);
  }
  return result;
}

// Login
async function login(email, password) {
  const result = await apiCall('/login', 'POST', { email, password });
  if (result.success && result.token) {
    localStorage.setItem('token', result.token);
  }
  return result;
}

// Get Profile
async function getProfile() {
  return await apiCall('/profile', 'GET');
}

// Logout
async function logout() {
  await apiCall('/logout', 'GET');
  localStorage.removeItem('token');
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  window.location.href = '/login.html';
}

// Check auth status and update navbar
async function checkAuthStatus() {
  const authLinks = document.getElementById('auth-links');
  const logoutLink = document.getElementById('logout-link');

  if (!authLinks || !logoutLink) return;

  try {
    const result = await apiCall('/profile', 'GET');
    if (result.success) {
      authLinks.style.display = 'none';
      logoutLink.style.display = 'block';
    } else {
      authLinks.style.display = 'block';
      logoutLink.style.display = 'none';
    }
  } catch {
    authLinks.style.display = 'block';
    logoutLink.style.display = 'none';
  }
}

// Fallback crypto data for Netlify frontend
const seedData = [
  {name: 'Bitcoin', symbol: 'BTC', price: 67540.23, image: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png', change24h: 2.45},
  {name: 'Ethereum', symbol: 'ETH', price: 3520.18, image: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', change24h: -1.23},
  {name: 'Solana', symbol: 'SOL', price: 148.92, image: 'https://cryptologos.cc/logos/solana-sol-logo.png', change24h: 5.67},
  {name: 'Cardano', symbol: 'ADA', price: 0.52, image: 'https://cryptologos.cc/logos/cardano-ada-logo.png', change24h: -0.89},
  {name: 'Polkadot', symbol: 'DOT', price: 7.84, image: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png', change24h: 3.21},
  {name: 'Chainlink', symbol: 'LINK', price: 18.45, image: 'https://cryptologos.cc/logos/chainlink-link-logo.png', change24h: -2.15},
  {name: 'Avalanche', symbol: 'AVAX', price: 42.30, image: 'https://cryptologos.cc/logos/avalanche-avax-logo.png', change24h: 4.78},
  {name: 'Polygon', symbol: 'MATIC', price: 0.74, image: 'https://cryptologos.cc/logos/polygon-matic-logo.png', change24h: -3.42},
  {name: 'Litecoin', symbol: 'LTC', price: 82.15, image: 'https://cryptologos.cc/logos/litecoin-ltc-logo.png', change24h: 1.05},
  {name: 'Uniswap', symbol: 'UNI', price: 9.65, image: 'https://cryptologos.cc/logos/uniswap-uni-logo.png', change24h: 6.33}
];

// Load all cryptocurrencies (Netlify uses local data)
function loadAllCrypto() {
  const container = document.getElementById('crypto-list');
  if (!container) return;

  const data = seedData.slice();
  renderCryptoList(container, {success: true, data: data});
}

// Load top gainers
function loadGainers() {
  const container = document.getElementById('crypto-list');
  if (!container) return;

  const gainers = seedData.slice().sort((a, b) => b.change24h - a.change24h);
  renderCryptoList(container, {success: true, data: gainers});
}

// Load new listings
function loadNewListings() {
  const container = document.getElementById('crypto-list');
  if (!container) return;

  const newListings = seedData.slice().sort(() => Math.random() - 0.5);
  renderCryptoList(container, {success: true, data: newListings});
}

// Add new cryptocurrency
async function addCrypto(cryptoData) {
  return await apiCall('/crypto', 'POST', cryptoData);
}

// Inject student project warning banner on every page
function injectWarningBanner() {
  if (document.getElementById('student-banner')) return;
  const banner = document.createElement('div');
  banner.id = 'student-banner';
  banner.className = 'student-banner';
  banner.innerHTML = `
    <div class="container banner-content">
      <span class="banner-icon">🎓</span>
      <span class="banner-text">This is a student project for educational purposes only. It is not affiliated with, endorsed by, or connected to Coinbase in any way.</span>
    </div>
  `;
  document.body.insertBefore(banner, document.body.firstChild);
}

// Inject footer disclaimer on every page
function injectFooterDisclaimer() {
  const footers = document.querySelectorAll('.footer');
  footers.forEach(footer => {
    if (footer.querySelector('.footer-disclaimer')) return;
    const disclaimer = document.createElement('p');
    disclaimer.className = 'footer-disclaimer';
    disclaimer.textContent = 'This is a demo project. Do not enter real personal information or financial data.';
    footer.appendChild(disclaimer);
  });
}

// Render crypto list
function renderCryptoList(container, result) {
  if (!result.success || !result.data || result.data.length === 0) {
    container.innerHTML = '<p class="loading">No cryptocurrencies found.</p>';
    return;
  }

  container.innerHTML = result.data.map(crypto => {
    const changeClass = crypto.change24h >= 0 ? 'positive' : 'negative';
    const changeSign = crypto.change24h >= 0 ? '+' : '';
    return `
      <div class="crypto-card">
        <img src="${crypto.image}" alt="${crypto.name}" onerror="this.src='https://via.placeholder.com/48'">
        <h3>${crypto.name}</h3>
        <p class="symbol">${crypto.symbol}</p>
        <p class="price">$${parseFloat(crypto.price).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        <p class="change ${changeClass}">${changeSign}${crypto.change24h}%</p>
      </div>
    `;
  }).join('');
}

// Auto-inject banner and footer disclaimer on every page
document.addEventListener('DOMContentLoaded', () => {
  injectWarningBanner();
  injectFooterDisclaimer();
});

