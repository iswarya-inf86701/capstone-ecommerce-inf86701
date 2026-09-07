export default async function decorate(block) {
  try {
    const rows = [...block.children];

    const titleRow = rows[0];
    const descriptionRow = rows[1];
    const ctaRow = rows[2];

    const blockTitle = titleRow?.textContent.trim()
      || 'Best Sellers';

    const blockDescription = descriptionRow?.textContent.trim()
      || '';

    const ctaLink = ctaRow?.querySelector('a');

    const shopNowText = ctaLink?.textContent.trim()
      || ctaRow?.textContent.trim()
      || 'Shop now';

    const shopNowLink = ctaLink?.href
      || '/products';

    const response = await fetch('/query-index.json');

    if (!response.ok) {
      throw new Error(
        `Product index request failed: ${response.status}`,
      );
    }

    const json = await response.json();

    const products = Array.isArray(json.data)
      ? json.data.filter(
        (product) => (
          product.template
                || product.Template
                || ''
        ).toLowerCase() === 'product',
      )
      : [];

    const featuredProducts = products.filter((product) => {
      const highlighted = product.highlighted
          ?? product.Highlighted
          ?? product.featured
          ?? product.Featured
          ?? '';

      return (
        String(highlighted).toLowerCase() === 'true'
          || String(highlighted).toLowerCase() === 'yes'
          || String(highlighted) === '1'
      );
    });

    const productsToDisplay = (
      featuredProducts.length
        ? featuredProducts
        : products
    ).slice(0, 6);

    const container = document.createElement('div');

    container.className = 'featured-product-list-container';

    const intro = document.createElement('div');

    intro.className = 'featured-product-list-intro';

    const heading = document.createElement('h2');

    heading.textContent = blockTitle;

    const description = document.createElement('p');

    description.className = 'featured-product-list-description';

    description.textContent = blockDescription;

    const shopNow = document.createElement('a');

    shopNow.className = 'featured-product-list-shop';

    shopNow.href = shopNowLink;

    shopNow.textContent = shopNowText;

    intro.append(
      heading,
      description,
      shopNow,
    );

    const grid = document.createElement('div');

    grid.className = 'featured-product-list-grid';

    productsToDisplay.forEach((product) => {
      const productTitle = product.title
        || product.Title
        || 'Product';

      const productCategory = product.category
        || product.Category
        || '';

      const productPrice = product.price
        || product.Price
        || '';

      const productImage = product.image
        || product.Image
        || '';

      const productPath = product.path
        || product.Path
        || '#';

      const productCard = document.createElement('article');

      productCard.className = 'product-card';

      const imageLink = document.createElement('a');

      imageLink.className = 'product-card-image';

      imageLink.href = productPath;

      if (productImage) {
        const image = document.createElement('img');

        image.src = productImage;

        image.alt = productTitle;

        image.loading = 'lazy';

        imageLink.appendChild(
          image,
        );
      }

      const info = document.createElement('div');

      info.className = 'product-card-info';

      const title = document.createElement('h3');

      title.textContent = productTitle;

      const category = document.createElement('p');

      category.className = 'product-category';

      category.textContent = productCategory;

      const price = document.createElement('p');

      price.className = 'product-price';

      if (productPrice) {
        price.textContent = `₹${productPrice}`;
      }

      const productButton = document.createElement('a');

      productButton.className = 'product-view-button';

      productButton.href = productPath;

      productButton.textContent = 'View product';

      info.append(
        title,
        category,
        price,
        productButton,
      );

      productCard.append(
        imageLink,
        info,
      );

      grid.appendChild(
        productCard,
      );
    });

    container.append(
      intro,
      grid,
    );

    block.replaceChildren(
      container,
    );
  } catch {
    block.innerHTML = `
      <p class="featured-product-list-error">
        Unable to load products.
      </p>
    `;
  }
}
