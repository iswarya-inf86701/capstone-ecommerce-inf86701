export default async function decorate(block) {
  try {
    /*
     * ---------------------------------------------------------
     * READ VALUES FROM DA.LIVE AUTHORING
     *
     * Row 1 = Title
     * Row 2 = Description
     * Row 3 = CTA
     * ---------------------------------------------------------
     */

    const rows = [...block.children];

    const titleRow = rows[0];
    const descriptionRow = rows[1];
    const ctaRow = rows[2];

    const blockTitle =
      titleRow?.textContent.trim()
      || 'Best Sellers';

    const blockDescription =
      descriptionRow?.textContent.trim()
      || '';

    /*
     * CTA can be authored as a link.
     */

    const ctaLink =
      ctaRow?.querySelector('a');

    const shopNowText =
      ctaLink?.textContent.trim()
      || ctaRow?.textContent.trim()
      || 'Shop now';

    const shopNowLink =
      ctaLink?.href
      || '/products';

    /*
     * ---------------------------------------------------------
     * GET PRODUCTS FROM QUERY INDEX
     * ---------------------------------------------------------
     */

    const response =
      await fetch('/query-index.json');

    if (!response.ok) {
      throw new Error(
        `Product index request failed: ${response.status}`,
      );
    }

    const json =
      await response.json();

    /*
     * Only get product pages.
     */

    const products =
      Array.isArray(json.data)
        ? json.data.filter(
            (product) =>
              (
                product.template
                || product.Template
                || ''
              ).toLowerCase() === 'product',
          )
        : [];

    /*
     * ---------------------------------------------------------
     * GET FEATURED PRODUCTS
     * ---------------------------------------------------------
     */

    const featuredProducts =
      products.filter((product) => {
        const highlighted =
          product.highlighted
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

    /*
     * If highlighted products exist, use them.
     * Otherwise use the first products.
     */

    const productsToDisplay = (
      featuredProducts.length
        ? featuredProducts
        : products
    ).slice(0, 6);

    /*
     * ---------------------------------------------------------
     * MAIN CONTAINER
     * ---------------------------------------------------------
     */

    const container =
      document.createElement('div');

    container.className =
      'featured-product-list-container';

    /*
     * ---------------------------------------------------------
     * LEFT INTRO SECTION
     * ---------------------------------------------------------
     */

    const intro =
      document.createElement('div');

    intro.className =
      'featured-product-list-intro';

    /*
     * TITLE
     */

    const heading =
      document.createElement('h2');

    heading.textContent =
      blockTitle;

    /*
     * DESCRIPTION
     */

    const description =
      document.createElement('p');

    description.className =
      'featured-product-list-description';

    description.textContent =
      blockDescription;

    /*
     * SHOP NOW / SHOP ALL
     */

    const shopNow =
      document.createElement('a');

    shopNow.className =
      'featured-product-list-shop';

    shopNow.href =
      shopNowLink;

    shopNow.textContent =
      shopNowText;

    /*
     * Add all three authored values.
     */

    intro.append(
      heading,
      description,
      shopNow,
    );

    /*
     * ---------------------------------------------------------
     * PRODUCT GRID
     * ---------------------------------------------------------
     */

    const grid =
      document.createElement('div');

    grid.className =
      'featured-product-list-grid';

    /*
     * ---------------------------------------------------------
     * CREATE PRODUCT CARDS
     * ---------------------------------------------------------
     */

    productsToDisplay.forEach((product) => {
      /*
       * Product values from query-index.json
       */

      const productTitle =
        product.title
        || product.Title
        || 'Product';

      const productCategory =
        product.category
        || product.Category
        || '';

      const productPrice =
        product.price
        || product.Price
        || '';

      const productImage =
        product.image
        || product.Image
        || '';

      const productPath =
        product.path
        || product.Path
        || '#';

      /*
       * -------------------------------------------------------
       * CARD
       * -------------------------------------------------------
       */

      const productCard =
        document.createElement('article');

      productCard.className =
        'product-card';

      /*
       * -------------------------------------------------------
       * IMAGE
       * -------------------------------------------------------
       */

      const imageLink =
        document.createElement('a');

      imageLink.className =
        'product-card-image';

      imageLink.href =
        productPath;

      if (productImage) {
        const image =
          document.createElement('img');

        image.src =
          productImage;

        image.alt =
          productTitle;

        image.loading =
          'lazy';

        imageLink.appendChild(
          image,
        );
      }

      /*
       * -------------------------------------------------------
       * PRODUCT INFORMATION
       * -------------------------------------------------------
       */

      const info =
        document.createElement('div');

      info.className =
        'product-card-info';

      /*
       * TITLE
       */

      const title =
        document.createElement('h3');

      title.textContent =
        productTitle;

      /*
       * CATEGORY
       */

      const category =
        document.createElement('p');

      category.className =
        'product-category';

      category.textContent =
        productCategory;

      /*
       * PRICE
       */

      const price =
        document.createElement('p');

      price.className =
        'product-price';

      if (productPrice) {
        price.textContent =
          `₹${productPrice}`;
      }

      /*
       * -------------------------------------------------------
       * VIEW PRODUCT BUTTON
       * -------------------------------------------------------
       */

      const productButton =
        document.createElement('a');

      productButton.className =
        'product-view-button';

      productButton.href =
        productPath;

      productButton.textContent =
        'View product';

      /*
       * -------------------------------------------------------
       * PRODUCT CONTENT
       *
       * NO RATING
       * NO REVIEWS
       * NO STOCK
       * -------------------------------------------------------
       */

      info.append(
        title,
        category,
        price,
        productButton,
      );

      /*
       * -------------------------------------------------------
       * ADD CARD TO GRID
       * -------------------------------------------------------
       */

      productCard.append(
        imageLink,
        info,
      );

      grid.appendChild(
        productCard,
      );
    });

    /*
     * ---------------------------------------------------------
     * ADD INTRO + GRID
     * ---------------------------------------------------------
     */

    container.append(
      intro,
      grid,
    );

    /*
     * Replace authored content with rendered block.
     */

    block.replaceChildren(
      container,
    );
  } catch (error) {
    console.error(
      'Unable to load featured products:',
      error,
    );

    block.innerHTML = `
      <p class="featured-product-list-error">
        Unable to load products.
      </p>
    `;
  }
}