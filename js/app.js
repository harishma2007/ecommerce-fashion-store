/* ===== Config ===== */
const API_BASE = 'https://ecommerce-fashion-store.onrender.com/api';

/* ===== State (kept in memory + localStorage for persistence across reloads) ===== */
let products = [];
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let token = localStorage.getItem('token') || null;
let currentUser = JSON.parse(localStorage.getItem('user') || 'null');
let activeCategory = '';
let selectedSizes = {}; // productId -> size

/* ===== DOM refs ===== */
const productGrid = document.getElementById('productGrid');
const catalogTitle = document.getElementById('catalogTitle');
const catalogCount = document.getElementById('catalogCount');
const emptyState = document.getElementById('emptyState');
const cartDrawer = document.getElementById('cartDrawer');
const drawerOverlay = document.getElementById('drawerOverlay');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const cartCountEl = document.getElementById('cartCount');
const toast = document.getElementById('toast');

/* ===== Helpers ===== */
function showToast(msg) {
  toast.textContent = msg;
  toast.hidden = false;
  setTimeout(() => (toast.hidden = true), 2200);
}

function formatPrice(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

/* ===== Fetch & render products ===== */
async function loadProducts(category = '', search = '') {
  try {
    const query = new URLSearchParams();
    if (category) query.set('category', category);
    if (search) query.set('search', search);
    products = await api(`/products?${query.toString()}`);
    renderProducts();
  } catch (err) {
    productGrid.innerHTML = '';
    emptyState.hidden = false;
    emptyState.textContent = `Could not load products. Is the backend running at ${API_BASE}?`;
  }
}

function renderProducts() {
  catalogTitle.textContent = activeCategory ? activeCategory : 'All pieces';
  catalogCount.textContent = `${products.length} item${products.length === 1 ? '' : 's'}`;
  emptyState.hidden = products.length !== 0;
  productGrid.innerHTML = products.map(productCardHTML).join('');
}

function productCardHTML(p) {
  const sizes = p.sizes || [];
  const selected = selectedSizes[p._id] || sizes[0] || '';
  const sizeChips = sizes
    .map(
      (s) =>
        `<button class="size-chip ${s === selected ? 'selected' : ''}" data-product="${p._id}" data-size="${s}">${s}</button>`
    )
    .join('');
  return `
    <article class="product-card">
      <div class="product-media">
        <div class="product-notch"></div>
        <img src="${p.image}" alt="${p.name}" loading="lazy" />
      </div>
      <div class="product-body">
        <p class="product-cat">${p.category}</p>
        <h3 class="product-name">${p.name}</h3>
        <p class="product-price">${formatPrice(p.price)}</p>
        <div class="size-row">${sizeChips}</div>
        <button class="add-to-bag" data-product="${p._id}" ${p.stock === 0 ? 'disabled' : ''}>
          ${p.stock === 0 ? 'Out of stock' : 'Add to bag'}
        </button>
      </div>
    </article>`;
}

productGrid.addEventListener('click', (e) => {
  const sizeBtn = e.target.closest('.size-chip');
  if (sizeBtn) {
    selectedSizes[sizeBtn.dataset.product] = sizeBtn.dataset.size;
    renderProducts();
    return;
  }
  const addBtn = e.target.closest('.add-to-bag');
  if (addBtn) {
    const product = products.find((p) => p._id === addBtn.dataset.product);
    addToCart(product, selectedSizes[product._id] || product.sizes[0]);
  }
});

/* ===== Category nav + search ===== */
document.getElementById('mainNav').addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (!link) return;
  e.preventDefault();
  document.querySelectorAll('.main-nav a').forEach((a) => a.classList.remove('active'));
  link.classList.add('active');
  activeCategory = link.dataset.cat;
  loadProducts(activeCategory, document.getElementById('searchInput').value.trim());
});

let searchTimer;
document.getElementById('searchInput').addEventListener('input', (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadProducts(activeCategory, e.target.value.trim()), 300);
});

/* ===== Cart ===== */
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

function addToCart(product, size) {
  const existing = cart.find((i) => i.productId === product._id && i.size === size);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      size,
      quantity: 1,
    });
  }
  saveCart();
  showToast(`${product.name} added to your bag`);
}

function renderCart() {
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);
  cartCountEl.textContent = count;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="cart-empty">Your bag is empty.</p>';
  } else {
    cartItemsEl.innerHTML = cart
      .map(
        (item, idx) => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" />
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p class="cart-item-meta">Size ${item.size} · ${formatPrice(item.price)}</p>
          <div class="cart-item-actions">
            <button class="qty-btn" data-idx="${idx}" data-action="dec">−</button>
            <span>${item.quantity}</span>
            <button class="qty-btn" data-idx="${idx}" data-action="inc">+</button>
            <button class="remove-link" data-idx="${idx}" data-action="remove">Remove</button>
          </div>
        </div>
      </div>`
      )
      .join('');
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  cartTotalEl.textContent = formatPrice(total);
}

cartItemsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const idx = Number(btn.dataset.idx);
  if (btn.dataset.action === 'inc') cart[idx].quantity += 1;
  if (btn.dataset.action === 'dec') cart[idx].quantity = Math.max(1, cart[idx].quantity - 1);
  if (btn.dataset.action === 'remove') cart.splice(idx, 1);
  saveCart();
});

function openCart() {
  cartDrawer.classList.add('open');
  drawerOverlay.hidden = false;
}
function closeCartDrawer() {
  cartDrawer.classList.remove('open');
  drawerOverlay.hidden = true;
}
document.getElementById('cartBtn').addEventListener('click', openCart);
document.getElementById('closeCart').addEventListener('click', closeCartDrawer);
drawerOverlay.addEventListener('click', () => {
  closeCartDrawer();
  closeAuthModal();
  closeCheckoutModal();
});

/* ===== Auth ===== */
const authModal = document.getElementById('authModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const accountPanel = document.getElementById('accountPanel');

function openAuthModal() {
  authModal.hidden = false;
  refreshAuthView();
}
function closeAuthModal() {
  authModal.hidden = true;
}
document.getElementById('accountBtn').addEventListener('click', openAuthModal);
document.getElementById('closeAuth').addEventListener('click', closeAuthModal);

document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    loginForm.hidden = btn.dataset.tab !== 'login';
    registerForm.hidden = btn.dataset.tab !== 'register';
  });
});

function refreshAuthView() {
  if (currentUser) {
    loginForm.hidden = true;
    registerForm.hidden = true;
    document.querySelector('.modal-tabs').hidden = true;
    accountPanel.hidden = false;
    document.getElementById('accountGreeting').textContent = `Signed in as ${currentUser.name} (${currentUser.email})`;
  } else {
    accountPanel.hidden = true;
    document.querySelector('.modal-tabs').hidden = false;
    loginForm.hidden = false;
    registerForm.hidden = true;
  }
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(loginForm);
  try {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
    });
    setSession(data);
    closeAuthModal();
    showToast(`Welcome back, ${data.name}`);
  } catch (err) {
    document.getElementById('loginError').textContent = err.message;
  }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(registerForm);
  try {
    const data = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: form.get('name'),
        email: form.get('email'),
        password: form.get('password'),
      }),
    });
    setSession(data);
    closeAuthModal();
    showToast(`Welcome, ${data.name}`);
  } catch (err) {
    document.getElementById('registerError').textContent = err.message;
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  token = null;
  currentUser = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  closeAuthModal();
  showToast('Signed out');
});

function setSession(data) {
  token = data.token;
  currentUser = { name: data.name, email: data.email, _id: data._id };
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(currentUser));
}

/* ===== Checkout ===== */
const checkoutModal = document.getElementById('checkoutModal');
function openCheckoutModal() {
  if (!currentUser) {
    closeCartDrawer();
    openAuthModal();
    showToast('Sign in first to check out');
    return;
  }
  if (cart.length === 0) {
    showToast('Your bag is empty');
    return;
  }
  checkoutModal.hidden = false;
}
function closeCheckoutModal() {
  checkoutModal.hidden = true;
}
document.getElementById('checkoutBtn').addEventListener('click', openCheckoutModal);
document.getElementById('closeCheckout').addEventListener('click', closeCheckoutModal);

document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const shippingAddress = {
    line1: form.get('line1'),
    city: form.get('city'),
    state: form.get('state'),
    pincode: form.get('pincode'),
    country: form.get('country'),
  };
  try {
    await api('/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: cart.map((i) => ({ productId: i.productId, size: i.size, quantity: i.quantity })),
        shippingAddress,
      }),
    });
    cart = [];
    saveCart();
    closeCheckoutModal();
    closeCartDrawer();
    showToast('Order placed — thank you!');
  } catch (err) {
    document.getElementById('checkoutError').textContent = err.message;
  }
});

/* ===== Mobile menu ===== */
document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('mainNav').classList.toggle('open');
});

/* ===== Init ===== */
renderCart();
loadProducts();
