import {
  addItem,
  getItems,
  updateQty,
} from '../../scripts/cart.js';

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
      (item) => item.path === path,
    );

    if (!product) {
      block.innerHTML = '<p>Product not found.</p>';
      return;
    }

    const productSku = product.sku || product.SKU || path;
    const existingCartItem = getItems().find(
      (item) => item.sku === productSku,
    );
    const initialQuantity = existingCartItem?.quantity || 0;

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

        <div class="product-details-sku">
          SKU: ${product.sku || ''}
        </div>

        <div class="product-details-price">
          Price: ₹${product.price || ''}
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

        <div class="product-details-actions">
          <div class="product-details-quantity">
            <span id="product-quantity-label">Quantity</span>
            <div class="product-details-quantity-control">
              <button
                class="product-details-quantity-button"
                type="button"
                aria-label="Decrease quantity">-</button>
              <input
                id="product-quantity"
                type="number"
                min="0"
                step="1"
                value="${initialQuantity}"
                aria-labelledby="product-quantity-label">
              <button
                class="product-details-quantity-button"
                type="button"
                aria-label="Increase quantity">+</button>
            </div>
          </div>

          <button class="product-details-button" type="button">
            Add to cart
          </button>
        </div>

        <p class="product-details-cart-status" aria-live="polite"></p>

      </div>
    `;

    const addToCartButton = block.querySelector('.product-details-button');
    const quantityInput = block.querySelector('#product-quantity');
    const quantityButtons = block.querySelectorAll('.product-details-quantity-button');
    const cartStatus = block.querySelector('.product-details-cart-status');

    const syncCartQuantity = () => {
      const cartItem = getItems().find((item) => item.sku === productSku);

      if (cartItem) {
        updateQty(productSku, quantityInput.value);
      }
    };

    // Number('0') is falsy, so the fallback must be 0 to keep the stepper stable at zero.
    const readQuantity = () => Math.max(0, Math.floor(Number(quantityInput.value) || 0));

    quantityButtons[0].addEventListener('click', () => {
      quantityInput.value = Math.max(0, readQuantity() - 1);
      syncCartQuantity();
    });

    quantityButtons[1].addEventListener('click', () => {
      quantityInput.value = readQuantity() + 1;
      syncCartQuantity();
    });

    quantityInput.addEventListener('change', () => {
      quantityInput.value = readQuantity();
      syncCartQuantity();
    });

    addToCartButton.addEventListener('click', () => {
      const quantity = Math.max(1, Math.floor(Number(quantityInput.value) || 1));

      quantityInput.value = quantity;

      const currentCartItem = getItems().find(
        (item) => item.sku === productSku,
      );

      if (currentCartItem) {
        addItem({
          sku: productSku,
          name: product.title || product.Title || '',
          price: product.price || product.Price || 0,
          quantity: 1,
          image: product.image || product.Image || '',
        });
      } else {
        addItem({
          sku: productSku,
          name: product.title || product.Title || '',
          price: product.price || product.Price || 0,
          quantity,
          image: product.image || product.Image || '',
        });
      }

      const updatedCartItem = getItems().find(
        (item) => item.sku === productSku,
      );
      quantityInput.value = updatedCartItem?.quantity || quantity;

      cartStatus.textContent = 'Added to cart.';
    });
  } catch {
    block.innerHTML = '<p>Product not found.</p>';
  }
}
