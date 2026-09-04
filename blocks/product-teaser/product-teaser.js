function value(product, ...keys) {
  return keys.map((key) => product[key]).find((item) => item !== undefined && item !== '') || '';
}

function isHighlighted(product) {
  const flag = value(product, 'highlighted', 'Highlighted', 'featured', 'Featured');
  return ['true', 'yes', '1'].includes(String(flag).toLowerCase()) || flag === true;
}

export function renderProductTeaser(product) {
  const path = value(product, 'path', 'Path');
  const title = value(product, 'title', 'Title');
  const image = value(product, 'image', 'Image');
  const description = value(product, 'description', 'Description', 'highlight', 'Highlight');
  const price = value(product, 'price', 'Price');

  return `
    <article class="product-teaser-card">
      <a class="product-teaser-image" href="${path || '#'}">
        <img src="${image}" alt="${title}">
      </a>
      <div class="product-teaser-content">
        <h3>${title}</h3>
        <p class="price">MRP: &#8377;${price}</p>
        <p>${description}</p>
        <a class="product-teaser-link" href="${path || '#'}">View product</a>
      </div>
    </article>
  `;
}

export default async function decorate(block) {
  const response = await fetch('/metadata.json');
  if (!response.ok) {
    block.textContent = 'Unable to load product.';
    return;
  }

  const json = await response.json();
  const products = Array.isArray(json.data)
    ? json.data.filter((product) => value(product, 'template', 'Template').toLowerCase() === 'product')
    : [];

  const authoredPath = block.querySelector('a')?.pathname;
  const product = products.find((item) => value(item, 'path', 'Path') === authoredPath)
    || products.find(isHighlighted)
    || products[0];

  if (!product) {
    block.textContent = 'No product available.';
    return;
  }

  block.innerHTML = renderProductTeaser(product);
}
