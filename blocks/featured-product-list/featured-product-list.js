export default async function decorate(block) {
  /*
   * =========================================
   * READ AUTHORED CONTENT FROM DA.LIVE
   *
   * Row 1 = Title
   * Row 2 = Description
   * Row 3 = CTA link
   * =========================================
   */

  const rows = [...block.children];

  const title = rows[0]?.textContent.trim()
    || 'Our best sellers';

  const description = rows[1]?.textContent.trim()
    || '';

  const ctaElement = rows[2]?.querySelector('a');

  const ctaText = ctaElement?.textContent.trim()
    || 'Shop now';

  const ctaHref = ctaElement?.href
    || '/products';


  /*
   * =========================================
   * FETCH PRODUCT METADATA
   * =========================================
   */

  const response = await fetch(
    '/eds-commerce/pages/metadata.json',
  );

  if (!response.ok) {
    throw new Error(
      `Unable to load product metadata: ${response.status}`,
    );
  }

  const json = await response.json();


  /*
   * =========================================
   * GET ONLY PRODUCT PAGES
   * =========================================
   */

  const products = Array.isArray(json.data)
    ? json.data.filter(
      (item) => item.template?.toLowerCase() === 'product',
    )
    : [];


  /*
   * =========================================
   * GET ONLY HIGHLIGHTED PRODUCTS
   * =========================================
   */

  const highlightedProducts = products.filter((item) => {
    const flag = item.Highlighted
      || item.highlighted
      || item.Featured
      || item.featured;

    return (
      ['true', 'yes', '1'].includes(
        String(flag).toLowerCase(),
      )
      || flag === true
    );
  });


  /*
   * =========================================
   * BEST SELLERS
   *
   * ONLY highlighted products.
   * NO fallback products.
   *
   * Maximum 6 products.
   * =========================================
   */

  const bestSellers = highlightedProducts.slice(0, 6);


  /*
   * =========================================
   * IF NO HIGHLIGHTED PRODUCTS
   * =========================================
   */

  if (!bestSellers.length) {
    block.innerHTML = '';

    const message = document.createElement('p');

    message.textContent = 'No best-selling products available.';

    block.append(message);

    return;
  }


  /*
   * =========================================
   * CLEAR AUTHORED BLOCK
   * =========================================
   */

  block.innerHTML = '';


  /*
   * =========================================
   * MAIN CONTAINER
   * =========================================
   */

  const container = document.createElement('div');

  container.className = 'featured-product-list-container';


  /*
   * =========================================
   * LEFT SIDE - INTRO
   * =========================================
   */

  const intro = document.createElement('div');

  intro.className = 'featured-product-list-intro';


  /*
   * TITLE
   */

  const heading = document.createElement('h2');

  heading.textContent = title;


  /*
   * DESCRIPTION
   */

  const descriptionElement = document.createElement('p');

  descriptionElement.textContent = description;


  /*
   * CTA
   */

  const shopLink = document.createElement('a');

  shopLink.className = 'featured-product-list-shop';

  shopLink.href = ctaHref;

  shopLink.textContent = ctaText;


  /*
   * Add intro content
   */

  intro.append(
    heading,
    descriptionElement,
    shopLink,
  );


  /*
   * =========================================
   * RIGHT SIDE - PRODUCT GRID
   * =========================================
   */

  const productGrid = document.createElement('div');

  productGrid.className = 'featured-product-list-grid';


  /*
   * =========================================
   * CREATE PRODUCT CARDS
   * =========================================
   */

  bestSellers.forEach((product) => {
    /*
     * Card
     */

    const card = document.createElement('article');

    card.className = 'product-card';


    /*
     * Product link / image
     */

    const imageLink = document.createElement('a');

    imageLink.className = 'product-card-image';

    imageLink.href =
      product.Path
      || product.path
      || '#';


    /*
     * Image
     */

    const image = document.createElement('img');

    image.src =
      product.Image
      || product.image
      || '';

    image.alt =
      product.Title
      || product.title
      || '';


    imageLink.append(image);


    /*
     * Product information
     */

    const info = document.createElement('div');

    info.className = 'product-card-info';


    /*
     * Product title
     */

    const productTitle = document.createElement('h3');

    productTitle.textContent =
      product.Title
      || product.title
      || '';


    /*
     * Category
     */

    const category = document.createElement('p');

    category.className = 'product-category';

    category.textContent =
      product.Category
      || product.category
      || '';


    /*
     * Price
     */

    const price = document.createElement('p');

    price.className = 'product-price';

    price.textContent =
      `₹${product.Price || product.price || ''}`;


    /*
     * Rating
     */

    const rating = document.createElement('div');

    rating.className = 'product-rating';

    rating.innerHTML = `
      <span class="stars">★★★★★</span>
      <span class="rating-value">4.5</span>
      <span class="reviews">28 reviews</span>
    `;


    /*
     * Stock
     */

    const stock = document.createElement('p');

    stock.className = 'product-stock';

    stock.textContent = '2 left in stock';


    /*
     * Add to cart
     */

    const cartButton = document.createElement('a');

    cartButton.className = 'product-cart-button';

    cartButton.href =
      product.Path
      || product.path
      || '#';

    cartButton.textContent = 'Add to cart';


    /*
     * Put product information together
     */

    info.append(
      productTitle,
      category,
      price,
      rating,
      stock,
      cartButton,
    );


    /*
     * Put card together
     */

    card.append(
      imageLink,
      info,
    );


    /*
     * Add card to grid
     */

    productGrid.append(card);
  });


  /*
   * =========================================
   * ADD EVERYTHING TO MAIN CONTAINER
   * =========================================
   */

  container.append(
    intro,
    productGrid,
  );


  /*
   * =========================================
   * ADD CONTAINER TO BLOCK
   * =========================================
   */

  block.append(container);
}