/* =====================================================
   NONSO TECH: app.js
   Needs products.js to load first (STORE, CONDITIONS, PRODUCTS).
   Sections: 1 Helpers · 2 WhatsApp links · 3 Catalog and filters
             4 Cart · 5 Cart drawer · 6 Mobile menu · 7 Start up
   ===================================================== */

/* ---------- 1. HELPERS ---------- */

const $ = (selector) => document.querySelector(selector);

// 220000 -> "₦220,000"
function formatPrice(amount) {
  return STORE.currency + amount.toLocaleString("en-NG");
}

// Lowest storage price of a model (used for sorting)
function lowestPrice(product) {
  return Math.min(...product.variants.map((v) => v.price));
}

// Shown when a phone photo is missing, so there is never a broken image icon
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
      '<rect width="200" height="200" fill="#f1e8e8"/>' +
      '<rect x="65" y="25" width="70" height="150" rx="12" fill="none" stroke="#c9b9b9" stroke-width="4"/>' +
      '<circle cx="100" cy="158" r="5" fill="#c9b9b9"/></svg>'
  );

/* ---------- 2. WHATSAPP LINKS ---------- */

function whatsappLink(message) {
  return "https://wa.me/" + STORE.whatsappNumber + "?text=" + encodeURIComponent(message);
}

function setupWhatsappLinks() {
  const general = "Hi Nonso Tech, I'd like to ask about a phone.";
  const request = "Hi Nonso Tech, I'm looking for a phone or item I could not find on your site: ";
  const laptops = "Hi Nonso Tech, please message me when laptops are available.";

  $("#hero-whatsapp").href = whatsappLink(general);
  $("#footer-whatsapp").href = whatsappLink(general);
  $("#whatsapp-float").href = whatsappLink(general);
  $("#bar-whatsapp").href = whatsappLink(general);
  $("#request-whatsapp").href = whatsappLink(request);
  $("#laptops-whatsapp").href = whatsappLink(laptops);
}

/* ---------- 3. CATALOG AND FILTERS ---------- */

const ALL_SERIES = "All";
const filterState = { search: "", series: ALL_SERIES, sort: "default" };

function matchesFilters(product) {
  if (filterState.series !== ALL_SERIES && product.series !== filterState.series) return false;

  const text = (product.name + " " + product.series).toLowerCase();
  if (filterState.search && !text.includes(filterState.search)) return false;

  return true;
}

function sortProducts(list) {
  const sorted = [...list];
  if (filterState.sort === "low") sorted.sort((a, b) => lowestPrice(a) - lowestPrice(b));
  if (filterState.sort === "high") sorted.sort((a, b) => lowestPrice(b) - lowestPrice(a));
  return sorted;
}

// One chip per series, built from the data (so new series appear on their own)
function buildSeriesChips() {
  const bar = $("#series-bar");
  const names = [ALL_SERIES, ...new Set(PRODUCTS.map((p) => p.series))];

  names.forEach((name) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = name;
    chip.setAttribute("aria-pressed", String(name === filterState.series));
    chip.addEventListener("click", () => {
      filterState.series = name;
      bar.querySelectorAll(".chip").forEach((c) => {
        c.setAttribute("aria-pressed", String(c === chip));
      });
      renderProducts();
    });
    bar.appendChild(chip);
  });
}

// Builds a group of radio "pills" and returns a function that reads the choice
function buildPills(container, name, values) {
  values.forEach((value, index) => {
    const label = document.createElement("label");
    label.className = "pill";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = name;
    input.value = value;
    input.checked = index === 0;

    const text = document.createElement("span");
    text.textContent = value;

    label.append(input, text);
    container.appendChild(label);
  });

  return () => container.querySelector("input:checked").value;
}

function createProductCard(product) {
  const card = $("#product-card-template").content.firstElementChild.cloneNode(true);

  // Image, with a fallback if the file is missing
  const img = card.querySelector(".product-image img");
  img.src = product.image;
  img.alt = product.name;
  img.onerror = () => {
    img.onerror = null;
    img.src = PLACEHOLDER_IMAGE;
  };

  card.querySelector(".product-name").textContent = product.name;

  // Storage and condition pills (radio names are unique per model)
  const getStorage = buildPills(
    card.querySelector(".option-storage"),
    "storage-" + product.id,
    product.variants.map((v) => v.storage)
  );
  const getCondition = buildPills(
    card.querySelector(".option-condition"),
    "condition-" + product.id,
    product.conditions
  );

  // Price follows the chosen storage
  const priceValue = card.querySelector(".price-value");
  function updatePrice() {
    const variant = product.variants.find((v) => v.storage === getStorage());
    priceValue.textContent = formatPrice(variant.price);
  }
  card.querySelector(".option-storage").addEventListener("change", updatePrice);
  updatePrice();

  // What the customer has chosen on this card right now
  function currentChoice() {
    const variant = product.variants.find((v) => v.storage === getStorage());
    return {
      id: product.id,
      name: product.name,
      storage: variant.storage,
      condition: getCondition(),
      price: variant.price,
    };
  }

  // Add to cart
  const addButton = card.querySelector(".add-to-cart");
  addButton.addEventListener("click", () => {
    addToCart(currentChoice());
    addButton.textContent = "Added to cart";
    setTimeout(() => (addButton.textContent = "Add to cart"), 1200);
  });

  // Order now: skip the cart and open WhatsApp with this one phone
  card.querySelector(".order-now").addEventListener("click", () => {
    openWhatsAppOrder([{ ...currentChoice(), qty: 1 }]);
  });

  // Tap the photo to see it larger
  card.querySelector(".product-image").addEventListener("click", () => {
    openLightbox(img.currentSrc || img.src, product.name);
  });

  return card;
}

// Cards fade in as they scroll into view (skipped if the visitor prefers less motion)
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealObserver =
  "IntersectionObserver" in window && !prefersReducedMotion
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      )
    : null;

function revealOnScroll(element, index) {
  if (!revealObserver) return;
  element.classList.add("reveal");
  element.style.setProperty("--delay", (index % 4) * 70 + "ms"); // small stagger per row
  revealObserver.observe(element);
}

function renderProducts() {
  const grid = $("#product-grid");
  grid.replaceChildren();

  const visible = sortProducts(PRODUCTS.filter(matchesFilters));
  visible.forEach((product, index) => {
    const card = createProductCard(product);
    revealOnScroll(card, index);
    grid.appendChild(card);
  });

  $("#empty-state").hidden = visible.length > 0;
  $("#results-count").textContent = visible.length === 1 ? "1 model" : visible.length + " models";
}

function setupFilters() {
  const form = $("#filters");

  $("#search").addEventListener("input", (event) => {
    filterState.search = event.target.value.trim().toLowerCase();
    renderProducts();
  });

  $("#sort").addEventListener("change", (event) => {
    filterState.sort = event.target.value;
    renderProducts();
  });

  form.addEventListener("submit", (event) => event.preventDefault());
}

/* ---------- 4. CART ---------- */

const CART_STORAGE_KEY = "nonso-tech-cart";
let cart = [];
let lastItemCount = null; // used to animate the cart counter

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
    if (Array.isArray(saved)) cart = saved;
  } catch (error) {
    cart = []; // storage blocked or data damaged: start with an empty cart
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    /* storage unavailable: the cart still works until the page closes */
  }
}

// Same model + storage + condition = same cart line
function cartKey(item) {
  return [item.id, item.storage, item.condition].join("|");
}

function addToCart(item) {
  const key = cartKey(item);
  const existing = cart.find((line) => cartKey(line) === key);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  saveCart();
  renderCart();
}

function changeQuantity(key, change) {
  const line = cart.find((l) => cartKey(l) === key);
  if (!line) return;
  line.qty += change;
  if (line.qty <= 0) cart = cart.filter((l) => cartKey(l) !== key);
  saveCart();
  renderCart();
}

function removeFromCart(key) {
  cart = cart.filter((l) => cartKey(l) !== key);
  saveCart();
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart();
  renderCart();
}

function renderCart() {
  const list = $("#cart-items");
  list.replaceChildren();

  cart.forEach((line) => {
    const key = cartKey(line);
    const row = $("#cart-item-template").content.firstElementChild.cloneNode(true);

    row.querySelector(".cart-item-name").textContent = line.name;
    row.querySelector(".cart-item-details").textContent = line.storage + " · " + line.condition;
    row.querySelector(".cart-item-price").textContent = "Starting from " + formatPrice(line.price);
    row.querySelector(".qty-value").textContent = line.qty;

    row.querySelector(".qty-minus").addEventListener("click", () => changeQuantity(key, -1));
    row.querySelector(".qty-plus").addEventListener("click", () => changeQuantity(key, 1));
    row.querySelector(".cart-remove").addEventListener("click", () => removeFromCart(key));

    list.appendChild(row);
  });

  // Update every cart counter (header button and mobile bottom bar)
  const totalItems = cart.reduce((sum, line) => sum + line.qty, 0);
  document.querySelectorAll(".cart-count").forEach((el) => {
    el.textContent = totalItems;
    // Small pop when something is added (not on first load)
    if (lastItemCount !== null && totalItems > lastItemCount && !prefersReducedMotion) {
      el.classList.remove("pop");
      void el.offsetWidth; // restart the animation
      el.classList.add("pop");
    }
  });
  lastItemCount = totalItems;

  $("#cart-total").textContent = formatPrice(cartTotal(cart));
  $("#cart-empty").hidden = cart.length > 0;
  $("#cart-footer").hidden = cart.length === 0;
}

// Sum of price x quantity (these are starting prices)
function cartTotal(items) {
  return items.reduce((sum, line) => sum + line.price * line.qty, 0);
}

// Builds the WhatsApp message for any list of items and opens the chat
function openWhatsAppOrder(items) {
  if (items.length === 0) return;

  const lines = items.map(
    (line, index) =>
      index + 1 + ". " + line.qty + "x " + line.name + " " + line.storage +
      " (" + line.condition + "), from " + formatPrice(line.price)
  );

  const message =
    STORE.greeting + "\n\n" + lines.join("\n") +
    "\n\nEstimated total at starting prices: " + formatPrice(cartTotal(items)) +
    "\nPlease confirm the final price and delivery. Thank you.";

  window.open(whatsappLink(message), "_blank", "noopener");
}

function sendCartToWhatsApp() {
  openWhatsAppOrder(cart);
}

/* ---------- 5. CART DRAWER ---------- */

let cartOpener = null; // the button that opened the cart, so focus can return to it

function openCart(opener) {
  cartOpener = opener || $("#cart-toggle");
  $("#cart-drawer").classList.add("is-open");
  $("#cart-drawer").setAttribute("aria-hidden", "false");
  $("#cart-toggle").setAttribute("aria-expanded", "true");
  $("#cart-overlay").hidden = false;
  document.body.classList.add("no-scroll");
  $("#cart-close").focus();
}

function closeCart() {
  $("#cart-drawer").classList.remove("is-open");
  $("#cart-drawer").setAttribute("aria-hidden", "true");
  $("#cart-toggle").setAttribute("aria-expanded", "false");
  $("#cart-overlay").hidden = true;
  document.body.classList.remove("no-scroll");
  if (cartOpener) cartOpener.focus();
}

function setupCartDrawer() {
  const toggle = $("#cart-toggle");
  const barCart = $("#bar-cart");

  toggle.addEventListener("click", () => openCart(toggle));
  barCart.addEventListener("click", () => openCart(barCart));
  $("#cart-close").addEventListener("click", closeCart);
  $("#cart-overlay").addEventListener("click", closeCart);
  $("#cart-send").addEventListener("click", sendCartToWhatsApp);
  $("#cart-clear").addEventListener("click", clearCart);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && $("#cart-drawer").classList.contains("is-open")) {
      closeCart();
    }
  });
}

/* ---------- PHOTO VIEWER ---------- */

function openLightbox(src, caption) {
  $("#lightbox-img").src = src;
  $("#lightbox-img").alt = caption;
  $("#lightbox-caption").textContent = caption;
  document.body.classList.add("no-scroll");
  $("#lightbox").showModal();
}

function setupLightbox() {
  const box = $("#lightbox");
  $("#lightbox-close").addEventListener("click", () => box.close());
  // A click on the dark area around the photo also closes it
  box.addEventListener("click", (event) => {
    if (event.target === box) box.close();
  });
  // Runs for the Close button, the backdrop and the Escape key
  box.addEventListener("close", () => document.body.classList.remove("no-scroll"));
}

/* ---------- DARK MODE ---------- */

const THEME_KEY = "nonso-tech-theme";

function applyTheme(theme, animate) {
  const root = document.documentElement;
  const dark = theme === "dark";

  if (animate && !prefersReducedMotion) {
    root.classList.add("theme-animate"); // smooth colour change, removed shortly after
    setTimeout(() => root.classList.remove("theme-animate"), 400);
  }

  if (dark) root.setAttribute("data-theme", "dark");
  else root.removeAttribute("data-theme");

  const button = $("#theme-toggle");
  button.setAttribute("aria-pressed", String(dark));
  button.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  button.querySelector(".theme-label").textContent = dark ? "Light" : "Dark";

  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.content = dark ? "#1d1e21" : "#d90f1c";
}

function setupThemeToggle() {
  const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  applyTheme(current, false);

  $("#theme-toggle").addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next, true);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (error) {
      /* storage blocked: the choice lasts until the page closes */
    }
  });
}

/* ---------- 6. MOBILE MENU ---------- */

function setupMobileMenu() {
  const button = $("#menu-toggle");
  const nav = $("#main-nav");

  function setOpen(open) {
    nav.classList.toggle("is-open", open);
    button.setAttribute("aria-expanded", String(open));
    button.textContent = open ? "Close" : "Menu";
  }

  button.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));

  // Close the menu after choosing a link, or with Escape
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
}

/* ---------- 7. START UP ---------- */

document.addEventListener("DOMContentLoaded", () => {
  $("#year").textContent = new Date().getFullYear();

  setupWhatsappLinks();
  buildSeriesChips();
  setupFilters();
  setupCartDrawer();
  setupMobileMenu();
  setupLightbox();
  setupThemeToggle();

  loadCart();
  renderCart();
  renderProducts();
});