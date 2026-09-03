export default async function decorate(block) {
  const response = await fetch('/query-index.json');
  if (!response.ok) {
    throw new Error(`Unable to load query index: ${response.status}`);
  }

  const json = await response.json();
  const data = Array.isArray(json.data) ? json.data : [];

    const isProductGrid = block.classList.contains('products')
      || block.classList.contains('featured-products');
    const isCategoryGrid = !isProductGrid;

  const items = data.filter((item) => {
    if (isCategoryGrid) {
      return item.template?.toLowerCase() === 'category'
        && item.path?.startsWith('/eds-commerce/pages/categories/');
    }

    if (isProductGrid) {
      return item.template?.toLowerCase() === 'product';
    }

    return false;
  });


  const cards = items.map((item) => `
  <li class="promo-card">
      <a href="${item.path}" class="promo-card-link">
        <img class="promo-card-image" src="${item.image}" alt="${item.title}">
      </a>

      <div class="promo-card-content">
        <h3>${item.title}</h3>

        ${isProductGrid ? `<p>${item.description}</p>` : ''}
        ${isProductGrid ? `<p>&dollar;${item.price}</p>` : ''}
        ${isProductGrid ? `<button class="promo-card-cta">Add to Cart</button>` : ''}
      </div>
    </li>
  `).join('');

  block.innerHTML = `
    <ul class="promo-grid-list">
      ${cards}
    </ul>
  `;
}