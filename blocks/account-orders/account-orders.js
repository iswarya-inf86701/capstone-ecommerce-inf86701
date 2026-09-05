import { getOrders } from '../../scripts/account.js';

function formatPrice(price) {
  return `₹${Number(price).toFixed(2)}`;
}

function formatDate(date) {
  if (!date) return 'Not available';
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime()) ? date : parsedDate.toLocaleDateString();
}

export default function decorate(block) {
  const orders = getOrders();

  block.innerHTML = `
    <div class="account-orders-content">
      <h1 class="account-orders-title">My Orders</h1>
      <div class="account-orders-list"></div>
    </div>
  `;

  const list = block.querySelector('.account-orders-list');

  if (!orders.length) {
    list.innerHTML = '<p class="account-orders-empty">No orders yet.</p>';
    return;
  }

  orders.forEach((order) => {
    const orderDetails = document.createElement('details');
    orderDetails.className = 'account-order';

    const summary = document.createElement('summary');
    summary.className = 'account-order-summary';
    summary.innerHTML = `
      <span>${order.orderId}</span>
      <span>${formatDate(order.date)}</span>
      <span>${order.status}</span>
      <strong>${formatPrice(order.total)}</strong>
    `;
    orderDetails.append(summary);

    const details = document.createElement('div');
    details.className = 'account-order-details';
    details.innerHTML = `<p>${order.itemsCount} item${order.itemsCount === 1 ? '' : 's'}</p>`;

    if (order.items.length) {
      const items = document.createElement('ul');
      order.items.forEach((item) => {
        const itemRow = document.createElement('li');
        itemRow.textContent = `${item.name || item.sku} × ${item.quantity}`;
        items.append(itemRow);
      });
      details.append(items);
    }

    orderDetails.append(details);
    list.append(orderDetails);
  });
}
