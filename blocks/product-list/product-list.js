function value(product, ...keys) {
  return keys
    .map((key) => product[key])
    .find((item) => item !== undefined && item !== '') || '';
}

function productPagePath(product) {
  const rawPath = String(value(product, 'path', 'Path', 'url', 'URL')).trim();

  if (!rawPath) return '#';
  if (rawPath.includes('/eds-commerce/pages/products/')) return rawPath;

  const slug = rawPath
    .replace(/^https?:\/\/[^/]+/, '')
    .replace(/^\/?(?:products\/|eds-commerce\/pages\/products\/)/, '')
    .replace(/^\/+|\/+$/g, '');

  return slug ? `/eds-commerce/pages/products/${slug}` : '#';
}

function renderProduct(product) {
  const path = productPagePath(product);
  const title = value(product, 'title', 'Title') || 'Product';
  const image = value(product, 'image', 'Image', 'imag');
  const description = value(product, 'description', 'Description');
  const price = value(product, 'price', 'Price');
  const category = value(product, 'category', 'Category');

  return `
    <article class="product-list-card">
      <a class="product-list-image" href="${path}">
        <img src="${image}" alt="${title}">
      </a>
      <div class="product-list-content">
        ${category ? `<p class="product-list-category">${category}</p>` : ''}
        <h2>${title}</h2>
        ${description ? `<p class="product-list-description">${description}</p>` : ''}
        ${price ? `<p class="product-list-price">&#8377;${price}</p>` : ''}
        <a class="product-list-link" href="${path}">View product</a>
      </div>
    </article>
  `;
}

export default async function decorate(block) {
  try {
    const response = await fetch('/metadata.json');

    if (!response.ok) {
      throw new Error(`Unable to load metadata.json: ${response.status}`);
    }

    const json = await response.json();
    const products = Array.isArray(json.data)
      ? json.data.filter((product) => value(product, 'template', 'Template').toLowerCase() === 'product')
      : [];

    if (!products.length) {
      block.innerHTML = '<p>No products available.</p>';
      return;
    }

    block.innerHTML = `
      <div class="product-list-content-wrapper">
        <h1>Products</h1>
        <div class="product-list-grid">
          ${products.map(renderProduct).join('')}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Unable to load product list:', error);
    block.innerHTML = '<p>Unable to load products.</p>';
  }
}
