export default function decorate(block) {
  const images = block.querySelectorAll('picture');

  let current = 0;
  let playing = true;

  images.forEach((img, index) => {
    if (index !== 0) {
      img.style.display = 'none';
    }
  });

  const controls = document.createElement('div');
  controls.className = 'hero-controls';

  controls.innerHTML = `
    <button class="prev" type="button" aria-label="Previous slide">&#10094;</button>
    <button class="play-pause" type="button" aria-label="Pause slideshow">&#10074;&#10074;</button>
    <button class="next" type="button" aria-label="Next slide">&#10095;</button>
    <span class="counter">
      <span class="current">1</span>/${images.length}
    </span>
  `;

  const indicators = document.createElement('div');
  indicators.className = 'hero-indicators';

  images.forEach((_, i) => {
    const line = document.createElement('span');
    line.className = `hero-line ${i === 0 ? 'active' : ''}`;
    indicators.appendChild(line);
  });

  block.append(controls);
  block.append(indicators);

  const update = () => {
    images.forEach((img, i) => {
      img.style.display = i === current ? 'block' : 'none';
    });

    block.querySelector('.current').textContent = current + 1;

    indicators.querySelectorAll('.hero-line')
      .forEach((line, i) => {
        line.classList.toggle('active', i === current);
      });
  };

  controls.querySelector('.prev').addEventListener('click', () => {
    current = (current - 1 + images.length) % images.length;
    update();
  });

  controls.querySelector('.next').addEventListener('click', () => {
    current = (current + 1) % images.length;
    update();
  });

  controls.querySelector('.play-pause').addEventListener('click', (e) => {
    playing = !playing;
    e.target.textContent = playing ? '⏸' : '▶';
  });

  setInterval(() => {
    if (playing) {
      current = (current + 1) % images.length;
      update();
    }
  }, 5000);
}