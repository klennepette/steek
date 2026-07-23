// Checkout cart logic
// Manages cart state in memory, renders to DOM, submits as form fields

const cart = [];

function formatPrice(amount) {
  return '€ ' + amount.toFixed(2).replace('.', ',');
}

function updateCartTotal() {
  const total = cart.reduce((s, item) => s + item.qty * item.price, 0);
  document.getElementById('cart-total-amount').textContent = formatPrice(total);

  const btn = document.getElementById('checkout-btn');
  btn.disabled = cart.length === 0;

  renderCartHiddenFields();
}

function renderCartHiddenFields() {
  // Remove old hidden inputs
  document.querySelectorAll('.cart-hidden-field').forEach(el => el.remove());

  const form = document.getElementById('cart-form');
  cart.forEach((item, i) => {
    const fields = {
      [`line_product_id_${i}`]: item.product_id || '',
      [`line_name_${i}`]:       item.name,
      [`line_qty_${i}`]:        item.qty,
      [`line_price_${i}`]:      item.price,
    };
    for (const [name, value] of Object.entries(fields)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      input.className = 'cart-hidden-field';
      form.appendChild(input);
    }
  });
}

function renderCart() {
  const container = document.getElementById('cart-items');
  const empty = document.getElementById('cart-empty');

  // Clear existing items (but not the empty message)
  container.querySelectorAll('.cart-item').forEach(el => el.remove());

  if (cart.length === 0) {
    if (empty) empty.style.display = '';
  } else {
    if (empty) empty.style.display = 'none';
    cart.forEach((item, i) => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-meta">${formatPrice(item.price)} / stuk${item.consignation ? ' · <span style="color:#d97706">consignatie</span>' : ''}</div>
        </div>
        <div class="cart-item-qty">
          <button type="button" class="qty-btn" onclick="changeQty(${i}, -1)">−</button>
          <span>${item.qty}</span>
          <button type="button" class="qty-btn" onclick="changeQty(${i}, 1)">+</button>
        </div>
        <div class="cart-item-total">${formatPrice(item.qty * item.price)}</div>
        <button type="button" class="cart-item-remove" onclick="removeItem(${i})">✕</button>
      `;
      container.appendChild(div);
    });
  }

  updateCartTotal();
}

function addToCart(productId, name, price, consignation) {
  const existing = cart.find(item => item.product_id == productId);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ product_id: productId, name, price: parseFloat(price), qty: 1, consignation });
  }
  renderCart();
}

function changeQty(index, delta) {
  cart[index].qty = Math.max(1, cart[index].qty + delta);
  renderCart();
}

function removeItem(index) {
  cart.splice(index, 1);
  renderCart();
}

// ── HTMX integration ──────────────────────────────────────────────────────────

// After HTMX loads search results, wire up click handlers
document.addEventListener('htmx:afterSwap', function(e) {
  if (e.detail.target.id !== 'search-results') return;

  const input = document.getElementById('scanner-input');
  const query = input.value.trim();

  // Check for exact match element (barcode/packetcode)
  const exactEl = document.getElementById('exact-match');
  if (exactEl) {
    addToCart(exactEl.dataset.productId, exactEl.dataset.name, exactEl.dataset.price, false);
    input.value = '';
    e.detail.target.innerHTML = '';
    input.focus();
    return;
  }

  // Wire up dropdown buttons
  document.querySelectorAll('.search-result-item').forEach(btn => {
    btn.addEventListener('click', () => {
      addToCart(btn.dataset.productId, btn.dataset.name, btn.dataset.price, false);
      input.value = '';
      e.detail.target.innerHTML = '';
      input.focus();
    });
  });

  // Enter key picks single result
  const results = document.querySelectorAll('.search-result-item');
  if (results.length === 1) {
    input.onkeydown = function(ev) {
      if (ev.key === 'Enter') {
        results[0].click();
        input.onkeydown = null;
      }
      if (ev.key === 'Escape') {
        input.value = '';
        e.detail.target.innerHTML = '';
        input.onkeydown = null;
      }
    };
  }
});

// Clear dropdown on Escape when no HTMX response pending
document.getElementById('scanner-input').addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    this.value = '';
    document.getElementById('search-results').innerHTML = '';
  }
});

// Auto-focus scanner input on page load
document.getElementById('scanner-input').focus();
