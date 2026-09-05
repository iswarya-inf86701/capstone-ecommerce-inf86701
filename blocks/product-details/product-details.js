export default async function decorate(block) {
  const path = window.location.pathname;

  try {
    const response = await fetch('/query-index.json');

    if (!response.ok) {
      block.innerHTML = '<p>Product not found.</p>';
      return;
    }

    const json = await response.json();

    const product = json.data?.find(
      (item) => item.path === path
    );

    if (!product) {
      block.innerHTML = '<p>Product not found.</p>';
      return;
    }

    const features = product.features
      ? product.features
          .split(',')
          .map((feature) => feature.trim())
          .filter(Boolean)
      : [];

    block.innerHTML = `
      <div class="product-details-content">

        <h1 class="product-details-title">
          ${product.title || ''}
        </h1>

        <div class="product-details-price">
          ₹${product.price || ''}
        </div>

        <p class="product-details-description">
          ${product.description || ''}
        </p>

        ${
          features.length
            ? `
              <div class="product-details-features">
                <h2>Key features</h2>
                <ul>
                  ${features
                    .map((feature) => `<li>${feature}</li>`)
                    .join('')}
                </ul>
              </div>
            `
            : ''
        }

        <button class="product-details-button" type="button">
          Add to cart
        </button>

      </div>
    `;
  } catch (error) {
    console.error('Product details error:', error);
    block.innerHTML = '<p>Product not found.</p>';
  }
}