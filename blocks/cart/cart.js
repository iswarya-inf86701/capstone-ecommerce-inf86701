import {
  getItems,
  getTotals,
  removeItem,
  updateQty,
} from '../../scripts/cart.js';

const fallbackCategoryPath = '/category/all';

function formatPrice(price) {
  return `₹${Number(price).toFixed(2)}`;
}

function getContinueShoppingPath() {
  try {
    const storedPath = window.localStorage.getItem('last-category-path');
    if (storedPath) return storedPath;
  } catch (error) {
    // Continue with the referrer or fallback path when storage is unavailable.
  }

  try {
    const referrerPath = document.referrer
      ? new URL(document.referrer).pathname
      : '';

    if (referrerPath.includes('/categories/') || referrerPath.startsWith('/category/')) {
      return referrerPath;
    }
  } catch (error) {
    // Continue with the fallback path for an invalid referrer.
  }

  return fallbackCategoryPath;
}

function createLineItem(item, onChange) {
  const row = document.createElement('li');
  row.className = 'cart-line-item';

  if (item.image) {
    const image = document.createElement('img');
    image.className = 'cart-line-image';
    image.src = item.image;
    image.alt = item.name || item.sku;
    row.append(image);
  }

  const details = document.createElement('div');
  details.className = 'cart-line-details';

  const name = document.createElement('h3');
  name.className = 'cart-line-name';
  name.textContent = item.name || item.sku;
  details.append(name);

  const price = document.createElement('p');
  price.className = 'cart-line-price';
  price.textContent = formatPrice(item.price);
  details.append(price);

  const controls = document.createElement('div');
  controls.className = 'cart-line-controls';

  const quantityLabel = document.createElement('label');
  quantityLabel.textContent = 'Quantity';
  quantityLabel.htmlFor = `cart-quantity-${item.sku}`;

  const quantityControl = document.createElement('div');
  quantityControl.className = 'cart-quantity-control';

  const decreaseButton = document.createElement('button');
  decreaseButton.className = 'cart-quantity-button';
  decreaseButton.type = 'button';
  decreaseButton.setAttribute('aria-label', `Decrease quantity of ${item.name || item.sku}`);
  decreaseButton.textContent = '-';

  const quantity = document.createElement('input');
  quantity.id = `cart-quantity-${item.sku}`;
  quantity.type = 'number';
  quantity.min = '0';
  quantity.value = item.quantity;
  quantity.addEventListener('change', () => {
    updateQty(item.sku, quantity.value);
    onChange();
  });

  const increaseButton = document.createElement('button');
  increaseButton.className = 'cart-quantity-button';
  increaseButton.type = 'button';
  increaseButton.setAttribute('aria-label', `Increase quantity of ${item.name || item.sku}`);
  increaseButton.textContent = '+';

  decreaseButton.addEventListener('click', () => {
    updateQty(item.sku, Math.max(0, item.quantity - 1));
    onChange();
  });

  increaseButton.addEventListener('click', () => {
    updateQty(item.sku, Number(item.quantity) + 1);
    onChange();
  });

  quantityControl.append(decreaseButton, quantity, increaseButton);

  const removeButton = document.createElement('button');
  removeButton.className = 'cart-remove-button';
  removeButton.type = 'button';
  removeButton.textContent = 'Remove';
  removeButton.addEventListener('click', () => {
    removeItem(item.sku);
    onChange();
  });

  controls.append(quantityLabel, quantityControl, removeButton);
  details.append(controls);

  const lineTotal = document.createElement('strong');
  lineTotal.className = 'cart-line-total';
  lineTotal.textContent = formatPrice(item.price * item.quantity);

  row.append(details, lineTotal);
  return row;
}

export default function decorate(block) {
  const content = document.createElement('div');
  content.className = 'cart-content';

  const title = document.createElement('h1');
  title.className = 'cart-title';
  title.textContent = 'Your cart';
  content.append(title);

  const layout = document.createElement('div');
  layout.className = 'cart-layout';

  const itemsList = document.createElement('ul');
  itemsList.className = 'cart-line-items';
  layout.append(itemsList);

  const summary = document.createElement('aside');
  summary.className = 'cart-summary';

  const summaryTitle = document.createElement('h2');
  summaryTitle.textContent = 'Order summary';
  summary.append(summaryTitle);

  const subtotal = document.createElement('p');
  subtotal.className = 'cart-subtotal';
  summary.append(subtotal);

  const shipping = document.createElement('p');
  shipping.className = 'cart-shipping';
  shipping.textContent = 'Shipping: Estimated at checkout';
  summary.append(shipping);

  const total = document.createElement('p');
  total.className = 'cart-estimated-total';
  summary.append(total);

  const actions = document.createElement('div');
  actions.className = 'cart-actions';

  const continueLink = document.createElement('a');
  continueLink.className = 'cart-continue-link';
  continueLink.href = getContinueShoppingPath();
  continueLink.textContent = 'Continue shopping';

  const checkoutLink = document.createElement('a');
  checkoutLink.className = 'cart-checkout-link';
  checkoutLink.href = '/eds-commerce/pages/checkout';
  checkoutLink.textContent = 'Proceed to checkout';

  actions.append(continueLink, checkoutLink);
  summary.append(actions);
  layout.append(summary);
  content.append(layout);

  const render = () => {
    const items = getItems();
    const totals = getTotals();
    itemsList.replaceChildren();

    if (!items.length) {
      const emptyMessage = document.createElement('li');
      emptyMessage.className = 'cart-empty';
      emptyMessage.textContent = 'Your cart is empty.';
      itemsList.append(emptyMessage);
    } else {
      items.forEach((item) => {
        itemsList.append(createLineItem(item, render));
      });
    }

    subtotal.textContent = `Subtotal: ${formatPrice(totals.subtotal)}`;
    total.textContent = `Estimated total: ${formatPrice(totals.total)}`;
  };

  document.addEventListener('cart:updated', render);
  window.addEventListener('storage', render);
  block.replaceChildren(content);
  render();
}
