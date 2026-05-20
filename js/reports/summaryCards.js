import {
  appCache
} from '../services/cacheService.js';

function getUniqueCount(
  data,
  field
) {

  return new Set(
    data.map(
      row => row[field]
    )
  ).size;
}

export function renderSummaryCards() {

  const totalStyles =
    appCache.productMaster.length;

  const totalBrands =
    getUniqueCount(
      appCache.productMaster,
      'brand'
    );

  const totalArticleTypes =
    getUniqueCount(
      appCache.productMaster,
      'article_type'
    );

  const continueStyles =
    appCache.productMaster.filter(
      row =>
        row.status === 'CONTINUE'
    ).length;

  return `

    <div class="cards-grid">

      <div class="summary-card">

        <div class="summary-title">
          TOTAL STYLES
        </div>

        <div class="summary-value">
          ${totalStyles.toLocaleString()}
        </div>

      </div>

      <div class="summary-card">

        <div class="summary-title">
          TOTAL BRANDS
        </div>

        <div class="summary-value">
          ${totalBrands.toLocaleString()}
        </div>

      </div>

      <div class="summary-card">

        <div class="summary-title">
          TOTAL ARTICLE TYPES
        </div>

        <div class="summary-value">
          ${totalArticleTypes.toLocaleString()}
        </div>

      </div>

      <div class="summary-card">

        <div class="summary-title">
          CONTINUE STYLES
        </div>

        <div class="summary-value">
          ${continueStyles.toLocaleString()}
        </div>

      </div>

    </div>

  `;
}
