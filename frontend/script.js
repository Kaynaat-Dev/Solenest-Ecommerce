/* ==========================================================================
   SOLENEST — SCRIPT.JS
   Organized into clear sections. Read the comments to understand the
   *logic*, not just what each line does.
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. PRODUCT DATA
   Now fetched from our Express + MongoDB backend instead of hardcoded.
   The backend runs locally at this address during development. When we
   deploy the site later, this is the ONE line we'll need to change.
-------------------------------------------------------------------------- */
const API_BASE_URL = "http://localhost:5000/api";

// Starts empty. Gets filled once fetchProducts() successfully loads data
// from MongoDB. We use `let` (not `const`) because we reassign it below.
let products = [];

/**
 * Fetches all products from the backend and reshapes each one into the
 * format our existing rendering code already expects:
 *  - MongoDB's `_id` (a string, e.g. "66a1f...") becomes `id`, so all the
 *    data-id attributes and cart logic further down keep working with
 *    minimal changes.
 *  - Backend's `numReviews` becomes `reviews` (the name our product card
 *    HTML was already written to use).
 */
async function fetchProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const data = await response.json();

    products = data.map((p) => ({
      id: p._id,
      name: p.name,
      category: p.category,
      price: p.price,
      rating: p.rating || 0,
      reviews: p.numReviews || 0,
      badge: p.stock === 0 ? "Out of Stock" : "",
      image: p.image,
      description: p.description,
      sizes: p.sizes || []
    }));

    renderFeatured();
    renderShop("all");
  } catch (error) {
    console.error("Failed to load products from server:", error);
    featuredGrid.innerHTML = `<p style="text-align:center; color: var(--color-text-muted); grid-column: 1/-1;">Could not load products. Make sure the backend server is running on http://localhost:5000</p>`;
    shopGrid.innerHTML = "";
  }
}

/* The block below (the old hardcoded array) is no longer used by the app.
   It's commented out rather than deleted so you can compare the old vs
   new data shape. Safe to delete entirely once you're comfortable.

const oldHardcodedProducts = [
  {
    id: 1,
    name: "Urban Runner Sneaker",
    category: "sneakers",
    price: 89.99,
    rating: 4.5,
    reviews: 128,
    badge: "New",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    description: "A versatile everyday sneaker built with a breathable knit upper and a cushioned sole for all-day comfort on the streets.",
    sizes: [38, 39, 40, 41, 42, 43]
  },
  {
    id: 2,
    name: "AeroFlex Running Shoe",
    category: "running",
    price: 109.99,
    rating: 5,
    reviews: 96,
    badge: "Best Seller",
    image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&q=80",
    description: "Engineered for speed. Lightweight foam midsole and responsive cushioning designed for long-distance runners.",
    sizes: [39, 40, 41, 42, 43, 44]
  },
  {
    id: 3,
    name: "Everyday Canvas Casual",
    category: "casual",
    price: 64.99,
    rating: 4,
    reviews: 74,
    badge: "",
    image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80",
    description: "A classic canvas silhouette that pairs with everything — relaxed, comfortable, and built for daily wear.",
    sizes: [37, 38, 39, 40, 41, 42]
  },
  {
    id: 4,
    name: "ProCourt Sports Trainer",
    category: "sports",
    price: 124.99,
    rating: 4.5,
    reviews: 152,
    badge: "Sale",
    image: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=600&q=80",
    description: "High-performance trainer with lateral support and shock-absorbing outsole, built for intense court sessions.",
    sizes: [40, 41, 42, 43, 44, 45]
  },
  {
    id: 5,
    name: "Blush Comfort Flats",
    category: "women",
    price: 74.99,
    rating: 4.5,
    reviews: 61,
    badge: "New",
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&q=80",
    description: "Soft, flexible, and elegant. Designed to keep you comfortable from morning meetings to evening walks.",
    sizes: [36, 37, 38, 39, 40]
  },
  {
    id: 6,
    name: "Heritage Leather Oxford",
    category: "men",
    price: 139.99,
    rating: 5,
    reviews: 88,
    badge: "",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80",
    description: "Premium leather craftsmanship meets modern comfort — a timeless formal shoe for the modern man.",
    sizes: [40, 41, 42, 43, 44, 45]
  },
  {
    id: 7,
    name: "Skyline High-Top Sneaker",
    category: "sneakers",
    price: 94.99,
    rating: 4,
    reviews: 45,
    badge: "",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80",
    description: "Bold high-top silhouette with reinforced ankle support and a chunky sole for standout street style.",
    sizes: [38, 39, 40, 41, 42, 43]
  },
  {
    id: 8,
    name: "TrailBlaze Running Shoe",
    category: "running",
    price: 114.99,
    rating: 4.5,
    reviews: 103,
    badge: "Sale",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
    description: "Rugged grip and durable build made for off-road trails, wet terrain, and unpredictable weather.",
    sizes: [39, 40, 41, 42, 43, 44]
  },
  {
    id: 9,
    name: "Cloudstep Slip-On Casual",
    category: "casual",
    price: 59.99,
    rating: 4,
    reviews: 39,
    badge: "New",
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80",
    description: "Effortless slip-on comfort with a memory-foam insole — perfect for quick errands and lazy weekends.",
    sizes: [37, 38, 39, 40, 41, 42]
  },
  {
    id: 10,
    name: "PowerFlex Training Shoe",
    category: "sports",
    price: 99.99,
    rating: 4.5,
    reviews: 71,
    badge: "",
    image: "https://images.unsplash.com/photo-1483721310020-03333e577078?w=600&q=80",
    description: "Stable base and flexible forefoot designed for weightlifting, HIIT, and cross-training sessions.",
    sizes: [40, 41, 42, 43, 44]
  },
  {
    id: 11,
    name: "Rose Trail Sneaker",
    category: "women",
    price: 84.99,
    rating: 5,
    reviews: 58,
    badge: "Best Seller",
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80",
    description: "A soft, cushioned sneaker with a feminine colorway, designed for walking, travel, and everyday errands.",
    sizes: [36, 37, 38, 39, 40, 41]
  },
  {
    id: 12,
    name: "Titan Street Boot",
    category: "men",
    price: 129.99,
    rating: 4,
    reviews: 34,
    badge: "",
    image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80",
    description: "Rugged street boot with a reinforced toe and durable sole, built to handle city and rough terrain alike.",
    sizes: [40, 41, 42, 43, 44, 45]
  }
];
*/

/* --------------------------------------------------------------------------
   2. DOM ELEMENT REFERENCES
   Grabbing all the elements we'll need once, at the top, instead of
   repeatedly calling document.getElementById() everywhere.
-------------------------------------------------------------------------- */
const header = document.getElementById("header");
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

const featuredGrid = document.getElementById("featuredGrid");
const shopGrid = document.getElementById("shopGrid");
const filterBar = document.getElementById("filterBar");

const productModal = document.getElementById("productModal");
const productModalContent = document.getElementById("productModalContent");
const closeProductModal = document.getElementById("closeProductModal");

const cartBtn = document.getElementById("cartBtn");
const cartCount = document.getElementById("cartCount");
const cartOverlay = document.getElementById("cartOverlay");
const cartSidebar = document.getElementById("cartSidebar");
const closeCart = document.getElementById("closeCart");
const cartItemsEl = document.getElementById("cartItems");
const cartEmptyMsg = document.getElementById("cartEmptyMsg");
const cartSubtotalEl = document.getElementById("cartSubtotal");
const cartTotalEl = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");

const newsletterForm = document.getElementById("newsletterForm");
const contactForm = document.getElementById("contactForm");

// --- Auth (Login/Register) elements ---
const loginBtn = document.getElementById("loginBtn");
const loginBtnText = document.getElementById("loginBtnText");
const authModal = document.getElementById("authModal");
const closeAuthModal = document.getElementById("closeAuthModal");
const loginTabBtn = document.getElementById("loginTabBtn");
const registerTabBtn = document.getElementById("registerTabBtn");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const loginError = document.getElementById("loginError");
const registerError = document.getElementById("registerError");

// --- Checkout elements ---
const checkoutModal = document.getElementById("checkoutModal");
const closeCheckoutModal = document.getElementById("closeCheckoutModal");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutTotalEl = document.getElementById("checkoutTotal");
const checkoutError = document.getElementById("checkoutError");

/* --------------------------------------------------------------------------
   3. MOBILE MENU (hamburger toggle)
-------------------------------------------------------------------------- */
hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("open");
  navLinks.classList.toggle("open");
});

// Close the mobile menu automatically when a nav link is tapped
navLinks.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("open");
    navLinks.classList.remove("open");
  });
});

/* --------------------------------------------------------------------------
   4. STAR RATING HELPER
   Converts a numeric rating (e.g. 4.5) into a string of star icons.
   Keeping this as its own function avoids repeating this logic in
   multiple places (product cards + product modal).
-------------------------------------------------------------------------- */
function getStarsHTML(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  let stars = "";

  for (let i = 0; i < fullStars; i++) stars += '<i class="fa-solid fa-star"></i>';
  if (hasHalfStar) stars += '<i class="fa-solid fa-star-half-stroke"></i>';
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) stars += '<i class="fa-regular fa-star"></i>';

  return stars;
}

/* --------------------------------------------------------------------------
   5. RENDERING PRODUCT CARDS
   One function builds the HTML for a single product card. We reuse this
   function for both the "Featured Products" strip and the full "Shop" grid
   instead of writing the markup twice.
-------------------------------------------------------------------------- */
function createProductCardHTML(product) {
  return `
    <div class="product-card" data-id="${product.id}">
      <div class="product-img-wrap">
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
        <img src="${product.image}" alt="${product.name}" />
      </div>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 class="product-name">${product.name}</h3>
        <div class="product-rating">
          ${getStarsHTML(product.rating)}
          <span>(${product.reviews})</span>
        </div>
        <div class="product-price">$${product.price.toFixed(2)}</div>
        <div class="product-actions">
          <button class="btn btn-view view-details-btn" data-id="${product.id}">View Details</button>
          <button class="btn btn-cart quick-add-btn" data-id="${product.id}">Add to Cart</button>
        </div>
      </div>
    </div>
  `;
}

// Featured section shows the first 4 products marked "Best Seller" or "New" first
function renderFeatured() {
  const featuredProducts = products.slice(0, 4);
  featuredGrid.innerHTML = featuredProducts.map(createProductCardHTML).join("");
}

// Shop section shows products filtered by category ("all" = everything)
function renderShop(filter = "all") {
  const filtered = filter === "all"
    ? products
    : products.filter((p) => p.category === filter);

  shopGrid.innerHTML = filtered.length
    ? filtered.map(createProductCardHTML).join("")
    : `<p style="grid-column: 1/-1; text-align:center; color: var(--color-text-muted);">No products found in this category.</p>`;
}

// NOTE: We no longer call renderFeatured()/renderShop() here directly.
// They now run automatically inside fetchProducts() once the data
// actually arrives from the backend (see the very bottom of this file
// for the fetchProducts() call that kicks everything off).

/* --------------------------------------------------------------------------
   6. FILTER BAR (Shop section category buttons)
-------------------------------------------------------------------------- */
filterBar.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return; // ignore clicks that aren't on a filter button

  // Update active button styling
  filterBar.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");

  renderShop(btn.dataset.filter);
});

// Clicking a category tile in the "Shop by Category" section jumps to
// the Shop section AND applies the matching filter automatically.
document.querySelectorAll(".category-card").forEach((card) => {
  card.addEventListener("click", () => {
    const category = card.dataset.category;
    document.getElementById("shop").scrollIntoView({ behavior: "smooth" });

    const matchingBtn = filterBar.querySelector(`[data-filter="${category}"]`);
    if (matchingBtn) matchingBtn.click();
  });
});

/* --------------------------------------------------------------------------
   7. PRODUCT DETAILS MODAL
   Uses "event delegation": instead of adding a click listener to every
   single "View Details" button (which would need re-attaching every time
   we re-render the grid), we listen once on the whole page and check
   what was actually clicked. This is a key vanilla-JS pattern.
-------------------------------------------------------------------------- */
let selectedSize = null;
let selectedQty = 1;

document.addEventListener("click", (e) => {
  const viewBtn = e.target.closest(".view-details-btn");
  if (viewBtn) {
    // NOTE: product.id is now MongoDB's _id — a STRING (e.g. "66a1f...")
    // not a number, so we compare it directly without Number() conversion.
    const product = products.find((p) => p.id === viewBtn.dataset.id);
    if (product) openProductModal(product);
  }
});

function openProductModal(product) {
  selectedSize = product.sizes[0]; // default to first available size
  selectedQty = 1;

  productModalContent.innerHTML = `
    <div class="product-modal-image">
      <img src="${product.image}" alt="${product.name}" />
    </div>
    <div class="product-modal-details">
      <span class="product-category">${product.category}</span>
      <h2>${product.name}</h2>
      <div class="product-rating">
        ${getStarsHTML(product.rating)}
        <span>(${product.reviews} reviews)</span>
      </div>
      <div class="product-price">$${product.price.toFixed(2)}</div>
      <p>${product.description}</p>

      <div>
        <label style="font-weight:600; font-size:0.9rem;">Select Size</label>
        <div class="size-options" id="sizeOptions">
          ${product.sizes.map((size) =>
            `<button class="size-btn ${size === selectedSize ? "selected" : ""}" data-size="${size}">${size}</button>`
          ).join("")}
        </div>
      </div>

      <div>
        <label style="font-weight:600; font-size:0.9rem;">Quantity</label>
        <div class="qty-selector" id="qtySelector">
          <button id="qtyMinus">−</button>
          <span id="qtyValue">1</span>
          <button id="qtyPlus">+</button>
        </div>
      </div>

      <button class="btn btn-primary" id="modalAddToCart" data-id="${product.id}">Add to Cart</button>
    </div>
  `;

  productModal.classList.add("active");

  // Size selection
  document.querySelectorAll(".size-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".size-btn").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedSize = Number(btn.dataset.size);
    });
  });

  // Quantity controls
  const qtyValueEl = document.getElementById("qtyValue");
  document.getElementById("qtyMinus").addEventListener("click", () => {
    if (selectedQty > 1) {
      selectedQty--;
      qtyValueEl.textContent = selectedQty;
    }
  });
  document.getElementById("qtyPlus").addEventListener("click", () => {
    selectedQty++;
    qtyValueEl.textContent = selectedQty;
  });

  // Add to cart from inside the modal (includes chosen size + quantity)
  document.getElementById("modalAddToCart").addEventListener("click", () => {
    addToCart(product.id, selectedSize, selectedQty);
    closeProductModalFn();
  });
}

function closeProductModalFn() {
  productModal.classList.remove("active");
}

closeProductModal.addEventListener("click", closeProductModalFn);
productModal.addEventListener("click", (e) => {
  if (e.target === productModal) closeProductModalFn(); // click outside modal box = close
});

/* --------------------------------------------------------------------------
   8. SHOPPING CART LOGIC
   Cart data is stored in localStorage so it survives a page refresh —
   this is still 100% frontend (browser storage), no server involved.
   Once we add a real backend later, this will be replaced by API calls.
-------------------------------------------------------------------------- */
let cart = JSON.parse(localStorage.getItem("solenest_cart")) || [];

function saveCart() {
  localStorage.setItem("solenest_cart", JSON.stringify(cart));
}

// "Quick add" buttons on product cards add the default size (first size) with qty 1
document.addEventListener("click", (e) => {
  const quickAddBtn = e.target.closest(".quick-add-btn");
  if (quickAddBtn) {
    const product = products.find((p) => p.id === quickAddBtn.dataset.id);
    if (product) addToCart(product.id, product.sizes[0], 1);
  }
});

function addToCart(productId, size, qty) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  // If this exact product + size combination is already in the cart, just increase quantity
  const existingItem = cart.find((item) => item.id === productId && item.size === size);

  if (existingItem) {
    existingItem.qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: size,
      qty: qty
    });
  }

  saveCart();
  updateCartUI();
  openCart(); // show the cart sidebar so the user gets instant feedback
}

function removeFromCart(productId, size) {
  cart = cart.filter((item) => !(item.id === productId && item.size === size));
  saveCart();
  updateCartUI();
}

function changeCartQty(productId, size, direction) {
  const item = cart.find((i) => i.id === productId && i.size === size);
  if (!item) return;

  item.qty += direction;
  if (item.qty <= 0) {
    removeFromCart(productId, size);
  } else {
    saveCart();
    updateCartUI();
  }
}

function updateCartUI() {
  // Update the small badge count on the navbar cart icon
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = totalItems;

  // Show/hide empty cart message
  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<p class="cart-empty-msg">Your cart is empty.</p>`;
    cartSubtotalEl.textContent = "$0.00";
    cartTotalEl.textContent = "$0.00";
    return;
  }

  // Build the list of cart item rows
  cartItemsEl.innerHTML = cart.map((item) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" />
      <div>
        <div class="cart-item-name">${item.name}</div>
        <div style="font-size:0.8rem; color:var(--color-text-muted);">Size: ${item.size}</div>
        <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
        <div class="cart-item-qty">
          <button class="cart-qty-minus" data-id="${item.id}" data-size="${item.size}">−</button>
          <span>${item.qty}</span>
          <button class="cart-qty-plus" data-id="${item.id}" data-size="${item.size}">+</button>
        </div>
      </div>
      <button class="cart-item-remove" data-id="${item.id}" data-size="${item.size}">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  `).join("");

  // Calculate subtotal and total (for now they're the same — shipping/tax logic comes with backend later)
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  cartTotalEl.textContent = `$${subtotal.toFixed(2)}`;
}

// Event delegation for quantity +/- and remove buttons inside the cart
// (needed because these buttons are re-created every time updateCartUI runs)
cartItemsEl.addEventListener("click", (e) => {
  const minusBtn = e.target.closest(".cart-qty-minus");
  const plusBtn = e.target.closest(".cart-qty-plus");
  const removeBtn = e.target.closest(".cart-item-remove");

  // NOTE: item.id is a string (MongoDB _id) now — only .size needs Number()
  if (minusBtn) changeCartQty(minusBtn.dataset.id, Number(minusBtn.dataset.size), -1);
  if (plusBtn) changeCartQty(plusBtn.dataset.id, Number(plusBtn.dataset.size), 1);
  if (removeBtn) removeFromCart(removeBtn.dataset.id, Number(removeBtn.dataset.size));
});

/* --------------------------------------------------------------------------
   9. CART SIDEBAR OPEN/CLOSE
-------------------------------------------------------------------------- */
function openCart() {
  cartSidebar.classList.add("active");
  cartOverlay.classList.add("active");
}

function closeCartFn() {
  cartSidebar.classList.remove("active");
  cartOverlay.classList.remove("active");
}

cartBtn.addEventListener("click", openCart);
closeCart.addEventListener("click", closeCartFn);
cartOverlay.addEventListener("click", closeCartFn);

// Checkout button — requires the user to be logged in AND have items
// in the cart. If not logged in, we redirect them to the auth modal
// instead of letting them proceed.
checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your cart is empty. Add some products first!");
    return;
  }

  if (!authToken) {
    alert("Please log in to place an order.");
    closeCartFn();
    openAuthModal();
    return;
  }

  // Pre-fill the shipping form's name field with the logged-in user's
  // name, as a small convenience — they can still edit it.
  document.getElementById("shipFullName").value = currentUser.name;

  // Show the current cart total at the top of the shipping form
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  checkoutTotalEl.textContent = `$${subtotal.toFixed(2)}`;

  closeCartFn();
  checkoutModal.classList.add("active");
});

/* --------------------------------------------------------------------------
   10. NEWSLETTER & CONTACT FORMS
   No backend yet, so we just prevent the default page reload and show
   a confirmation message. We'll connect these to a real API later.
-------------------------------------------------------------------------- */
newsletterForm.addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Thanks for subscribing to SoleNest updates!");
  newsletterForm.reset();
});

contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Thanks for reaching out! We'll get back to you soon.");
  contactForm.reset();
});

/* --------------------------------------------------------------------------
   10b. AUTHENTICATION (Login / Register)
   Handles opening/closing the auth modal, switching between the Login
   and Register tabs, and talking to our backend's /api/auth endpoints.

   We store the logged-in user's info + JWT token in localStorage under
   "solenest_token" and "solenest_user" so the login persists across
   page refreshes (same idea as how we persist the cart).
-------------------------------------------------------------------------- */

// Read any existing login session from a previous visit
let authToken = localStorage.getItem("solenest_token") || null;
let currentUser = JSON.parse(localStorage.getItem("solenest_user")) || null;

// Updates the navbar button: shows the user's first name if logged in,
// otherwise shows "Login".
function updateAuthUI() {
  if (currentUser) {
    loginBtnText.textContent = currentUser.name.split(" ")[0]; // first name only, keeps navbar tidy
  } else {
    loginBtnText.textContent = "Login";
  }
}
updateAuthUI(); // run once immediately on page load

// --- Open / close the auth modal ---
function openAuthModal() {
  authModal.classList.add("active");
}
function closeAuthModalFn() {
  authModal.classList.remove("active");
  // Clear any leftover error messages when the modal closes
  loginError.classList.remove("visible");
  registerError.classList.remove("visible");
}

loginBtn.addEventListener("click", () => {
  // If already logged in, clicking the button logs the user out instead
  // of opening the modal again. Simple beginner-friendly behavior for now.
  if (currentUser) {
    const confirmLogout = confirm(`Logged in as ${currentUser.name}. Log out?`);
    if (confirmLogout) logoutUser();
    return;
  }
  openAuthModal();
});

closeAuthModal.addEventListener("click", closeAuthModalFn);
authModal.addEventListener("click", (e) => {
  if (e.target === authModal) closeAuthModalFn();
});

// --- Tab switching (Login <-> Register) ---
function switchAuthTab(tab) {
  const isLogin = tab === "login";

  loginTabBtn.classList.toggle("active", isLogin);
  registerTabBtn.classList.toggle("active", !isLogin);

  loginForm.classList.toggle("hidden", !isLogin);
  registerForm.classList.toggle("hidden", isLogin);

  // Clear errors whenever switching tabs
  loginError.classList.remove("visible");
  registerError.classList.remove("visible");
}

loginTabBtn.addEventListener("click", () => switchAuthTab("login"));
registerTabBtn.addEventListener("click", () => switchAuthTab("register"));

// Small helper to display an error message inside a given <p> element
function showAuthError(element, message) {
  element.textContent = message;
  element.classList.add("visible");
}

// --- REGISTER ---
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  registerError.classList.remove("visible");

  const name = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Backend sends a "message" field describing what went wrong
      // (e.g. "An account with this email already exists")
      throw new Error(data.message || "Registration failed");
    }

    // Registration succeeded — for a smooth experience, switch the user
    // straight to the Login tab so they can log in with their new account.
    alert("Account created successfully! Please log in.");
    registerForm.reset();
    switchAuthTab("login");
  } catch (error) {
    showAuthError(registerError, error.message);
  }
});

// --- LOGIN ---
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.classList.remove("visible");

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    // Save the token + user info so the login persists across page reloads,
    // and so later steps (like Checkout) can attach this token to requests.
    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem("solenest_token", authToken);
    localStorage.setItem("solenest_user", JSON.stringify(currentUser));

    updateAuthUI();
    loginForm.reset();
    closeAuthModalFn();
    alert(`Welcome back, ${currentUser.name}!`);
  } catch (error) {
    showAuthError(loginError, error.message);
  }
});

// --- LOGOUT ---
function logoutUser() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem("solenest_token");
  localStorage.removeItem("solenest_user");
  updateAuthUI();
  alert("You have been logged out.");
}

/* --------------------------------------------------------------------------
   10c. CHECKOUT — Placing a Real Order
   Submits the cart + shipping info to the backend's protected
   POST /api/orders endpoint. The JWT token (saved at login) is attached
   in the "Authorization" header — this is how the backend knows WHICH
   user is placing the order, without us having to send the user's id
   directly (which could be faked).
-------------------------------------------------------------------------- */
function closeCheckoutModalFn() {
  checkoutModal.classList.remove("active");
  checkoutError.classList.remove("visible");
}

closeCheckoutModal.addEventListener("click", closeCheckoutModalFn);
checkoutModal.addEventListener("click", (e) => {
  if (e.target === checkoutModal) closeCheckoutModalFn();
});

checkoutForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  checkoutError.classList.remove("visible");

  // Build the "products" array the backend expects: for each cart item,
  // send the product's real MongoDB id, a snapshot of its name/price,
  // the chosen size, and the quantity.
  const orderProducts = cart.map((item) => ({
    product: item.id,
    name: item.name,
    price: item.price,
    size: item.size,
    quantity: item.qty,
  }));

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const shippingInfo = {
    fullName: document.getElementById("shipFullName").value.trim(),
    address: document.getElementById("shipAddress").value.trim(),
    city: document.getElementById("shipCity").value.trim(),
    phone: document.getElementById("shipPhone").value.trim(),
  };

  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // This is the key line that makes the request "authenticated" —
        // the backend's authMiddleware reads this header and verifies the token.
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ products: orderProducts, totalAmount, shippingInfo }),
    });

    const data = await response.json();

    if (!response.ok) {
      // A 401 here usually means the token expired — prompt the user to log in again
      if (response.status === 401) {
        throw new Error("Your session has expired. Please log in again.");
      }
      throw new Error(data.message || "Failed to place order");
    }

    // Order succeeded — clear the cart (order is now safely in the database)
    cart = [];
    saveCart();
    updateCartUI();

    checkoutForm.reset();
    closeCheckoutModalFn();
    alert(`Order placed successfully! Your order ID is ${data.order._id}`);
  } catch (error) {
    showAuthError(checkoutError, error.message);
  }
});

/* --------------------------------------------------------------------------
   11. CLOSE MODAL / CART WITH ESCAPE KEY (nice UX touch)
-------------------------------------------------------------------------- */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeProductModalFn();
    closeCartFn();
    closeAuthModalFn();
    closeCheckoutModalFn();
  }
});

/* --------------------------------------------------------------------------
   12. INITIALIZE ON PAGE LOAD
   Ensures the cart count badge is correct immediately, even if the user
   already had items saved in localStorage from a previous visit. Then
   we kick off the products fetch from the backend — this is what
   actually populates the Featured and Shop grids now.
-------------------------------------------------------------------------- */
updateCartUI();
fetchProducts();