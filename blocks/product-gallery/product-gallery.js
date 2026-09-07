export default async function decorate(block) {
  function getImageUrl(value) {
    if (!value) {
      return '';
    }

    const trimmedValue = value.trim();

    const markdownMatch = trimmedValue.match(
      /\]\((https?:\/\/[^)\s]+)/,
    );

    if (markdownMatch) {
      return markdownMatch[1];
    }

    if (
      trimmedValue.startsWith('http://')
      || trimmedValue.startsWith('https://')
    ) {
      return trimmedValue;
    }

    return '';
  }

  const authoredImages = [...block.querySelectorAll('a')]
    .map((link) => link.href)
    .filter(Boolean);

  let metadataImage = '';

  try {
    const response = await fetch('/metadata.json');

    if (!response.ok) {
      throw new Error(`Metadata request failed: ${response.status}`);
    }

    const metadata = await response.json();
    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    const products = Array.isArray(metadata.data) ? metadata.data : [];

    const currentProduct = products.find((item) => {
      const itemPath = (
        item.path
        || item.Path
        || item.url
        || item.URL
        || ''
      ).replace(/\/$/, '') || '/';

      return itemPath === currentPath;
    });

    metadataImage = getImageUrl(
      currentProduct?.image
      || currentProduct?.Image
      || '',
    );
  } catch {
    metadataImage = '';
  }

  const images = [
    metadataImage,
    ...authoredImages,
  ].filter(Boolean);
  const uniqueImages = [...new Set(images)];

  if (!uniqueImages.length) {
    block.innerHTML = '<p>No images available.</p>';
    return;
  }

  const gallery = document.createElement('div');
  gallery.className = 'product-gallery-layout';

  const thumbnails = document.createElement('div');
  thumbnails.className = 'product-gallery-thumbnails';

  const viewer = document.createElement('div');
  viewer.className = 'product-gallery-viewer';

  const mainImage = document.createElement('img');
  mainImage.className = 'product-gallery-main-image';

  const [primaryImage] = uniqueImages;

  mainImage.src = primaryImage;
  mainImage.alt = 'Product image';

  viewer.appendChild(mainImage);

  uniqueImages.forEach((imageUrl, index) => {
    const thumbnail = document.createElement('button');

    thumbnail.type = 'button';
    thumbnail.className = 'product-gallery-thumbnail';
    if (index === 0) {
      thumbnail.classList.add('active');
    }

    const thumbnailImage = document.createElement('img');

    thumbnailImage.src = imageUrl;
    thumbnailImage.alt = `Product image ${index + 1}`;

    thumbnail.appendChild(thumbnailImage);

    thumbnail.addEventListener('click', () => {
      mainImage.src = imageUrl;
      thumbnails
        .querySelectorAll('.product-gallery-thumbnail')
        .forEach((item) => {
          item.classList.remove('active');
        });
      thumbnail.classList.add('active');
    });

    thumbnails.appendChild(thumbnail);
  });

  gallery.appendChild(thumbnails);
  gallery.appendChild(viewer);

  block.replaceChildren(gallery);
}
