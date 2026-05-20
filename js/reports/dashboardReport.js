import {
  appCache
} from '../services/cacheService.js';

function getStatusCount(status) {

  return appCache.productMaster.filter(
    row =>
      row.status === status
  ).length;
}

function buildBrandSummary() {

  const brandMap = {};

  appCache.productMaster.forEach(row => {

    const brand =
      row.brand;

    if (!brandMap[brand]) {

      brandMap[brand] = {

        brand,

        total: 0,

        CONTINUE: 0,
        SPECIAL: 0,
        EOSS: 0,
        LIQUIDATION: 0

      };

    }

    brandMap[brand].total++;

    if (
      brandMap[brand][row.status]
      !== undefined
    ) {

      brandMap[brand][
        row.status
      ]++;

    }

  });

  return Object.values(
    brandMap
  )
  .sort(
    (a, b) =>
      b.total - a.total
  )
  .slice(0, 20);

}

export function renderDashboard() {

  const continueCount =
    getStatusCount(
      'CONTINUE'
    );

  const specialCount =
    getStatusCount(
      'SPECIAL'
    );

  const eossCount =
    getStatusCount(
      'EOSS'
    );

  const liquidationCount =
    getStatusCount(
      'LIQUIDATION'
    );

  const brandSummary =
    buildBrandSummary();

  return `

    <div class="dashboard-section">

      <div class="dashboard-title">
        System Status
      </div>

      <div class="status-grid">

        <div class="status-card">

          <div class="status-label">
            CONNECTION ESTABLISHED
          </div>

          <div class="status-value">
            ACTIVE
          </div>

        </div>

        <div class="status-card">

          <div class="status-label">
            PRODUCT MASTER LOADED
          </div>

          <div class="status-value">
            ${appCache.productMaster.length.toLocaleString()}
          </div>

        </div>

        <div class="status-card">

          <div class="status-label">
            COMMERCIALS LOADED
          </div>

          <div class="status-value">
            ${appCache.commercialsMaster.length.toLocaleString()}
          </div>

        </div>

        <div class="status-card">

          <div class="status-label">
            GTA LOADED
          </div>

          <div class="status-value">
            ${appCache.gtaMaster.length.toLocaleString()}
          </div>

        </div>

      </div>

    </div>

    <div class="dashboard-section">

      <div class="dashboard-title">
        Status Distribution
      </div>

      <div class="status-grid">

        <div class="status-card">

          <div class="status-label">
            CONTINUE
          </div>

          <div class="status-value">
            ${continueCount.toLocaleString()}
          </div>

        </div>

        <div class="status-card">

          <div class="status-label">
            SPECIAL
          </div>

          <div class="status-value">
            ${specialCount.toLocaleString()}
          </div>

        </div>

        <div class="status-card">

          <div class="status-label">
            EOSS
          </div>

          <div class="status-value">
            ${eossCount.toLocaleString()}
          </div>

        </div>

        <div class="status-card">

          <div class="status-label">
            LIQUIDATION
          </div>

          <div class="status-value">
            ${liquidationCount.toLocaleString()}
          </div>

        </div>

      </div>

    </div>

    <div class="dashboard-section">

      <div class="dashboard-title">
        Brand Snapshot
      </div>

      <div class="brand-table-wrapper">

        <table class="brand-table">

          <thead>

            <tr>

              <th>BRAND</th>

              <th>TOTAL</th>

              <th>CONTINUE</th>

              <th>SPECIAL</th>

              <th>EOSS</th>

              <th>LIQUIDATION</th>

            </tr>

          </thead>

          <tbody>

            ${brandSummary.map(item => `

              <tr>

                <td>${item.brand}</td>

                <td>${item.total}</td>

                <td>${item.CONTINUE}</td>

                <td>${item.SPECIAL}</td>

                <td>${item.EOSS}</td>

                <td>${item.LIQUIDATION}</td>

              </tr>

            `).join('')}

          </tbody>

        </table>

      </div>

    </div>

    <div class="dashboard-section">

      <div class="dashboard-title">
        Quick Actions
      </div>

      <div class="quick-actions">

        <div
          class="quick-action-card"
          data-tab-target="reverse-pricing"
        >

          <div class="quick-action-title">
            Reverse Pricing
          </div>

          <div class="quick-action-subtitle">
            Open pricing engine
          </div>

        </div>

        <div
          class="quick-action-card"
          data-tab-target="tp-sp"
        >

          <div class="quick-action-title">
            TP → SP Calculator
          </div>

          <div class="quick-action-subtitle">
            Derive SP from TP
          </div>

        </div>

        <div
          class="quick-action-card"
          data-tab-target="sp-tp"
        >

          <div class="quick-action-title">
            SP → TP Calculator
          </div>

          <div class="quick-action-subtitle">
            Calculate payout
          </div>

        </div>

        <div
          class="quick-action-card"
          data-tab-target="best-brand"
        >

          <div class="quick-action-title">
            Best Brand
          </div>

          <div class="quick-action-subtitle">
            Compare brand profitability
          </div>

        </div>

      </div>

    </div>

  `;
}