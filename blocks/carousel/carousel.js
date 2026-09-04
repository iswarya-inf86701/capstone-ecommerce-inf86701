import { createOptimizedPicture } from '../../scripts/aem.js';

async function getIndexedItems(block) {
  const response = await fetch('/query-index.json');
  if (!response.ok) {
    throw new Error(`Unable to load query index: ${response.status}`);
  }

  const json = await response.json();
  const data = Array.isArray(json.data) ? json.data : [];
  const isProductCarousel = block.classList.contains('product-carousel')
    || block.classList.contains('products');

  return data.filter((item) => {
    const template = item.template?.toLowerCase();
    if (isProductCarousel) return template === 'product';
    return template === 'category'
      && item.path?.startsWith('/eds-commerce/pages/categories/');
  });
}

function renderIndexedItems(block, items) {
  block.replaceChildren(...items.map((item) => {
    const row = document.createElement('div');
    const imageColumn = document.createElement('div');
    const link = document.createElement('a');
    link.href = item.path || '#';
    link.title = item.title || '';
    link.append(createOptimizedPicture(item.image, item.title || '', false, [{ width: '750' }]));
    imageColumn.append(link);

    const contentColumn = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = item.title || '';
    contentColumn.append(title);

    if (block.classList.contains('product-carousel') || block.classList.contains('products')) {
      const description = document.createElement('p');
      description.textContent = item.description || '';
      const price = document.createElement('p');
      price.textContent = item.price ? `$${item.price}` : '';
      contentColumn.append(description, price);
    }

    row.append(imageColumn, contentColumn);
    return row;
  }));
}

export default async function decorate(block) {
  if (block.classList.contains('category-carousel')
    || block.classList.contains('product-carousel')
    || block.classList.contains('categories')
    || block.classList.contains('products')) {
    const items = await getIndexedItems(block);
    renderIndexedItems(block, items);
  }

  // Remove empty rows created in EDS
  [...block.children].forEach((slide) => {
    const hasContent = slide.textContent.trim()
      || slide.querySelector('img, picture, a');

    if (!hasContent) {
      slide.remove();
    }
  });

  const slides = [...block.children];

  if (!slides.length) return;

  let currentIndex = 0;
  let autoplayTimer;

  const track = document.createElement('div');
  track.className = 'carousel-track';

  slides.forEach((slide, index) => {
    slide.classList.add('carousel-slide');

    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute(
      'aria-label',
      `${index + 1} of ${slides.length}`,
    );

    track.append(slide);
  });

  block.append(track);

  /*
   * Previous button
   */
  const previousButton = document.createElement('button');

  previousButton.className = 'carousel-previous';
  previousButton.type = 'button';
  previousButton.setAttribute('aria-label', 'Previous slide');
  previousButton.innerHTML = '&#10094;';

  /*
   * Next button
   */
  const nextButton = document.createElement('button');

  nextButton.className = 'carousel-next';
  nextButton.type = 'button';
  nextButton.setAttribute('aria-label', 'Next slide');
  nextButton.innerHTML = '&#10095;';

  /*
   * Dots
   */
  const dots = document.createElement('div');

  dots.className = 'carousel-dots';
  dots.setAttribute('role', 'tablist');
  dots.setAttribute('aria-label', 'Carousel navigation');

  block.append(previousButton, nextButton, dots);

  /*
   * Number of visible slides
   */
  function getVisibleSlides() {
    if (window.innerWidth >= 1024) {
      return 4;
    }

    if (window.innerWidth >= 600) {
      return 2;
    }

    return 1;
  }

  /*
   * Maximum carousel position
   */
  function getMaxIndex() {
    return Math.max(
      0,
      slides.length - getVisibleSlides(),
    );
  }

  /*
   * Create dots dynamically
   */
  function createDots() {
    dots.innerHTML = '';

    const maxIndex = getMaxIndex();

    for (let i = 0; i <= maxIndex; i += 1) {
      const dot = document.createElement('button');

      dot.className = 'carousel-dot';
      dot.type = 'button';

      dot.setAttribute(
        'aria-label',
        `Go to position ${i + 1}`,
      );

      dot.addEventListener('click', () => {
        currentIndex = i;

        updateCarousel();
        restartAutoplay();
      });

      dots.append(dot);
    }
  }

  /*
   * Update carousel position
   */
  function updateCarousel() {
    const visibleSlides = getVisibleSlides();

    const slideWidth = 100 / visibleSlides;

    slides.forEach((slide) => {
      slide.style.flex = `0 0 ${slideWidth}%`;
    });

    track.style.transform =
      `translateX(-${currentIndex * slideWidth}%)`;

    /*
     * Update dots
     */
    [...dots.children].forEach((dot, index) => {
      dot.classList.toggle(
        'active',
        index === currentIndex,
      );
    });
  }

  /*
   * Next
   */
  function nextSlide() {
    const maxIndex = getMaxIndex();

    currentIndex += 1;

    if (currentIndex > maxIndex) {
      currentIndex = 0;
    }

    updateCarousel();
  }

  /*
   * Previous
   */
  function previousSlide() {
    const maxIndex = getMaxIndex();

    currentIndex -= 1;

    if (currentIndex < 0) {
      currentIndex = maxIndex;
    }

    updateCarousel();
  }

  /*
   * Arrow events
   */
  previousButton.addEventListener('click', () => {
    previousSlide();
    restartAutoplay();
  });

  nextButton.addEventListener('click', () => {
    nextSlide();
    restartAutoplay();
  });

  /*
   * Keyboard navigation
   */
  block.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      previousSlide();
      restartAutoplay();
    }

    if (event.key === 'ArrowRight') {
      nextSlide();
      restartAutoplay();
    }
  });

  /*
   * Touch / swipe
   */
  let touchStartX = 0;

  block.addEventListener(
    'touchstart',
    (event) => {
      touchStartX = event.changedTouches[0].screenX;
    },
    { passive: true },
  );

  block.addEventListener(
    'touchend',
    (event) => {
      const touchEndX = event.changedTouches[0].screenX;

      const difference = touchStartX - touchEndX;

      if (Math.abs(difference) < 50) {
        return;
      }

      if (difference > 0) {
        nextSlide();
      } else {
        previousSlide();
      }

      restartAutoplay();
    },
    { passive: true },
  );

  /*
   * Autoplay
   */
  function startAutoplay() {
    stopAutoplay();

    // Don't autoplay if there is nothing to slide
    if (slides.length <= getVisibleSlides()) {
      return;
    }

    autoplayTimer = setInterval(() => {
      nextSlide();
    }, 5000);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  /*
   * Pause when mouse is over carousel
   */
  block.addEventListener('mouseenter', stopAutoplay);

  block.addEventListener('mouseleave', startAutoplay);

  /*
   * Pause when browser tab is hidden
   */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  /*
   * Resize
   */
  window.addEventListener('resize', () => {
    const maxIndex = getMaxIndex();

    if (currentIndex > maxIndex) {
      currentIndex = maxIndex;
    }

    createDots();
    updateCarousel();
  });

  /*
   * Initial setup
   */
  createDots();
  updateCarousel();
  startAutoplay();
}