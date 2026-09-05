import { getItems, getTotals } from '../../scripts/cart.js';

function formatPrice(price) {
  return `₹${Number(price).toFixed(2)}`;
}

export default function decorate(block) {
  const trigger = document.createElement('button');
  trigger.className = 'mini-cart-trigger';
  trigger.type = 'button';
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', 'mini-cart-panel');

  const summary = document.createElement('span');
  summary.className = 'mini-cart-summary';
  trigger.append(summary);

  const panel = document.createElement('div');
  panel.className = 'mini-cart-panel';
  panel.id = 'mini-cart-panel';
  panel.hidden = true;

  const title = document.createElement('h2');
  title.className = 'mini-cart-title';
  title.textContent = 'Shopping cart';
  panel.append(title);

  const itemsList = document.createElement('ul');
  itemsList.className = 'mini-cart-items';
  panel.append(itemsList);

  const subtotal = document.createElement('p');
  subtotal.className = 'mini-cart-subtotal';
  panel.append(subtotal);

  const cartLink = document.createElement('a');
  cartLink.className = 'mini-cart-link';
  cartLink.href = '/eds-commerce/pages/cart';
  cartLink.textContent = 'View cart';
  panel.append(cartLink);

  const render = () => {
    const items = getItems();
    const totals = getTotals();
    summary.textContent = `Cart (${totals.itemCount})`;
    subtotal.textContent = `Subtotal: ${formatPrice(totals.subtotal)}`;
    itemsList.replaceChildren();

    if (!items.length) {
      const emptyMessage = document.createElement('li');
      emptyMessage.className = 'mini-cart-empty';
      emptyMessage.textContent = 'Your cart is empty.';
      itemsList.append(emptyMessage);
      return;
    }

    items.forEach((item) => {
      const listItem = document.createElement('li');
      listItem.className = 'mini-cart-item';
      listItem.textContent = `${item.name || item.sku} × ${item.quantity}`;
      itemsList.append(listItem);
    });
  };

  const setExpanded = (expanded) => {
    trigger.setAttribute('aria-expanded', String(expanded));
    panel.hidden = !expanded;
  };

  trigger.addEventListener('click', () => {
    render();
    setExpanded(panel.hidden);
  });

  window.addEventListener('cart:updated', render);
  window.addEventListener('storage', render);

  block.replaceChildren(trigger, panel);
  render();
}
