export default async function decorate(block) {
  const currentPath = window.location.pathname.replace(/\/$/, '');

  let product = null;

  try {
    const response = await fetch('/query-index.json');

    if (!response.ok) {
      throw new Error('Unable to load query-index.json');
    }

    const json = await response.json();

    product = (json.data || []).find((item) => {
      const path = (item.path || item.url || '').replace(/\/$/, '');

      return path === currentPath;
    });
  } catch (error) {
    console.error('Unable to load product:', error);
  }

  if (!product) {
    block.innerHTML = '<p>Product not found.</p>';
    return;
  }

  const title = product.title || '';
  const price = product.price || '';
  const description = product.description || '';

  let features = [];

  if (product.feature) {
    features = product.feature
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (product.features) {
    if (Array.isArray(product.features)) {
      features = product.features;
    } else {
      features = product.features
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  const featureHTML = features.length
    ? `
      <div class="product-features">

        <h2>Key features</h2>

        <ul>
          ${features
            .map((feature) => `<li>${feature}</li>`)
            .join('')}
        </ul>

      </div>
    `
    : '';

  block.innerHTML = `
    <div class="product-details-content">

      <h1 class="product-details-title">
        ${title}
      </h1>

      <p class="product-details-price">
        ₹${price}
      </p>

      ${
        description
          ? `
            <p class="product-details-description">
              ${description}
            </p>
          `
          : ''
      }

      ${featureHTML}

      <button
        type="button"
        class="product-details-button">
        Add to cart
      </button>

    </div>
  `;
}