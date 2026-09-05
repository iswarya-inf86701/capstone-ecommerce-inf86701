function normalizePath(path) {
  return String(path || '').replace(/\/$/, '') || '/';
}

function parseSpecifications(value) {
  if (!value) return [];

  if (typeof value === 'object' && !Array.isArray(value)) {
    return Object.entries(value);
  }

  const text = String(value).trim().replace(/^\{|\}$/g, '');

  try {
    const parsed = JSON.parse(`{${text}}`);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return Object.entries(parsed);
    }
  } catch (error) {
    // Live metadata may use unquoted keys and values.
  }

  return text
    .split(',')
    .map((entry) => {
      const separator = entry.indexOf(':');
      if (separator < 1) return null;

      return [
        entry.slice(0, separator).trim(),
        entry.slice(separator + 1).trim(),
      ];
    })
    .filter((entry) => entry && entry[0] && entry[1]);
}

export default async function decorate(block) {
  const currentPath = normalizePath(window.location.pathname);

  try {
    const response = await fetch('/metadata.json');

    if (!response.ok) {
      throw new Error(`Unable to load metadata.json: ${response.status}`);
    }

    const json = await response.json();
    const product = (Array.isArray(json.data) ? json.data : []).find((item) => (
      normalizePath(item.url || item.URL || item.path || item.Path) === currentPath
    ));

    const entries = parseSpecifications(
      product?.specifications || product?.Specifications,
    );

    if (!entries.length) {
      block.innerHTML = '<p>No specifications available.</p>';
      return;
    }

    const heading = document.createElement('h2');
    heading.textContent = 'Specifications';

    const table = document.createElement('table');
    table.className = 'product-specs-table';

    const tbody = document.createElement('tbody');
    entries.forEach(([key, value]) => {
      const row = document.createElement('tr');
      const keyCell = document.createElement('th');
      const valueCell = document.createElement('td');
      keyCell.textContent = key;
      valueCell.textContent = value;
      row.append(keyCell, valueCell);
      tbody.append(row);
    });

    table.append(tbody);
    block.replaceChildren(heading, table);
  } catch (error) {
    console.error('Unable to load product specifications:', error);
    block.innerHTML = '<p>Unable to load product specifications.</p>';
  }
}
