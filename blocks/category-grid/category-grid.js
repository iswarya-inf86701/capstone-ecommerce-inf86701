export default async function decorate(block) {
  const category = block.textContent.trim().toLowerCase();

  try {
    window.localStorage.setItem('last-category-path', window.location.pathname);
  } catch (error) {
    /* continue without remembering category */
  }

  const response = await fetch('/query-index.json');

  if (!response.ok) {
    block.innerHTML = '<p>Unable to load products.</p>';
    return;
  }

  const json = await response.json();

  const products = (json.data || []).filter((item) => item.template?.toLowerCase() === 'product'
      && item.category?.toLowerCase() === category);

  if (!products.length) {
    block.innerHTML = `
      <p>No products available for ${category}.</p>
    `;
    return;
  }

  const cards = products.map((product) => `
    <article class="category-product-card">
      <a class="category-product-image" href="${product.path || '#'}">
        <img src="${product.image || ''}" alt="${product.title || ''}">
      </a>
      <div class="category-product-content">
        <p class="category-product-category">${product.category || category}</p>
        <h2 class="category-product-title">${product.title || ''}</h2>
        <p class="category-product-price">&#8377;${product.price || ''}</p>
        <a class="category-product-button" href="${product.path || '#'}">View product</a>
      </div>
    </article>
  `).join('');

  block.innerHTML = `
    <div class="category-grid-list">
      ${cards}
    </div>
  `;
}
