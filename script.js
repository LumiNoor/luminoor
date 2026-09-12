/* ==========================================================================
   LumiNoor — site logic
     1. PRODUCTS  — the product catalog (name, photo, color tag, price).
    2. Rendering — turns PRODUCTS into the product grid.
    3. Cart + WhatsApp — customers can add shades to a local cart, then send
             the complete selection to WhatsApp for confirmation.
     4. Tools     — the Cost Per Day calculator on the homepage. The Shade
                     Finder quiz lives on its own page (tools/shade-finder.html)
                     with its own copy of PRODUCTS — see that file's comments.
   ========================================================================== */


/* ============================ WHATSAPP CONFIG ============================
   WHATSAPP_NUMBER must be digits-only, international format (country code
   + number, no "+", no spaces, no leading 0). If you change this, also
   update the copy inside tools/shade-finder.html and products/*.html.
   ========================================================================== */
const WHATSAPP_NUMBER = "923372110771";
const CART_STORAGE_KEY = "luminoor-cart";

function buildWhatsAppLink(message) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
}

function getCart() {
  try {
    const cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
    return Array.isArray(cart) ? cart : [];
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function findProductById(productId) {
  return PRODUCTS.find((product) => product.id === productId) || null;
}

function cartItemCount() {
  return getCart().reduce((total, item) => total + Number(item.qty || 0), 0);
}

function addToCart(productId, qty = 1) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: productId, qty });
  }

  saveCart(cart);
  updateCartButton();
  if (typeof renderCartPage === "function") {
    renderCartPage();
  }
}

function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
  updateCartButton();
  if (typeof renderCartPage === "function") {
    renderCartPage();
  }
}

function updateCartQuantity(productId, delta) {
  const cart = getCart();
  const item = cart.find((entry) => entry.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId);
    return;
  }

  saveCart(cart);
  updateCartButton();
  if (typeof renderCartPage === "function") {
    renderCartPage();
  }
}

function clearCart() {
  saveCart([]);
  updateCartButton();
  if (typeof renderCartPage === "function") {
    renderCartPage();
  }
}

function cartSubtotal() {
  return getCart().reduce((total, item) => {
    const product = findProductById(item.id);
    if (!product) return total;
    return total + product.sale * Number(item.qty || 0);
  }, 0);
}

function buildCartWhatsAppMessage() {
  const cart = getCart();

  if (!cart.length) {
    return "Hi LumiNoor! I would like to place an order, but my cart is empty. Please help me choose the right shades.";
  }

  const lines = [
    "Hi LumiNoor! I'd like to place this order:",
    ""
  ];

  cart.forEach((item, index) => {
    const product = findProductById(item.id);
    if (!product) return;
    const itemTotal = product.sale * Number(item.qty || 0);
    lines.push(`${index + 1}. ${product.name} x ${item.qty} — Rs.${itemTotal.toLocaleString()}.00 PKR`);
  });

  const total = cartSubtotal();
  lines.push(`Total: Rs.${total.toLocaleString()}.00 PKR`);
  lines.push("");
  lines.push("Please confirm availability and delivery details.");
  return lines.join("\n");
}

function updateCartButton() {
  const cartButton = document.getElementById("cartButton");
  if (!cartButton) return;

  const badge = cartButton.querySelector(".cart-badge");
  const count = cartItemCount();
  if (badge) {
    badge.textContent = count;
    badge.hidden = count === 0;
  }
}

function animateCartButton() {
  const cartButton = document.getElementById("cartButton");
  if (!cartButton) return;

  cartButton.classList.remove("bump");
  void cartButton.offsetWidth;
  cartButton.classList.add("bump");
  setTimeout(() => cartButton.classList.remove("bump"), 320);
}

function markAddedButton(productId) {
  document.querySelectorAll(`.buy-btn[data-id="${productId}"]`).forEach((button) => {
    button.classList.remove("added");
    void button.offsetWidth;
    button.classList.add("added");
    const label = button.querySelector(".btn-label");
    if (label) {
      label.textContent = "Added";
    }
    setTimeout(() => {
      button.classList.remove("added");
      const text = button.querySelector(".btn-label");
      if (text) text.textContent = "Add to cart";
    }, 900);
  });
}

// Works out the folder containing index.html, so links built at runtime
// are correct whether the site lives at the root of a domain or in a
// GitHub Pages project subfolder like /LumiNoor/.
function siteBaseUrl() {
  const path = window.location.pathname.replace(/(?:index|product)\.html$/, '');
  const normalized = path.endsWith('/') ? path : path + '/';
  return `${window.location.origin}${normalized}`;
}

// Message used for a specific product's direct WhatsApp action. The detail
// page URL keeps the selected lens available when the conversation opens.
function productMessage(product) {
  const productUrl = `${siteBaseUrl()}product.html?id=${product.id}`;
  return `Hi LumiNoor! I'd like to order ${product.name} (Rs.${product.sale}). Is it in stock?\n\n${productUrl}`;
}

const GENERAL_MESSAGE = "Hi LumiNoor! I have a question about your lenses.";
const TRACK_ORDER_MESSAGE = "Hi LumiNoor! Could you help me track my order?";


/* ================================ PRODUCTS ================================
  image  -> file inside /assets, shown as the card photo
//  swatch -> [light, deep] hex pair for the small color dot on each card,
//              hand-picked to match the lens tone in that product's photo
  color  -> color family used by the shade finder
  ========================================================================== */
const KOREAN_PRODUCTS = [
  {
    id: "greyhoney",
    name: "Grey Honey",
    image: "Shades/1-GreyHoney.jpg",
    color: "grey",
    swatch: ["#D9C9A6", "#8A7550"],
    price: 1499,
    sale: 999,
  },
  {
    id: "greybrown",
    name: "Grey Brown",
    image: "Shades/2-GreyBrown.jpg",
    color: "grey",
    swatch: ["#9C9C96", "#46433F"],
    price: 1499,
    sale: 999,
  },
  {
    id: "dollshadowglittergrey",
    name: "Doll Shadow Glitter Grey",
    image: "Shades/3-DollShadowGlitterGrey.jpg",
    color: "grey",
    swatch: ["#A6A7A9", "#3D3E40"],
    price: 1499,
    sale: 999,
  },
  {
    id: "dollgreen",
    name: "Doll Green",
    image: "Shades/4-DollGreen.jpg",
    color: "green",
    swatch: ["#AFCBAC", "#4E7A5B"],
    price: 1499,
    sale: 999,
  },
  {
    id: "dollglittergrey",
    name: "Doll Glitter Grey",
    image: "Shades/5-DollGlitterGrey.jpg",
    color: "grey",
    swatch: ["#A2A3A5", "#403F41"],
    price: 1499,
    sale: 999,
  },
  {
    id: "dollbrown",
    name: "Doll Brown",
    image: "Shades/6-DollBrown.jpg",
    color: "brown",
    swatch: ["#C79A63", "#5C3A1E"],
    price: 1499,
    sale: 999,
  },
  {
    id: "dollblue",
    name: "Doll Blue",
    image: "Shades/7-DollBlue.jpg",
    color: "blue",
    swatch: ["#93BEDD", "#2C5A82"],
    price: 1499,
    sale: 999,
  },
  {
    id: "dollblackkorean",
    name: "Doll Black Korean",
    image: "Shades/8-DollBlackKorean.jpg",
    color: "black",
    swatch: ["#75757A", "#1C1C1E"],
    price: 1499,
    sale: 999,
  },
  {
    id: "chocolatedollbrown",
    name: "Chocolate Doll Brown",
    image: "Shades/9-ChocolateDollBrown.jpg",
    color: "brown",
    swatch: ["#B07E4C", "#4A2C14"],
    price: 1499,
    sale: 999,
  },
  {
    id: "sydneygreen",
    name: "Sydney Green",
    image: "Shades/10-SydneyGreen.jpg",
    color: "green",
    swatch: ["#A7C4AA", "#446B5E"],
    price: 1499,
    sale: 999,
  },
  {
    id: "russianblue",
    name: "Russian Blue",
    image: "Shades/11-RussianBlue.jpg",
    color: "blue",
    swatch: ["#90A9D5", "#2D4F7F"],
    price: 1499,
    sale: 999,
  },
  {
    id: "miragegreen",
    name: "Mirage Green",
    image: "Shades/12-MirageGreen.jpg",
    color: "green",
    swatch: ["#B9D2B4", "#4E765B"],
    price: 1499,
    sale: 999,
  },
  {
    id: "emberrose",
    name: "Ember Rose",
    image: "Shades/13-EmberRose.jpg",
    color: "brown",
    swatch: ["#D69E9A", "#7A4B3F"],
    price: 1499,
    sale: 999,
  },
  {
    id: "diamondgray",
    name: "Diamond Gray",
    image: "Shades/14-DiamondGray.jpg",
    color: "grey",
    swatch: ["#D3D3D5", "#59616A"],
    price: 1499,
    sale: 999,
  },
  {
    id: "diamondbrown",
    name: "Diamond Brown",
    image: "Shades/15-DiamondBrown.jpg",
    color: "brown",
    swatch: ["#CFA67A", "#5B3822"],
    price: 1499,
    sale: 999,
  },
  {
    id: "diamondblue",
    name: "Diamond Blue",
    image: "Shades/16-DiamondBlue.jpg",
    color: "blue",
    swatch: ["#9BB9D8", "#2D5F8A"],
    price: 1499,
    sale: 999,
  },
  {
    id: "dnabrown",
    name: "DNA Brown",
    image: "Shades/17-DNABrown.jpg",
    color: "brown",
    swatch: ["#C49768", "#4B2C14"],
    price: 1499,
    sale: 999,
  },
  {
    id: "anglegrey",
    name: "Angel Grey",
    image: "Shades/18-AngelGrey.jpg",
    color: "grey",
    swatch: ["#D0D0D3", "#5D6069"],
    price: 1499,
    sale: 999,
  },
  {
    id: "auragreen",
    name: "Aura Green",
    image: "Shades/19-AuraGreen.jpg",
    color: "green",
    swatch: ["#BED8AF", "#5D7A5C"],
    price: 1499,
    sale: 999,
  },
];

const DAHAB_GOLD_SHADES = [
  ["Lumirere Blue", "1-LumirereBlue.png", "blue"],
  ["Lumirere Hazel", "2-LumirereHazel.jpg", "brown"],
  ["Lumirere Gray", "3-LumirereGray.jpg", "grey"],
  ["Solitaire", "4-Solitaire.jpg", "grey"],
  ["Sabrin Gray Green", "5-SabrinGrayGreen.jpg", "green"],
  ["Sabrin Soul", "6-SabrinSoul.jpg", "brown"],
  ["Sabrin Gray", "7-SabrinGray.jpg", "grey"],
  ["Swarovski", "8-Swarovski.jpg", "grey"],
  ["Sun Kiss", "9-SunKiss.jpg", "brown"],
  ["Medusa", "10-Medusa.jpg", "green"],
  ["Diamond", "11-Diamond.jpg", "brown"],
  ["Topaz", "12-Topaz.jpg", "brown"],
  ["Sky", "13-Sky.jpg", "blue"],
  ["Cat Eye", "14-CatEye.jpg", "brown"],
  ["Creamy", "15-Creamy.jpg", "brown"],
  ["Lumirere Green", "16-LumirereGreen.jpg", "green"],
  ["Lumirere Brown", "17-LumirereBrown.jpg", "brown"],
  ["Ice", "18-Ice.jpg", "grey"],
  ["Aqua", "20-Aqua.jpg", "green"],
  ["Caramel", "21-Caramel.jpg", "brown"],
  ["Tiffany Blue", "22-TiffanyBlue.jpg", "blue"],
  ["Hind", "23-Hind.jpg", "grey"],
  ["Kaf", "41-Kaf.jpg", "brown"],
  ["Smokey", "42-Smokey.jpg", "grey"],
].map(([name, image, color]) => ({
  id: `dahab-${name.toLowerCase().replace(/\s+/g, "-")}`,
  name,
  image: `Shades/${image}`,
  color,
  swatch: ["#D0C4B8", "#5C514A"],
  price: 1499,
  sale: 999,
  category: "gold",
}));

const DAHAB_PLATINUM_PRODUCTS = [
  {
    id: "alaska",
    name: "Alaska",
    category: "platinum",
    image: "Shades/P1-Alaska.png",
    color: "blue",
    swatch: ["#B0D8E9", "#3C7FA1"],
    price: 1499,
    sale: 999,
  },
  {
    id: "hawaii",
    name: "Hawaii",
    category: "platinum",
    image: "Shades/P4-Hawaii.png",
    color: "green",
    swatch: ["#B5D9B0", "#557A52"],
    price: 1499,
    sale: 999,
  },
  {
    id: "khaki",
    name: "Khaki",
    category: "platinum",
    image: "Shades/P8-Khaki.png",
    color: "brown",
    swatch: ["#B5A16D", "#5E4E2B"],
    price: 1499,
    sale: 999,
  },
  {
    id: "mentha",
    name: "Mentha",
    category: "platinum",
    image: "Shades/P5-Mentha.png",
    color: "green",
    swatch: ["#B7E6D8", "#4E8A77"],
    price: 1499,
    sale: 999,
  },
  {
    id: "olive",
    name: "Olive",
    category: "platinum",
    image: "Shades/P7-Olive.png",
    color: "green",
    swatch: ["#B8B77A", "#5F6932"],
    price: 1499,
    sale: 999,
  },
  {
    id: "perle",
    name: "Perle",
    category: "platinum",
    image: "Shades/P3-Perle.png",
    color: "grey",
    swatch: ["#D7D0CA", "#6F6B69"],
    price: 1499,
    sale: 999,
  },
  {
    id: "rain",
    name: "Rain",
    category: "platinum",
    image: "Shades/P6-Rain.png",
    color: "grey",
    swatch: ["#C9CEDA", "#5C6473"],
    price: 1499,
    sale: 999,
  },
];

const DAHAB_PRODUCTS = [...DAHAB_GOLD_SHADES, ...DAHAB_PLATINUM_PRODUCTS];

const PRODUCTS = [
  ...KOREAN_PRODUCTS.map((product) => ({ ...product, category: "korean" })),
  ...DAHAB_PRODUCTS,
];

const CURRENT_PAGE = document.body.dataset.page || "home";

function getPreviewCount() {
  if (window.innerWidth < 560) return 2;
  if (window.innerWidth < 980) return 3;
  return 4;
}

function getRandomProducts(products, count) {
  const shuffled = [...products];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled.slice(0, count);
}

function getPreviewProducts(products) {
  return getRandomProducts(products, getPreviewCount());
}

function getDahabPreviewProducts() {
  const count = getPreviewCount();
  if (count < 2) return getRandomProducts([...DAHAB_GOLD_SHADES, ...DAHAB_PLATINUM_PRODUCTS], count);

  const goldProduct = getRandomProducts(DAHAB_GOLD_SHADES, 1)[0];
  const platinumProduct = getRandomProducts(DAHAB_PLATINUM_PRODUCTS, 1)[0];
  const selected = [goldProduct, platinumProduct];
  const remaining = [...DAHAB_GOLD_SHADES, ...DAHAB_PLATINUM_PRODUCTS]
    .filter((product) => !selected.includes(product));

  return getRandomProducts([...selected, ...getRandomProducts(remaining, count - 2)], count);
}

/* ================================ RENDERING ================================ */

function cardHTML(p) {
  const collectionName = p.category === "gold" ? "Gold Collection" : "Platinum Collection";
  const displayName = ["home", "cart"].includes(CURRENT_PAGE) && p.category
    ? `${p.name} (${collectionName})`
    : p.name;

  return `
    <article class="card" id="${p.id}" data-id="${p.id}" data-name="${p.name.toLowerCase()}" data-color="${p.color}" tabindex="0" role="link" aria-label="View ${displayName}">
      <div class="card-media">
        <span class="badge-sale">Sale</span>
        <img src="${p.image}" alt="${p.name} colored contact lens" loading="lazy">
        <button class="buy-btn" type="button" data-id="${p.id}" data-action="add-to-cart">
          <span class="btn-label">Add to cart</span>
        </button>
      </div>
      <div class="card-body">
        <p class="name"><a href="product.html?id=${p.id}">${displayName}</a></p>
        <div class="price-row">
          <span class="was">Rs.${p.price.toLocaleString()}.00 PKR</span>
          <span class="now">Rs.${p.sale.toLocaleString()}.00 PKR</span>
        </div>
      </div>
    </article>`;
}

const grid = document.getElementById("grid");
const dahabGrids = document.querySelectorAll("#grid-dahab-gold, #grid-dahab-platinum");
const cartKoreanGrid = document.getElementById("cartKoreanGrid");
const cartDahabGrid = document.getElementById("cartDahabGrid");
const emptyState = document.getElementById("emptyState");
const resultsCount = document.getElementById("resultsCount");
const resultsTitle = document.getElementById("resultsTitle");
const filterClear = document.getElementById("filterClear");
const colorNav = document.getElementById("colorNav");

function buildNavigation() {
  if (!colorNav) return;

  colorNav.innerHTML = [
    `<a href="#shop" class="active">Shop</a>`,
    `<a href="#tools">Tools</a>`,
    `<a href="#faq">FAQ</a>`,
    `<a href="policies.html">Policies</a>`,
  ].join("");
}

function renderGrid() {
  if (!grid) return;

  let items = KOREAN_PRODUCTS;
  if (CURRENT_PAGE === "home") {
    items = getPreviewProducts(KOREAN_PRODUCTS);
  }
  if (CURRENT_PAGE === "dahab") {
    items = DAHAB_PRODUCTS;
  }

  grid.innerHTML = items.map(cardHTML).join("");

  const viewAllKorean = document.getElementById("viewAllKorean");
  if (viewAllKorean) {
    viewAllKorean.hidden = CURRENT_PAGE !== "home";
  }
}

function renderDahabGrid() {
  const goldGrid = document.getElementById("grid-dahab-gold");
  const platinumGrid = document.getElementById("grid-dahab-platinum");

  if (CURRENT_PAGE === "home") {
    const previewProducts = getDahabPreviewProducts();
    if (goldGrid) goldGrid.innerHTML = previewProducts.map(cardHTML).join("");
    if (platinumGrid) platinumGrid.innerHTML = "";
    const viewAllDahab = document.getElementById("viewAllDahab");
    if (viewAllDahab) viewAllDahab.hidden = false;
    return;
  }

  if (goldGrid) {
    goldGrid.innerHTML = DAHAB_GOLD_SHADES.map(cardHTML).join("");
  }
  if (platinumGrid) {
    platinumGrid.innerHTML = DAHAB_PLATINUM_PRODUCTS.map(cardHTML).join("");
  }

  const viewAllDahab = document.getElementById("viewAllDahab");
  if (viewAllDahab) viewAllDahab.hidden = true;
}

if (grid || dahabGrids.length) {
  buildNavigation();
  renderGrid();
  renderDahabGrid();
  window.addEventListener("resize", () => {
    renderGrid();
    renderDahabGrid();
  });
}

if (cartKoreanGrid || cartDahabGrid) {
  if (cartKoreanGrid) {
    cartKoreanGrid.innerHTML = getPreviewProducts(KOREAN_PRODUCTS).map(cardHTML).join("");
    attachBuyButtonListener(cartKoreanGrid);
  }
  if (cartDahabGrid) {
    cartDahabGrid.innerHTML = getDahabPreviewProducts().map(cardHTML).join("");
    attachBuyButtonListener(cartDahabGrid);
  }
}

/* ================================ FILTER + SEARCH ================================ */

let query = "";
function formatColorTitle() {
  if (CURRENT_PAGE === "dahab") return "Dahab lenses";
  return "Korean lenses";
}

function updateResultsTitle() {
  if (!resultsTitle) return;
  resultsTitle.textContent = formatColorTitle();
}

function applyFilters() {
  let visible = 0;
  document.body.classList.toggle("search-active", Boolean(query));
  document.querySelectorAll(".card").forEach((card) => {
    const matchesQuery = card.dataset.name.includes(query);
    const show = matchesQuery;
    card.style.display = show ? "" : "none";
    if (show) visible++;
  });
  resultsCount.textContent = `${visible} style${visible === 1 ? "" : "s"}`;
  emptyState.classList.toggle("show", visible === 0);
  updateResultsTitle();
}

const searchToggle = document.getElementById("searchToggle");
const searchField = document.getElementById("searchField");
const searchInput = document.getElementById("searchInput");

if (searchToggle) {
  searchToggle.addEventListener("click", () => {
    searchField.classList.toggle("open");
    if (searchField.classList.contains("open")) searchInput.focus();
  });
}

document.addEventListener("click", (event) => {
  if (!searchField?.classList.contains("open")) return;
  if (searchField.contains(event.target) || searchToggle?.contains(event.target)) return;
  searchField.classList.remove("open");
});

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    query = e.target.value.trim().toLowerCase();
    applyFilters();
  });
}

if (grid) applyFilters();

/* ================================ WHATSAPP BUY FLOW ================================ */

const toast = document.getElementById("toast");
const toastText = document.getElementById("toastText");
let toastTimer;

function showToast(text) {
  if (!toast || !toastText) return;
  toastText.textContent = text;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2000);
}

function openWhatsApp(message) {
  window.open(buildWhatsAppLink(message), "_blank", "noopener");
}

function attachBuyButtonListener(gridElement) {
  if (!gridElement) return;
  gridElement.addEventListener("click", (e) => {
    const btn = e.target.closest(".buy-btn");
    if (!btn) return;
    const product = PRODUCTS.find((p) => p.id === btn.dataset.id);
    if (!product) return;
    addToCart(product.id, 1);
    animateCartButton();
    markAddedButton(product.id);
    showToast(`${product.name} added to cart`);
  });
}

attachBuyButtonListener(grid);
dahabGrids.forEach(attachBuyButtonListener);

document.addEventListener("click", (event) => {
  const card = event.target.closest(".card[data-id]");
  if (!card || event.target.closest("a, button")) return;
  window.location.href = `product.html?id=${encodeURIComponent(card.dataset.id)}`;
});

document.addEventListener("keydown", (event) => {
  if (!event.target.matches(".card[data-id]") || !["Enter", " "].includes(event.key)) return;
  event.preventDefault();
  window.location.href = `product.html?id=${encodeURIComponent(event.target.dataset.id)}`;
});

function renderCartPage() {
  const cartItems = document.getElementById("cartItems");
  const cartEmpty = document.getElementById("cartEmpty");
  const cartSubtotalEl = document.getElementById("cartSubtotal");
  const cartTotalEl = document.getElementById("cartTotal");
  const checkoutButton = document.getElementById("checkoutCart");
  const clearCartButton = document.getElementById("clearCart");

  if (!cartItems) return;

  const cart = getCart();

  if (!cart.length) {
    cartItems.innerHTML = "";
    if (cartEmpty) cartEmpty.hidden = false;
    if (cartSubtotalEl) cartSubtotalEl.textContent = "Rs.0.00";
    if (cartTotalEl) cartTotalEl.textContent = "Rs.0.00";
    if (checkoutButton) checkoutButton.disabled = true;
    return;
  }

  if (cartEmpty) cartEmpty.hidden = true;
  const subtotal = cartSubtotal();
  if (cartSubtotalEl) cartSubtotalEl.textContent = `Rs.${subtotal.toLocaleString()}.00`;
  if (cartTotalEl) cartTotalEl.textContent = `Rs.${subtotal.toLocaleString()}.00`;
  if (checkoutButton) checkoutButton.disabled = false;

  cartItems.innerHTML = cart.map((item) => {
    const product = findProductById(item.id);
    if (!product) return "";
    return `
      <article class="cart-item" data-product-id="${product.id}">
        <div class="cart-item-image-wrap">
          <img src="${product.image}" alt="${product.name} colored contact lens" loading="lazy">
        </div>
        <div class="cart-item-details">
          <div>
            <h3>${product.name}</h3>
            <p>Rs.${product.sale.toLocaleString()}.00 PKR each</p>
          </div>
          <div class="cart-item-actions">
            <div class="quantity-box">
              <button type="button" data-qty-action="decrease" data-product-id="${product.id}" aria-label="Decrease quantity">−</button>
              <span>${item.qty}</span>
              <button type="button" data-qty-action="increase" data-product-id="${product.id}" aria-label="Increase quantity">+</button>
            </div>
            <button type="button" class="remove-item" data-remove-item="${product.id}">Remove</button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  cartItems.querySelectorAll("[data-qty-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.dataset.productId;
      const delta = button.dataset.qtyAction === "increase" ? 1 : -1;
      updateCartQuantity(productId, delta);
    });
  });

  cartItems.querySelectorAll("[data-remove-item]").forEach((button) => {
    button.addEventListener("click", () => {
      removeFromCart(button.dataset.removeItem);
    });
  });

  if (checkoutButton) {
    checkoutButton.onclick = (event) => {
      event.preventDefault();
      openWhatsApp(buildCartWhatsAppMessage());
    };
  }

  if (clearCartButton) {
    clearCartButton.onclick = (event) => {
      event.preventDefault();
      clearCart();
    };
  }
}

if (document.getElementById("cartItems") || document.getElementById("cartButton")) {
  updateCartButton();
  renderCartPage();
}

const contactLink = document.getElementById("waContactUs");
const trackOrderLink = document.getElementById("waTrackOrder");
if (contactLink) {
  contactLink.addEventListener("click", (e) => {
    e.preventDefault();
    openWhatsApp(GENERAL_MESSAGE);
  });
}
if (trackOrderLink) {
  trackOrderLink.addEventListener("click", (e) => {
    e.preventDefault();
    openWhatsApp(TRACK_ORDER_MESSAGE);
  });
}

/* ================================ TOOLS: COST PER DAY ================================ */

const calcPrice = document.getElementById("calcPrice");
const calcDays = document.getElementById("calcDays");
const calcResult = document.getElementById("calcResult");

function updateCalc() {
  const price = parseFloat(calcPrice.value) || 0;
  const days = parseFloat(calcDays.value) || 1;
  calcResult.textContent = (price / days).toFixed(2);
}
if (calcPrice && calcDays && calcResult) {
  calcPrice.addEventListener("input", updateCalc);
  calcDays.addEventListener("input", updateCalc);
  updateCalc();
}

/* ============================ PRODUCT REDIRECTS ============================
   Preview pages are opened by link crawlers, then send real visitors back to
   the matching product on the homepage.
   ========================================================================== */
const productPageMatch = window.location.pathname.match(/\/products\/([^/]+)\.html$/);
if (productPageMatch) {
  window.location.replace(`../index.html#${productPageMatch[1]}`);
}

/* ============================== SHADE FINDER ===============================
   The finder uses the same product list as the homepage and adds the ../ path
   needed when its page is inside the tools folder.
   ========================================================================== */
const finderProductGrid = document.getElementById("finderProductGrid");

if (finderProductGrid) {
  const finderProductCount = document.getElementById("finderProductCount");
  const finderResultLabel = document.getElementById("finderResultLabel");
  const finderResultBadge = document.getElementById("finderResultBadge");
  const finderResultImage = document.getElementById("finderResultImage");
  const finderResultShimmer = document.getElementById("finderResultShimmer");
  const finderPreviewImage = document.getElementById("finderPreviewImage");
  const finderResultSwatch = document.getElementById("finderResultSwatch");
  const finderResultName = document.getElementById("finderResultName");
  const finderResultOldPrice = document.getElementById("finderResultOldPrice");
  const finderResultPrice = document.getElementById("finderResultPrice");
  const finderResultBuy = document.getElementById("finderResultBuy");
  const questionOne = document.querySelector('[data-step="1"]');
  const questionTwo = document.querySelector('[data-step="2"]');
  const questionThree = document.querySelector('[data-step="3"]');
  let currentStep = "1";
  let quizAnswers = {};

  function selectedCategory() {
    return quizAnswers.collection === "dahab" ? "dahab" : quizAnswers.collection === "korean" ? "korean" : "";
  }

  function finderImage(product) {
    return `../${product.image}`;
  }

  function toneFamily(color) {
    if (color === "brown") return "warm";
    if (color === "blue" || color === "green") return "cool";
    return "neutral";
  }

  function lookCategory(product) {
    if (/glitter/i.test(product.name)) return "sparkly";
    if (["blue", "green", "black"].includes(product.color)) return "bold";
    return "natural";
  }

  function finderMessage(product) {
    return `Hi LumiNoor! I'd like to order ${product.name} (Rs.${product.sale}). Is it in stock?`;
  }

  function desiredLook() {
    if (quizAnswers.drama) {
      return quizAnswers.drama === "dramatic" ? "sparkly" : quizAnswers.drama === "noticeable" ? "bold" : "natural";
    }
    const occasionLooks = { daily: "natural", casual: "natural", mehndi: "natural", baraat: "bold", walima: "sparkly", photoshoot: "sparkly" };
    return occasionLooks[quizAnswers.occasion] || "";
  }

  function preferredTone() {
    const skinToneLooks = { fair: "warm", wheatish: "warm", deep: "cool" };
    return skinToneLooks[quizAnswers.skinTone] || "";
  }

  function collectionMatches(product) {
    const collection = selectedCategory();
    return !collection || product.category === collection || (collection === "dahab" && ["gold", "platinum"].includes(product.category));
  }

  function productScore(product, look, tone) {
    let score = 0;
    if (quizAnswers.colorPreference === product.color) score += 6;
    if (look && lookCategory(product) === look) score += 4;
    if (tone && toneFamily(product.color) === tone) score += 3;
    if (quizAnswers.occasion === "daily" && ["grey", "brown"].includes(product.color)) score += 2;
    if (quizAnswers.occasion === "mehndi" && ["brown", "green"].includes(product.color)) score += 2;
    if (["baraat", "walima", "photoshoot"].includes(quizAnswers.occasion) && ["blue", "green"].includes(product.color)) score += 2;
    if (quizAnswers.drama === "subtle" && !["blue", "green", "black"].includes(product.color)) score += 2;
    if (quizAnswers.drama === "dramatic" && ["blue", "green", "black"].includes(product.color)) score += 2;
    return score;
  }

  function pickBestMatch(look, tone) {
    return PRODUCTS.filter(collectionMatches)
      .sort((left, right) => productScore(right, look, tone) - productScore(left, look, tone))[0];
  }

  function matchingProducts() {
    const look = desiredLook();
    const tone = preferredTone();
    return PRODUCTS.filter(collectionMatches)
      .sort((left, right) => productScore(right, look, tone) - productScore(left, look, tone));
  }

  function renderFinderGrid() {
    let products = matchingProducts();
    if (quizAnswers.skinTone && quizAnswers.occasion && quizAnswers.drama) {
      const finalMatch = pickBestMatch(desiredLook(), preferredTone());
      products = products.filter((product) => product.id !== finalMatch.id).slice(0, 6);
    }
    finderProductCount.textContent = `${products.length} shade${products.length === 1 ? "" : "s"}`;
    finderProductGrid.innerHTML = products.map((product) => `
      <article class="card">
        <div class="card-media">
          <span class="badge-sale">Sale</span>
          <img src="${finderImage(product)}" alt="${product.name} colored contact lens" loading="lazy">
          <div class="swatch swatch-${product.id}"></div>
          <button class="buy-btn" type="button" data-id="${product.id}">Add to cart</button>
        </div>
        <div class="card-body">
          <p class="name"><a href="../index.html#${product.id}">${product.name}</a></p>
          <div class="price-row"><span class="was">Rs.${product.price.toLocaleString()}.00 PKR</span><span class="now">Rs.${product.sale.toLocaleString()}.00 PKR</span></div>
        </div>
      </article>`).join("");

    finderProductGrid.querySelectorAll(".buy-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const product = findProductById(button.dataset.id);
        if (!product) return;
        addToCart(product.id, 1);
        animateCartButton();
        markAddedButton(product.id);
        showToast(`${product.name} added to cart`);
      });
    });
  }

  function updateFinderMenu() {
    const progress = currentStep === "1" ? 20 : currentStep === "2" ? 40 : currentStep === "3" ? 60 : currentStep === "4" ? 80 : 100;
    document.getElementById("quizProgressBar").style.width = `${progress}%`;
    document.querySelectorAll(".quiz-question").forEach((question) => {
      question.classList.toggle("active", question.dataset.step === currentStep);
    });
  }

  function updateFinalMatch() {
    const hasAllAnswers = Boolean(quizAnswers.collection && quizAnswers.colorPreference && quizAnswers.skinTone && quizAnswers.occasion && quizAnswers.drama);
    if (!hasAllAnswers) {
      const previewProduct = matchingProducts()[0];
      if (previewProduct) {
        finderPreviewImage.src = finderImage(previewProduct);
        finderPreviewImage.alt = `Preview of ${previewProduct.name}`;
      }
      finderResultImage.hidden = true;
      finderResultShimmer.hidden = false;
      finderResultLabel.hidden = true;
      finderResultSwatch.hidden = true;
      finderResultBadge.hidden = true;
      finderResultName.textContent = "";
      finderResultOldPrice.textContent = "";
      finderResultPrice.textContent = "";
      finderResultBuy.hidden = true;
      return;
    }
    const product = pickBestMatch(desiredLook(), preferredTone());
    finderResultImage.src = finderImage(product);
    finderResultImage.alt = `${product.name} colored contact lens`;
    finderResultImage.hidden = false;
    finderResultShimmer.hidden = true;
    finderResultLabel.hidden = false;
    finderResultSwatch.className = `swatch swatch-${product.id}`;
    finderResultSwatch.hidden = false;
    finderResultBadge.hidden = false;
    finderResultName.textContent = product.name;
    finderResultOldPrice.textContent = `Rs.${product.price.toLocaleString()}.00 PKR`;
    finderResultPrice.textContent = `Rs.${product.sale.toLocaleString()}.00 PKR`;
    finderResultBuy.hidden = false;
    finderResultBuy.onclick = (event) => {
      event.preventDefault();
      addToCart(product.id, 1);
      animateCartButton();
      markAddedButton(product.id);
      showToast(`${product.name} added to cart`);
    };
  }

  function updateFinder() {
    renderFinderGrid();
    updateFinderMenu();
    updateFinalMatch();
  }

  function refreshSelectedOptions() {
    document.querySelectorAll(".quiz-option").forEach((option) => {
      const choiceKey = option.dataset.collection ? "collection" : option.dataset.colorPreference ? "colorPreference" : option.dataset.skinTone ? "skinTone" : option.dataset.occasion ? "occasion" : "drama";
      const choiceValue = option.dataset.collection || option.dataset.colorPreference || option.dataset.skinTone || option.dataset.occasion || option.dataset.drama;
      option.classList.toggle("selected", quizAnswers[choiceKey] === choiceValue);
    });
  }

  document.querySelectorAll(".quiz-option").forEach((button) => {
    button.addEventListener("click", () => {
      const choiceKey = button.dataset.collection ? "collection" : button.dataset.colorPreference ? "colorPreference" : button.dataset.skinTone ? "skinTone" : button.dataset.occasion ? "occasion" : "drama";
      const choiceValue = button.dataset.collection || button.dataset.colorPreference || button.dataset.skinTone || button.dataset.occasion || button.dataset.drama;
      quizAnswers[choiceKey] = quizAnswers[choiceKey] === choiceValue ? "" : choiceValue;
      if (choiceKey === "collection") {
        quizAnswers.colorPreference = "";
        quizAnswers.skinTone = "";
        quizAnswers.occasion = "";
        quizAnswers.drama = "";
        currentStep = quizAnswers.collection ? "2" : "1";
      }
      if (choiceKey === "colorPreference") {
        quizAnswers.skinTone = "";
        quizAnswers.occasion = "";
        quizAnswers.drama = "";
        currentStep = quizAnswers.colorPreference ? "3" : "2";
      }
      if (choiceKey === "skinTone") {
        quizAnswers.occasion = "";
        quizAnswers.drama = "";
        currentStep = quizAnswers.skinTone ? "4" : "3";
      }
      if (choiceKey === "occasion") {
        quizAnswers.drama = "";
        currentStep = quizAnswers.occasion ? "5" : "4";
      }
      if (choiceKey === "drama") currentStep = "5";
      refreshSelectedOptions();
      updateFinder();
    });
  });

  document.addEventListener("click", (event) => {
    const allChoicesSelected = quizAnswers.collection && quizAnswers.colorPreference && quizAnswers.skinTone && quizAnswers.occasion && quizAnswers.drama;
    const hasPartialChoice = quizAnswers.collection || quizAnswers.colorPreference || quizAnswers.skinTone || quizAnswers.occasion || quizAnswers.drama;
    if (!hasPartialChoice || allChoicesSelected || event.target.closest(".quiz-page-card")) return;
    quizAnswers = {};
    currentStep = "1";
    refreshSelectedOptions();
    updateFinder();
  });

  document.querySelectorAll("[data-back-to]").forEach((button) => {
    button.addEventListener("click", () => {
      currentStep = button.dataset.backTo;
      updateFinder();
    });
  });

  updateFinder();
}
