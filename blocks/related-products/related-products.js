function value(product, ...keys) {
  return keys
    .map((key) => product[key])
    .find((item) => item !== undefined && item !== '') || '';
}

function normalizedPath(product) {
  return value(product, 'path', 'Path', 'url', 'URL').replace(/\/$/, '') || '/';
}

function renderProductCard(product) {
  const path = value(product, 'path', 'Path') || '#';
  const title = value(product, 'title', 'Title') || 'Product';
  const image = value(product, 'image', 'Image');
  const price = value(product, 'price', 'Price');

  return `
    <article class="related-products-card">
      <a class="related-products-image" href="${path}">
        <img src="${image}" alt="${title}">
      </a>
      <div class="related-products-content">
        <h3>${title}</h3>
        <p class="related-products-price">&#8377;${price}</p>
        <a class="related-products-link" href="${path}">View product</a>
      </div>
    </article>
  `;
}

export default async function decorate(block) {
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  const authoredCategory = block.textContent.trim().toLowerCase();

  try {
    const response = await fetch('/query-index.json');

    if (!response.ok) {
      throw new Error(`Product index request failed: ${response.status}`);
    }

    const json = await response.json();
    const products = Array.isArray(json.data)
      ? json.data.filter((product) => value(product, 'template', 'Template').toLowerCase() === 'product')
      : [];

    const currentProduct = products.find(
      (product) => normalizedPath(product) === currentPath,
    );

    const category = authoredCategory
      || value(currentProduct || {}, 'category', 'Category').trim().toLowerCase();

    const relatedProducts = products.filter((product) =>
      normalizedPath(product) !== currentPath
      && value(product, 'category', 'Category').trim().toLowerCase() === category,
    );

    if (!relatedProducts.length) {
      block.innerHTML = '<p class="related-products-empty">No related products available.</p>';
      return;
    }

    block.innerHTML = `
      <h2 class="related-products-title">Related Products</h2>
      <div class="related-products-container">
        ${relatedProducts.map(renderProductCard).join('')}
      </div>
    `;
  } catch (error) {
    console.error('Unable to load related products:', error);
    block.innerHTML = '<p class="related-products-empty">Unable to load related products.</p>';
  }
}
