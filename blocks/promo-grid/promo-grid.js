export default async function decorate(block) {
    const jsonUrl = block.querySelector('a')?.href
        || block.textContent.trim();

    const response = await fetch(`query-index.json`);
    const json = await response.json();

    const isCategoryGrid = block.classList.contains('categories');
    const isProductGrid = block.classList.contains('products');

    const items = json.data.filter((item) => {
        if (isCategoryGrid) {
            return item.template === 'category';
        }

        if (isProductGrid) {
            return item.template === 'product';
        }

        return false;
    });


    const cards = items.map((item) => `
  <li class="promo-card">
      <img class="promo-card-image" src="${item.image}" alt="${item.category}">

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