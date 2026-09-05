const ORDERS_STORAGE_KEY = 'capstone-commerce-orders';

const profile = {
  name: 'Demo Customer',
  email: 'customer@example.com',
};

function readOrders() {
  try {
    const storedOrders = window.localStorage.getItem(ORDERS_STORAGE_KEY);
    const orders = storedOrders ? JSON.parse(storedOrders) : [];
    return Array.isArray(orders) ? orders : [];
  } catch (error) {
    return [];
  }
}

function getItemsCount(order) {
  if (Number.isFinite(Number(order.itemsCount))) return Number(order.itemsCount);
  return (order.items || []).reduce((count, item) => count + Number(item.quantity || 0), 0);
}

export function getProfile() {
  return { ...profile };
}

export function getOrders() {
  return readOrders().map((order) => ({
    orderId: order.orderId || order.id || 'Pending',
    date: order.date || order.createdAt || '',
    status: order.status || 'Confirmed',
    total: Number(order.total ?? order.totals?.total ?? 0),
    itemsCount: getItemsCount(order),
    items: Array.isArray(order.items) ? order.items : [],
  }));
}

export default {
  getProfile,
  getOrders,
};
