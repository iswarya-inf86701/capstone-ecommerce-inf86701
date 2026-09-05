export default async function decorate(block) {
  // Get authored image links
  const authoredImages = [...block.querySelectorAll('a')]
    .map((link) => link.href)
    .filter(Boolean);

  // Get the main product image from metadata.json
  let metadataImage = '';

  try {
    const response = await fetch('/metadata.json');

    if (response.ok) {
      const metadata = await response.json();

      const imageEntry = metadata.data?.find(
        (item) =>
          item.name?.toLowerCase() === 'image'
          || item.name?.toLowerCase() === 'image-url'
      );

      if (imageEntry) {
        metadataImage = imageEntry.value || '';
      }
    }
  } catch (error) {
    console.error('Could not load metadata image:', error);
  }

  // Main metadata image first, then authored gallery images
  const images = [
    metadataImage,
    ...authoredImages,
  ].filter(Boolean);

  // Remove duplicate URLs
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

  // FIRST IMAGE = metadata.json image
  mainImage.src = uniqueImages[0];
  mainImage.alt = 'Aloe Vera';

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
      // Change main image
      mainImage.src = imageUrl;

      // Change active thumbnail
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