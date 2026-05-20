import {
  appCache
} from '../services/cacheService.js';

let debounceTimer = null;

function getUniqueValues(
  data,
  field
) {

  return [
    ...new Set(
      data.map(
        row => row[field]
      )
    )
  ]
  .filter(Boolean)
  .sort();

}

export function renderFilters() {

  const brands =
    getUniqueValues(
      appCache.productMaster,
      'brand'
    );

  const articleTypes =
    getUniqueValues(
      appCache.productMaster,
      'article_type'
    );

  const statuses =
    getUniqueValues(
      appCache.productMaster,
      'status'
    );

  return `

    <div class="filters-bar sticky-filters">

      <div class="filters-grid">

        <div class="filter-group">

          <label class="filter-label">
            Brand
          </label>

          <select
            class="filter-select"
            id="brandFilter"
          >

            <option value="">
              ALL BRANDS
            </option>

            ${brands.map(item => `

              <option value="${item}">
                ${item}
              </option>

            `).join('')}

          </select>

        </div>

        <div class="filter-group">

          <label class="filter-label">
            Article Type
          </label>

          <select
            class="filter-select"
            id="articleFilter"
          >

            <option value="">
              ALL ARTICLE TYPES
            </option>

            ${articleTypes.map(item => `

              <option value="${item}">
                ${item}
              </option>

            `).join('')}

          </select>

        </div>

        <div class="filter-group">

          <label class="filter-label">
            Status
          </label>

          <select
            class="filter-select"
            id="statusFilter"
          >

            <option value="">
              ALL STATUS
            </option>

            ${statuses.map(item => `

              <option value="${item}">
                ${item}
              </option>

            `).join('')}

          </select>

        </div>

        <div class="filter-group">

          <label class="filter-label">
            Search
          </label>

          <input
            type="text"
            class="filter-input"
            id="globalSearch"
            placeholder="STYLE ID / ERP SKU / BRAND"
          >

        </div>

      </div>

    </div>

  `;
}

export function initializeFilters() {

  const searchInput =
    document.getElementById(
      'globalSearch'
    );

  if (!searchInput) {
    return;
  }

  searchInput.addEventListener(
    'input',
    event => {

      clearTimeout(
        debounceTimer
      );

      debounceTimer =
        setTimeout(() => {

          console.log(
            'SEARCH:',
            event.target.value
          );

        }, 300);

    }
  );
}
