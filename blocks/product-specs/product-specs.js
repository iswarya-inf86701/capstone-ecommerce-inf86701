export default async function decorate(block) {
  const currentPath = window.location.pathname.replace(/\/$/, '');

  let metadata = null;

  try {
    // Load the metadata.json for the current product
    const response = await fetch(`${currentPath}/metadata.json`);

    if (!response.ok) {
      throw new Error(`Unable to load metadata.json: ${response.status}`);
    }

    metadata = await response.json();
  } catch (error) {
    console.error('Unable to load product metadata:', error);
    block.innerHTML = '<p>Unable to load product specifications.</p>';
    return;
  }

  /*
   * Expected metadata.json:
   *
   * {
   *   "specifications": {
   *     "Finish": "Matte",
   *     "Brand": "Glam Beauty",
   *     "Shade": "Ruby Red",
   *     "Size": "4.2g"
   *   }
   * }
   */

  let specifications = metadata.specifications || {};

  // Handle specifications if they are stored as a JSON string
  if (typeof specifications === 'string') {
    try {
      specifications = JSON.parse(specifications);
    } catch (error) {
      console.error('Invalid specifications data:', error);
      specifications = {};
    }
  }

  // Make sure specifications is an object
  if (
    typeof specifications !== 'object'
    || Array.isArray(specifications)
  ) {
    specifications = {};
  }

  const entries = Object.entries(specifications).filter(
    ([, value]) =>
      value !== undefined
      && value !== null
      && String(value).trim() !== '',
  );

  if (!entries.length) {
    block.innerHTML = '<p>No specifications available.</p>';
    return;
  }

  const rows = entries
    .map(
      ([key, value]) => `
        <div class="product-specs-row">
          <div class="product-specs-key">
            ${key}
          </div>
          <div class="product-specs-value">
            ${value}
          </div>
        </div>
      `,
    )
    .join('');

  block.innerHTML = `
    <div class="product-specs">
      <h2 class="product-specs-title">
        Specifications
      </h2>

      <div class="product-specs-table">
        ${rows}
      </div>
    </div>
  `;
}