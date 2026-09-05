const CART_STORAGE_KEY = 'capstone-commerce-cart';

function readItems() {
  try {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
    const items = storedCart ? JSON.parse(storedCart) : [];

    return Array.isArray(items) ? items : [];
  } catch (error) {
    return [];
  }
}

function writeItems(items) {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    // Storage may be unavailable in private browsing or restricted contexts.
  }

  window.dispatchEvent(new CustomEvent('cart:updated'));
}

function normalizeQuantity(quantity) {
  const parsedQuantity = Number(quantity);

  if (!Number.isFinite(parsedQuantity)) {
    return 0;
  }

  return Math.max(0, Math.floor(parsedQuantity));
}

function normalizePrice(price) {
  const parsedPrice = Number(String(price).replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsedPrice) ? parsedPrice : 0;
}

function normalizeItem(product, quantity) {
  return {
    sku: String(product.sku ?? product.SKU ?? '').trim(),
    name: String(product.name ?? product.title ?? product.Title ?? '').trim(),
    price: normalizePrice(product.price ?? product.Price),
    quantity: normalizeQuantity(quantity),
    image: String(product.image ?? product.Image ?? '').trim(),
  };
}

export function addItem(product) {
  const item = normalizeItem(product, product.quantity ?? 1);

  if (!item.sku || item.quantity < 1) {
    return getItems();
  }

  const items = readItems();
  const existingItem = items.find((cartItem) => cartItem.sku === item.sku);

  if (existingItem) {
    existingItem.quantity += item.quantity;
    existingItem.name = item.name || existingItem.name;
    existingItem.price = item.price;
    existingItem.image = item.image || existingItem.image;
  } else {
    items.push(item);
  }

  writeItems(items);
  return items;
}

export function removeItem(sku) {
  const items = readItems().filter((item) => item.sku !== String(sku));
  writeItems(items);
  return items;
}

export function updateQty(sku, quantity) {
  const normalizedSku = String(sku);
  const normalizedQuantity = normalizeQuantity(quantity);

  if (normalizedQuantity === 0) {
    return removeItem(normalizedSku);
  }

  const items = readItems();
  const item = items.find((cartItem) => cartItem.sku === normalizedSku);

  if (item) {
    item.quantity = normalizedQuantity;
    writeItems(items);
  }

  return items;
}

export function clearCart() {
  writeItems([]);
  return [];
}

export function getItems() {
  return readItems();
}

export function getTotals() {
  const items = getItems();
  const itemCount = items.reduce((count, item) => count + normalizeQuantity(item.quantity), 0);
  const subtotal = items.reduce(
    (total, item) => total + (normalizePrice(item.price) * normalizeQuantity(item.quantity)),
    0,
  );

  return {
    subtotal,
    itemCount,
    total: subtotal,
  };
}

export default {
  addItem,
  removeItem,
  updateQty,
  clearCart,
  getItems,
  getTotals,
};
