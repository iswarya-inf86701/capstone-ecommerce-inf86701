export default function decorate(block) {
  const rows = [...block.children];

  // Expected authoring:
  // Row 1: Image
  // Row 2: Title
  // Row 3: Description
  // Row 4: CTA

  const image = rows[0]?.querySelector('img');
  const title = rows[1]?.textContent.trim() || '';
  const description = rows[2]?.textContent.trim() || '';
  const cta = rows[3]?.querySelector('a');

  block.innerHTML = '';

  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'promo-banner-image';

  if (image) {
    imageWrapper.append(image);
  }

  const content = document.createElement('div');
  content.className = 'promo-banner-content';

  if (title) {
    const heading = document.createElement('h2');
    heading.textContent = title;
    content.append(heading);
  }

  if (description) {
    const text = document.createElement('p');
    text.textContent = description;
    content.append(text);
  }

  if (cta) {
    const button = document.createElement('a');

    button.className = 'promo-banner-cta';
    button.href = cta.href;
    button.textContent = cta.textContent.trim();

    if (cta.target) {
      button.target = cta.target;
    }

    content.append(button);
  }

  block.append(imageWrapper, content);
}