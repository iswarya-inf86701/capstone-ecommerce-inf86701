import { getOrders, getProfile } from '../../scripts/account.js';

export default function decorate(block) {
  const profile = getProfile();

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const label = cells[0]?.textContent.trim().toLowerCase();
    const value = cells[1]?.textContent.trim();

    if (label === 'name' && value) profile.name = value;
    if (label === 'email' && value) profile.email = value;
  });

  const orders = getOrders();

  block.innerHTML = `
    <div class="account-overview-content">
      <h1 class="account-overview-title">My Account</h1>
      <section class="account-overview-profile">
        <h2>Profile</h2>
        <p class="account-overview-name">${profile.name}</p>
        <p class="account-overview-email">${profile.email}</p>
      </section>
      <section class="account-overview-links">
        <h2>Account links</h2>
        <p>${orders.length} order${orders.length === 1 ? '' : 's'} placed</p>
        <a class="account-overview-orders-link" href="/eds-commerce/pages/orders">View orders</a>
      </section>
    </div>
  `;
}
