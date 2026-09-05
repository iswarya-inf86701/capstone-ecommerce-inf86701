export default async function decorate(block) {
  // =========================================================
  // HELPER: GET ACTUAL IMAGE URL
  // =========================================================

  function getImageUrl(value) {
    if (!value) {
      return '';
    }

    const trimmedValue = value.trim();

    // -------------------------------------------------------
    // Markdown image/link format
    //
    // Example:
    // [https://example.com/image.jpg](https://example.com/image.jpg "...")
    // -------------------------------------------------------

    const markdownMatch = trimmedValue.match(
      /\]\((https?:\/\/[^)\s]+)/
    );

    if (markdownMatch) {
      return markdownMatch[1];
    }

    // -------------------------------------------------------
    // Plain URL
    // -------------------------------------------------------

    if (
      trimmedValue.startsWith('http://')
      || trimmedValue.startsWith('https://')
    ) {
      return trimmedValue;
    }

    return '';
  }


  // =========================================================
  // GET AUTHORED GALLERY IMAGES
  // =========================================================

  const authoredImages = [...block.querySelectorAll('a')]
    .map((link) => link.href)
    .filter(Boolean);


  // =========================================================
  // GET MAIN PRODUCT IMAGE FROM metadata.json
  // =========================================================

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
  } catch (error) {
    console.error(
      'Could not load metadata image:',
      error
    );
  }


  // =========================================================
  // BUILD IMAGE LIST
  //
  // Metadata image comes FIRST.
  // Authored images come AFTER it.
  // =========================================================

  const images = [
    metadataImage,
    ...authoredImages,
  ].filter(Boolean);


  // Remove duplicate image URLs
  const uniqueImages = [...new Set(images)];


  // =========================================================
  // NO IMAGES AVAILABLE
  // =========================================================

  if (!uniqueImages.length) {
    block.innerHTML = '<p>No images available.</p>';
    return;
  }


  // =========================================================
  // CREATE GALLERY LAYOUT
  // =========================================================

  const gallery = document.createElement('div');
  gallery.className = 'product-gallery-layout';


  // =========================================================
  // CREATE THUMBNAILS CONTAINER
  // =========================================================

  const thumbnails = document.createElement('div');
  thumbnails.className = 'product-gallery-thumbnails';


  // =========================================================
  // CREATE MAIN IMAGE VIEWER
  // =========================================================

  const viewer = document.createElement('div');
  viewer.className = 'product-gallery-viewer';


  const mainImage = document.createElement('img');
  mainImage.className = 'product-gallery-main-image';


  // =========================================================
  // FIRST IMAGE = metadata.json IMAGE
  // =========================================================

  mainImage.src = uniqueImages[0];
  mainImage.alt = 'Product image';

  viewer.appendChild(mainImage);


  // =========================================================
  // CREATE THUMBNAILS
  // =========================================================

  uniqueImages.forEach((imageUrl, index) => {
    const thumbnail = document.createElement('button');

    thumbnail.type = 'button';
    thumbnail.className = 'product-gallery-thumbnail';


    // First thumbnail is the metadata.json image
    if (index === 0) {
      thumbnail.classList.add('active');
    }


    const thumbnailImage = document.createElement('img');

    thumbnailImage.src = imageUrl;
    thumbnailImage.alt = `Product image ${index + 1}`;


    thumbnail.appendChild(thumbnailImage);


    // =======================================================
    // THUMBNAIL CLICK
    // =======================================================

    thumbnail.addEventListener('click', () => {

      // Change main image
      mainImage.src = imageUrl;


      // Remove active state from all thumbnails
      thumbnails
        .querySelectorAll('.product-gallery-thumbnail')
        .forEach((item) => {
          item.classList.remove('active');
        });


      // Set clicked thumbnail as active
      thumbnail.classList.add('active');
    });


    thumbnails.appendChild(thumbnail);
  });


  // =========================================================
  // ADD ELEMENTS TO GALLERY
  // =========================================================

  gallery.appendChild(thumbnails);
  gallery.appendChild(viewer);


  // =========================================================
  // REPLACE AUTHORED CONTENT
  // =========================================================

  block.replaceChildren(gallery);
}