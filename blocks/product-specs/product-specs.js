export default function decorate(block) {
  const rows = [...block.children];

  if (!rows.length) {
    return;
  }

  const table = document.createElement('table');
  table.className = 'product-specs-table';

  const tbody = document.createElement('tbody');

  rows.forEach((row) => {
    const cells = [...row.children];

    if (cells.length < 2) {
      return;
    }

    const tr = document.createElement('tr');

    const keyCell = document.createElement('th');
    keyCell.textContent = cells[0].textContent.trim();

    const valueCell = document.createElement('td');
    valueCell.textContent = cells[1].textContent.trim();

    tr.append(keyCell, valueCell);
    tbody.append(tr);
  });

  table.append(tbody);

  const heading = document.createElement('h2');
  heading.textContent = 'Specifications';

  block.replaceChildren(
    heading,
    table,
  );
}