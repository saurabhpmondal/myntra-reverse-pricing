import {
  appCache
} from '../services/cacheService.js';

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
            Continue Rule
          </label>

          <select
            class="filter-select"
            id="continueRuleFilter"
          >

            <option value="TP+5%">
              TP+5%
            </option>

            <option value="TP">
              TP
            </option>

            <option value="TP-5%">
              TP-5%
            </option>

            <option value="TP-10%">
              TP-10%
            </option>

            <option value="TP-15%">
              TP-15%
            </option>

          </select>

        </div>

        <div class="filter-group">

          <label class="filter-label">
            Other Status Rule
          </label>

          <select
            class="filter-select"
            id="otherRuleFilter"
          >

            <option value="TP">
              TP
            </option>

            <option value="TP-5%">
              TP-5%
            </option>

            <option value="TP-10%">
              TP-10%
            </option>

            <option value="TP-15%">
              TP-15%
            </option>

            <option value="TP-20%">
              TP-20%
            </option>

            <option value="TP-30%">
              TP-30%
            </option>

            <option value="TP-40%">
              TP-40%
            </option>

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