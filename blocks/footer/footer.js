import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

function buildDefaultFooter() {
  const footer = document.createElement('div');
  footer.innerHTML = `
    <div>
      <h2>Shop</h2>
      <ul>
        <li><a href="/eds-commerce/pages/help">Help</a></li>
        <li><a href="/eds-commerce/pages/shipping">Shipping</a></li>
        <li><a href="/eds-commerce/pages/returns">Returns</a></li>
        <li><a href="/eds-commerce/pages/privacy">Privacy</a></li>
        <li><a href="/eds-commerce/pages/terms">Terms</a></li>
      </ul>
    </div>
    <div>
      <h2>Social</h2>
      <ul>
        <li><a href="https://www.instagram.com/">Instagram</a></li>
        <li><a href="https://www.facebook.com/">Facebook</a></li>
        <li><a href="https://www.youtube.com/">YouTube</a></li>
      </ul>
    </div>
  `;
  return footer;
}

function isSectionBreak(element) {
  return element.matches('hr, .section-break') || !!element.querySelector('hr, .section-break');
}

function isCopyrightColumn(column) {
  return /copyright|©|&copy;/i.test(column.textContent.trim());
}

function appendFooterColumn(footer, columns, column) {
  if (!column.children.length) return;

  if (isCopyrightColumn(column)) {
    column.classList.remove('footer-column');
    column.classList.add('footer-copyright');
    footer.append(column);
    return;
  }

  columns.append(column);
}

function decorateFooterContent(footer) {
  const columns = document.createElement('div');
  columns.className = 'footer-columns';
  const sections = footer.querySelectorAll(':scope > .section');

  if (sections.length) {
    sections.forEach((section) => {
      const column = document.createElement('div');
      column.className = 'footer-column';

      [...section.children].forEach((item) => {
        column.append(item);
      });

      if (column.textContent.trim() || column.querySelector('img, picture')) {
        appendFooterColumn(footer, columns, column);
      }
    });

    footer.prepend(columns);
  } else {
    let currentColumn = document.createElement('div');
    currentColumn.className = 'footer-column';

    [...footer.children].forEach((item) => {
      if (isSectionBreak(item)) {
        appendFooterColumn(footer, columns, currentColumn);

        currentColumn = document.createElement('div');
        currentColumn.className = 'footer-column';
        return;
      }

      if (item.textContent.trim() || item.querySelector('img, picture')) {
        currentColumn.append(item);
      }
    });

    appendFooterColumn(footer, columns, currentColumn);

    footer.prepend(columns);
  }

  footer.querySelectorAll('ul').forEach((list) => {
    list.classList.add('footer-links');
  });

  footer.querySelectorAll('a[href^="http"]').forEach((link) => {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/eds-commerce/fragments/footer';
  const fragment = await loadFragment(footerPath);
  const footer = document.createElement('div');

  block.textContent = '';

  if (fragment) {
    while (fragment.firstElementChild) footer.append(fragment.firstElementChild);
  } else {
    footer.append(...buildDefaultFooter().children);
  }

  decorateFooterContent(footer);
  block.append(footer);
}
