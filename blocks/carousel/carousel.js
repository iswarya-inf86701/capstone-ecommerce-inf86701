

const isCategory = block.classList.contains('category-carousel');
const isProduct = block.classList.contains('product-carousel');

async function renderCategories(block) {
    const response = await fetch('/data/products.json');
    if (!response.ok) {
        throw new Error('Failed to load products');
    }
    const { data } = await response.json();
    const categories = [
        ...new Set(data.map((product) => product.category)),
    ];

    categories.forEach((category) => {
        const categoryProduct = data.find(
            (product) => product.category === category,
        );
        const slide = document.createElement('div');
        const categorySlug = category
            .toLowerCase()
            .replace(/'/g, '')
            .replace(/\s+/g, '-');
        slide.innerHTML = `
      /category/${categorySlug}
        ${categoryProduct.image}
        <div class="category-content">
          <h3>${category}</h3>
        </div>
      </a>
    `;

        block.append(slide);
    });
}
export default function decorate(block) {
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
    let isPlaying = true;

    /*l,
     * Create carousel track
     */
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
     * Play / pause button
     */
    const playPauseButton = document.createElement('button');

    playPauseButton.className = 'carousel-play-pause';
    playPauseButton.type = 'button';
    playPauseButton.setAttribute('aria-label', 'Pause carousel');
    playPauseButton.innerHTML = '&#10074;&#10074;';

    /*
     * Dots
     */
    const dots = document.createElement('div');

    dots.className = 'carousel-dots';
    dots.setAttribute('role', 'tablist');
    dots.setAttribute('aria-label', 'Carousel navigation');

    block.append(previousButton, playPauseButton, nextButton, dots);

    /*
     * Number of visible slides
     */
    function getVisibleSlides() {
        if (window.innerWidth >= 1024) {
            return 3;
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
        if (!isPlaying || slides.length <= getVisibleSlides()) {
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

    block.addEventListener('mouseleave', () => {
        if (isPlaying) {
            startAutoplay();
        }
    });

    playPauseButton.addEventListener('click', () => {
        isPlaying = !isPlaying;

        if (isPlaying) {
            playPauseButton.innerHTML = '&#10074;&#10074;';
            playPauseButton.setAttribute('aria-label', 'Pause carousel');
            startAutoplay();
        } else {
            playPauseButton.innerHTML = '&#9654;';
            playPauseButton.setAttribute('aria-label', 'Play carousel');
            stopAutoplay();
        }
    });

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