export default async function decorate(block) {
  /* =========================================================
     1. DETERMINE BLOCK TYPE
     ========================================================= */

  const isProductGrid =
    block.classList.contains('products');

  const isCategoryListPage =
    window.location.pathname.replace(/\/$/, '') === '/eds-commerce/pages/categories/category-list';


  /* =========================================================
     2. READ DA.LIVE AUTHORING
     =========================================================
     
     Expected authoring:

     | Products              | Shop Now |
     |-----------------------|----------|

     OR

     | Our Best Sellers      | Shop Now |
     |-----------------------|----------|

     OR

     | Categories            | Shop Now |
     |-----------------------|----------|

     The FIRST CELL = heading
     The LINK = Shop Now CTA
  */

  const authoredRows = [...block.children];

  let headingText = '';
  let shopText = 'Shop Now';
  let shopHref = isProductGrid
    ? '#'
    : '/eds-commerce/pages/categories/category-list';
  let hasAuthoredCta = false;

  /*
   * Read the first authored row.
   */
  const firstRow = authoredRows[0];

  if (firstRow) {
    const cells = [...firstRow.children];

    /*
     * FIRST CELL = HEADING
     */
    if (cells[0]) {
      headingText = cells[0].textContent.trim();
    }

    /*
     * SECOND CELL = CTA
     */
    if (cells[1]) {
      const link = cells[1].querySelector('a');

      if (link) {
        hasAuthoredCta = true;

        shopText =
          link.textContent.trim() || 'Shop Now';

        shopHref =
          link.href || '#';
      } else {
        /*
         * If DA.live has not created an <a> yet,
         * use the cell text.
         */
        const cellText =
          cells[1].textContent.trim();

        if (cellText) {
          hasAuthoredCta = true;

          shopText = cellText;
        }
      }
    }
  }


  /* =========================================================
     3. FALLBACK HEADING
     ========================================================= */

  /*
   * This fallback is only for unusual authoring markup.
   *
   * IMPORTANT:
   * There is NO "Categories" fallback.
   */

  if (!headingText) {
    const headingElement =
      block.querySelector(
        'h1, h2, h3, h4, h5, h6',
      );

    if (headingElement) {
      headingText =
        headingElement.textContent.trim();
    }
  }


  /* =========================================================
     4. DATA SOURCE
     ========================================================= */

  const dataUrl = isProductGrid
    ? '/metadata.json'
    : '/query-index.json';


  const response =
    await fetch(dataUrl);

  if (!response.ok) {
    throw new Error(
      `Unable to load promo-grid data: ${response.status}`,
    );
  }


  const json =
    await response.json();

  const data =
    Array.isArray(json.data)
      ? json.data
      : [];

  const productPagePath = (item) => {
    const rawPath = String(
      item.path
      || item.Path
      || item.url
      || item.URL
      || '',
    ).trim();

    if (!rawPath) {
      return '#';
    }

    if (rawPath.includes('/eds-commerce/pages/products/')) {
      return rawPath;
    }

    const slug = rawPath
      .replace(/^https?:\/\/[^/]+/, '')
      .replace(/^\/?(?:products\/|eds-commerce\/pages\/products\/)/, '')
      .replace(/^\/+|\/+$/g, '');

    return slug
      ? `/eds-commerce/pages/products/${slug}`
      : '#';
  };


  /* =========================================================
     5. GET CATEGORIES OR PRODUCTS
     ========================================================= */

  let items = [];


  /*
   * CATEGORY PROMO GRID
   *
   * Uses query-index.json
   */
  if (!isProductGrid) {
    items = data.filter((item) => (
      item.template?.toLowerCase() === 'category'
      && item.path?.startsWith(
        '/eds-commerce/pages/categories/',
      )
    ));
  }


  /*
   * PRODUCT PROMO GRID
   *
   * Uses metadata.json
   *
  * Shows every product from metadata.json.
   */
  if (isProductGrid) {
    items = data.filter((item) => (
      item.template?.toLowerCase() === 'product'
    ));
  }


  /* =========================================================
     6. CREATE HEADER
     ========================================================= */

  const header =
    document.createElement('div');

  header.className =
    'promo-grid-header';


  /*
   * AUTHORED HEADING
   *
   * Whatever you type in DA.live will appear here.
   */
  if (headingText) {
    const heading =
      document.createElement('h2');

    heading.className =
      'promo-grid-title';

    heading.textContent =
      headingText;

    header.append(heading);
  }


  /*
   * AUTHORED CTA
   */
  if (hasAuthoredCta && (isProductGrid || !isCategoryListPage)) {
    const shopButton =
      document.createElement('a');

    shopButton.className =
      'promo-grid-shop';

    shopButton.href =
      shopHref;

    shopButton.textContent =
      shopText;

    header.append(shopButton);
  }


  /* =========================================================
     7. CREATE CARD LIST
     ========================================================= */

  const list =
    document.createElement('ul');

  list.className =
    'promo-grid-list';


  /* =========================================================
     8. CREATE CARDS
     ========================================================= */

  items.forEach((item) => {
    const card =
      document.createElement('li');

    card.className =
      'promo-card';


    const path = isProductGrid
      ? productPagePath(item)
      : item.path || item.Path || '#';


    const title =
      item.title
      || item.Title
      || '';


    const image =
      item.image
      || item.Image
      || '';


    const description =
      item.description
      || item.Description
      || '';


    const price =
      item.price
      || item.Price
      || '';


    /* =======================================================
       IMAGE
       ======================================================= */

    const cardLink =
      document.createElement('a');

    cardLink.className =
      'promo-card-link';

    cardLink.href =
      path;


    const cardImage =
      document.createElement('img');

    cardImage.className =
      'promo-card-image';

    cardImage.src =
      image;

    cardImage.alt =
      title;


    cardLink.append(cardImage);


    /* =======================================================
       CARD CONTENT
       ======================================================= */

    const cardContent =
      document.createElement('div');

    cardContent.className =
      'promo-card-content';


    /* TITLE */

    const cardTitle =
      document.createElement('h3');

    cardTitle.textContent =
      title;

    cardContent.append(cardTitle);


    /* =======================================================
       PRODUCT INFORMATION
       ======================================================= */

    if (isProductGrid) {

      /*
       * DESCRIPTION
       */
      if (description) {
        const cardDescription =
          document.createElement('p');

        cardDescription.textContent =
          description;

        cardContent.append(
          cardDescription,
        );
      }


      /*
       * PRICE
       */
      if (price) {
        const cardPrice =
          document.createElement('p');

        cardPrice.innerHTML =
          `&#8377;${price}`;

        cardContent.append(
          cardPrice,
        );
      }


      /*
       * VIEW PRODUCT
       */
      const productButton =
        document.createElement('a');

      productButton.className =
        'promo-card-cta';

      productButton.href =
        path;

      productButton.textContent =
        'View product';

      cardContent.append(
        productButton,
      );
    }


    /* =======================================================
       ASSEMBLE CARD
       ======================================================= */

    card.append(
      cardLink,
      cardContent,
    );

    list.append(card);
  });


  /* =========================================================
     9. NO ITEMS
     ========================================================= */

  const slides =
    [...list.children];

  if (!slides.length) {
    block.replaceChildren(header);
    return;
  }


  /* =========================================================
     10. CAROUSEL TRACK
     ========================================================= */

  const track =
    document.createElement('div');

  track.className =
    'promo-grid-track';

  track.append(list);


  /* =========================================================
     11. PREVIOUS BUTTON
     ========================================================= */

  const previousButton =
    document.createElement('button');

  previousButton.className =
    'promo-grid-previous';

  previousButton.type =
    'button';

  previousButton.setAttribute(
    'aria-label',
    'Previous promotion',
  );

  previousButton.innerHTML =
    '&#10094;';


  /* =========================================================
     12. NEXT BUTTON
     ========================================================= */

  const nextButton =
    document.createElement('button');

  nextButton.className =
    'promo-grid-next';

  nextButton.type =
    'button';

  nextButton.setAttribute(
    'aria-label',
    'Next promotion',
  );

  nextButton.innerHTML =
    '&#10095;';


  /* =========================================================
     13. DOTS
     ========================================================= */

  const dots =
    document.createElement('div');

  dots.className =
    'promo-grid-dots';

  dots.setAttribute(
    'role',
    'tablist',
  );

  dots.setAttribute(
    'aria-label',
    'Promotion navigation',
  );


  /* =========================================================
     14. CAROUSEL STATE
     ========================================================= */

  let currentIndex = 0;

  let autoplayTimer = null;



  /* =========================================================
     15. VISIBLE SLIDES
     ========================================================= */

  const getVisibleSlides = () => {
    if (window.innerWidth >= 1024) {
      return 4;
    }

    if (window.innerWidth >= 600) {
      return 2;
    }

    return 1;
  };


  /* =========================================================
     16. MAX INDEX
     ========================================================= */

  const getMaxIndex = () => (
    Math.max(
      0,
      slides.length - getVisibleSlides(),
    )
  );


  /* =========================================================
     17. UPDATE CAROUSEL
     ========================================================= */

  const updateCarousel = () => {
    const visibleSlides =
      getVisibleSlides();

    const slideWidth =
      100 / visibleSlides;


    slides.forEach((slide) => {
      slide.style.flex =
        `0 0 ${slideWidth}%`;
    });


    list.style.transform =
      `translateX(-${currentIndex * slideWidth}%)`;


    [...dots.children].forEach(
      (dot, index) => {
        dot.classList.toggle(
          'active',
          index === currentIndex,
        );
      },
    );
  };


  /* =========================================================
     18. CREATE DOTS
     ========================================================= */

  const createDots = () => {
    dots.replaceChildren();

    const maxIndex =
      getMaxIndex();

    for (
      let index = 0;
      index <= maxIndex;
      index += 1
    ) {
      const dot =
        document.createElement('button');

      dot.className =
        'promo-grid-dot';

      dot.type =
        'button';

      dot.setAttribute(
        'aria-label',
        `Go to promotion position ${index + 1}`,
      );


      dot.addEventListener(
        'click',
        () => {
          currentIndex =
            index;

          updateCarousel();

          startAutoplay();
        },
      );


      dots.append(dot);
    }
  };


  /* =========================================================
     19. AUTOPLAY
     ========================================================= */

  const stopAutoplay = () => {
    if (autoplayTimer) {
      clearInterval(
        autoplayTimer,
      );
    }

    autoplayTimer = null;
  };


  const startAutoplay = () => {
    stopAutoplay();

    if (slides.length <= getVisibleSlides()) {
      return;
    }


    autoplayTimer =
      setInterval(() => {
        currentIndex =
          currentIndex >= getMaxIndex()
            ? 0
            : currentIndex + 1;

        updateCarousel();
      }, 5000);
  };


  /* =========================================================
     20. PREVIOUS
     ========================================================= */

  previousButton.addEventListener(
    'click',
    () => {
      currentIndex =
        currentIndex <= 0
          ? getMaxIndex()
          : currentIndex - 1;

      updateCarousel();

      startAutoplay();
    },
  );


  /* =========================================================
     21. NEXT
     ========================================================= */

  nextButton.addEventListener(
    'click',
    () => {
      currentIndex =
        currentIndex >= getMaxIndex()
          ? 0
          : currentIndex + 1;

      updateCarousel();

      startAutoplay();
    },
  );


  /* =========================================================
     22. KEYBOARD
     ========================================================= */

  block.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'ArrowLeft') {
        previousButton.click();
      }

      if (event.key === 'ArrowRight') {
        nextButton.click();
      }
    },
  );


  /* =========================================================
     23. TOUCH / SWIPE
     ========================================================= */

  let touchStartX = 0;


  block.addEventListener(
    'touchstart',
    (event) => {
      touchStartX =
        event.changedTouches[0].screenX;
    },
    { passive: true },
  );


  block.addEventListener(
    'touchend',
    (event) => {
      const touchEndX =
        event.changedTouches[0].screenX;

      const difference =
        touchStartX - touchEndX;


      if (Math.abs(difference) < 50) {
        return;
      }


      if (difference > 0) {
        nextButton.click();
      } else {
        previousButton.click();
      }
    },
    { passive: true },
  );


  /* =========================================================
     24. HOVER
     ========================================================= */

  block.addEventListener(
    'mouseenter',
    stopAutoplay,
  );


  block.addEventListener(
    'mouseleave',
    () => {
      startAutoplay();
    },
  );


  /* =========================================================
     25. VISIBILITY
     ========================================================= */

  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    },
  );


  /* =========================================================
     26. RESIZE
     ========================================================= */

  window.addEventListener(
    'resize',
    () => {
      currentIndex =
        Math.min(
          currentIndex,
          getMaxIndex(),
        );

      createDots();

      updateCarousel();

      startAutoplay();
    },
  );


  /* =========================================================
     27. RENDER
     ========================================================= */

  block.replaceChildren(
    header,
    track,
    previousButton,
    nextButton,
    dots,
  );


  /* =========================================================
     28. INITIALIZE
     ========================================================= */

  createDots();

  updateCarousel();

  startAutoplay();
}