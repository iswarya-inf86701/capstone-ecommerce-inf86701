import {
  clearCart,
  getItems,
  getTotals,
} from '../../scripts/cart.js';

function formatPrice(price) {
  return `₹${Number(price).toFixed(2)}`;
}

function createOrderId() {
  return `ORD-${Date.now().toString(36).toUpperCase()}`;
}

function saveOrder(order) {
  try {
    const storedOrders = window.localStorage.getItem('capstone-commerce-orders');
    const orders = storedOrders ? JSON.parse(storedOrders) : [];
    const updatedOrders = Array.isArray(orders) ? orders : [];
    updatedOrders.push(order);
    window.localStorage.setItem('capstone-commerce-orders', JSON.stringify(updatedOrders));
  } catch (error) {
    /* order history is optional */
  }
}

export default function decorate(block) {
  const params = new URLSearchParams(window.location.search);
  if (params.get('status') === 'confirmed') {
    const orderId = (params.get('orderId') || 'ORD-CONFIRMED')
      .replace(/[^A-Za-z0-9-]/g, '') || 'ORD-CONFIRMED';
    block.innerHTML = `
      <div class="checkout-summary-complete">
        <h1>Thank you for your order</h1>
        <p>Your order has been confirmed.</p>
        <p class="checkout-summary-order-id">Order ID: ${orderId}</p>
        <a class="checkout-summary-continue" href="/">Continue shopping</a>
      </div>
    `;
    return;
  }

  const content = document.createElement('div');
  content.className = 'checkout-summary-content';

  const title = document.createElement('h1');
  title.className = 'checkout-summary-title';
  title.textContent = 'Checkout';
  content.append(title);

  const layout = document.createElement('div');
  layout.className = 'checkout-summary-layout';

  const orderSection = document.createElement('section');
  orderSection.className = 'checkout-summary-order';

  const orderTitle = document.createElement('h2');
  orderTitle.textContent = 'Order items';
  orderSection.append(orderTitle);

  const itemsList = document.createElement('ul');
  itemsList.className = 'checkout-summary-items';
  orderSection.append(itemsList);

  const totalsSection = document.createElement('section');
  totalsSection.className = 'checkout-summary-totals';

  const totalsTitle = document.createElement('h2');
  totalsTitle.textContent = 'Order summary';
  totalsSection.append(totalsTitle);

  const subtotal = document.createElement('p');
  const shipping = document.createElement('p');
  const total = document.createElement('p');
  subtotal.className = 'checkout-summary-subtotal';
  shipping.className = 'checkout-summary-shipping';
  total.className = 'checkout-summary-total';
  totalsSection.append(subtotal, shipping, total);

  const placeOrder = document.createElement('button');
  placeOrder.className = 'checkout-summary-place-order';
  placeOrder.type = 'button';
  placeOrder.textContent = 'Place order';
  totalsSection.append(placeOrder);

  layout.append(orderSection, totalsSection);
  content.append(layout);

  const nextSteps = document.createElement('section');
  nextSteps.className = 'checkout-summary-next-steps';

  const nextStepsTitle = document.createElement('h2');
  nextStepsTitle.textContent = 'Next steps';
  nextSteps.append(nextStepsTitle);

  const nextStepsText = document.createElement('p');
  nextStepsText.textContent = 'Review your order, enter your delivery details, and choose a payment method to complete checkout.';
  nextSteps.append(nextStepsText);
  content.append(nextSteps);

  const render = () => {
    const items = getItems();
    const totals = getTotals();
    itemsList.replaceChildren();

    if (!items.length) {
      const emptyMessage = document.createElement('li');
      emptyMessage.className = 'checkout-summary-empty';
      emptyMessage.textContent = 'Your cart is empty.';
      itemsList.append(emptyMessage);
    } else {
      items.forEach((item) => {
        const lineItem = document.createElement('li');
        lineItem.className = 'checkout-summary-item';

        if (item.image) {
          const image = document.createElement('img');
          image.className = 'checkout-summary-item-image';
          image.src = item.image;
          image.alt = item.name || item.sku;
          lineItem.append(image);
        }

        const itemDetails = document.createElement('div');
        itemDetails.className = 'checkout-summary-item-details';

        const itemName = document.createElement('h3');
        itemName.textContent = item.name || item.sku;
        itemDetails.append(itemName);

        const itemInfo = document.createElement('p');
        itemInfo.textContent = `${formatPrice(item.price)} × ${item.quantity}`;
        itemDetails.append(itemInfo);

        const lineTotal = document.createElement('strong');
        lineTotal.className = 'checkout-summary-line-total';
        lineTotal.textContent = formatPrice(item.price * item.quantity);

        lineItem.append(itemDetails, lineTotal);
        itemsList.append(lineItem);
      });
    }

    subtotal.textContent = `Subtotal: ${formatPrice(totals.subtotal)}`;
    shipping.textContent = 'Shipping: Estimated at checkout';
    total.textContent = `Total: ${formatPrice(totals.total)}`;
    placeOrder.disabled = !items.length;
  };

  placeOrder.addEventListener('click', () => {
    const items = getItems();
    const totals = getTotals();

    if (!items.length) return;

    const orderId = createOrderId();
    saveOrder({
      id: orderId,
      items,
      totals,
      createdAt: new Date().toISOString(),
    });

    clearCart();

    window.location.href = `${window.location.pathname}?status=confirmed&orderId=${orderId}`;
  });

  window.addEventListener('cart:updated', render);
  window.addEventListener('storage', render);
  block.replaceChildren(content);
  render();
}
