export default async function decorate(block) {
  const isProductGrid = block.classList.contains('products')
    || block.classList.contains('featured-products');
  const dataUrl = isProductGrid
    ? '/eds-commerce/pages/metadata.json'
    : '/query-index.json';

  const response = await fetch(dataUrl);
  if (!response.ok) {
    throw new Error(`Unable to load promo-grid data: ${response.status}`);
  }

  const json = await response.json();
  const data = Array.isArray(json.data) ? json.data : [];

  const items = data.filter((item) => {
    if (!isProductGrid) {
      return item.template?.toLowerCase() === 'category'
        && item.path?.startsWith('/eds-commerce/pages/categories/');
    }

    if (isProductGrid) {
      return item.template?.toLowerCase() === 'product';
    }

    return false;
  });


  const cards = items.map((item) => `
  <li class="promo-card">
      <a href="${item.path || item.Path || '#'}" class="promo-card-link">
        <img class="promo-card-image" src="${item.image || item.Image || ''}" alt="${item.title || item.Title || ''}">
      </a>

      <div class="promo-card-content">
        <h3>${item.title || item.Title || ''}</h3>

        ${isProductGrid ? `<p>${item.description || item.Description || ''}</p>` : ''}
        ${isProductGrid ? `<p>&#8377;${item.price || item.Price || ''}</p>` : ''}
        ${isProductGrid ? `<button class="promo-card-cta">Add to Cart</button>` : ''}
      </div>
    </li>
  `).join('');

  const list = document.createElement('ul');
  list.className = 'promo-grid-list';
  list.innerHTML = cards;

    const slides = [...list.children];
    if (!slides.length) return;

    const track = document.createElement('div');
    track.className = 'promo-grid-track';
    track.append(list);

    const previousButton = document.createElement('button');
    previousButton.className = 'promo-grid-previous';
    previousButton.type = 'button';
    previousButton.setAttribute('aria-label', 'Previous promotion');
    previousButton.innerHTML = '&#10094;';

    const nextButton = document.createElement('button');
    nextButton.className = 'promo-grid-next';
    nextButton.type = 'button';
    nextButton.setAttribute('aria-label', 'Next promotion');
    nextButton.innerHTML = '&#10095;';

    const dots = document.createElement('div');
    dots.className = 'promo-grid-dots';
    dots.setAttribute('role', 'tablist');
    dots.setAttribute('aria-label', 'Promotion navigation');

    let currentIndex = 0;
    let autoplayTimer;
    let isPlaying = true;

    const getVisibleSlides = () => {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 600) return 2;
      return 1;
    };

    const getMaxIndex = () => Math.max(0, slides.length - getVisibleSlides());

    const updateCarousel = () => {
      const slideWidth = 100 / getVisibleSlides();
      slides.forEach((slide) => {
        slide.style.flex = `0 0 ${slideWidth}%`;
      });
      list.style.transform = `translateX(-${currentIndex * slideWidth}%)`;
      [...dots.children].forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
      });
    };

    const createDots = () => {
      dots.replaceChildren();
      for (let index = 0; index <= getMaxIndex(); index += 1) {
        const dot = document.createElement('button');
        dot.className = 'promo-grid-dot';
        dot.type = 'button';
        dot.setAttribute('aria-label', `Go to promotion position ${index + 1}`);
        dot.addEventListener('click', () => {
          currentIndex = index;
          updateCarousel();
          startAutoplay();
        });
        dots.append(dot);
      }
    };

    const stopAutoplay = () => {
      if (autoplayTimer) clearInterval(autoplayTimer);
      autoplayTimer = null;
    };

    const startAutoplay = () => {
      stopAutoplay();
      if (!isPlaying || slides.length <= getVisibleSlides()) return;
      autoplayTimer = setInterval(() => {
        currentIndex = currentIndex >= getMaxIndex() ? 0 : currentIndex + 1;
        updateCarousel();
      }, 5000);
    };

    previousButton.addEventListener('click', () => {
      currentIndex = currentIndex <= 0 ? getMaxIndex() : currentIndex - 1;
      updateCarousel();
      startAutoplay();
    });

    nextButton.addEventListener('click', () => {
      currentIndex = currentIndex >= getMaxIndex() ? 0 : currentIndex + 1;
      updateCarousel();
      startAutoplay();
    });

    block.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') previousButton.click();
      if (event.key === 'ArrowRight') nextButton.click();
    });

    let touchStartX = 0;
    block.addEventListener('touchstart', (event) => {
      touchStartX = event.changedTouches[0].screenX;
    }, { passive: true });

    block.addEventListener('touchend', (event) => {
      const difference = touchStartX - event.changedTouches[0].screenX;
      if (Math.abs(difference) < 50) return;
      if (difference > 0) nextButton.click();
      else previousButton.click();
    }, { passive: true });

    block.addEventListener('mouseenter', stopAutoplay);
    block.addEventListener('mouseleave', () => {
      if (isPlaying) startAutoplay();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAutoplay();
      else startAutoplay();
    });

    window.addEventListener('resize', () => {
      currentIndex = Math.min(currentIndex, getMaxIndex());
      createDots();
      updateCarousel();
      startAutoplay();
    });

    block.replaceChildren(track, previousButton, nextButton, dots);
    createDots();
    updateCarousel();
    startAutoplay();
}