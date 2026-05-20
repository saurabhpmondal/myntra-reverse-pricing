import {
  appCache
} from '../services/cacheService.js';

function getAllStatuses() {

  return [
    ...new Set(
      appCache.productMaster.map(
        row => row.status
      )
    )
  ]
  .filter(Boolean)
  .sort();

}

function getStatusCount(status) {

  return appCache.productMaster.filter(
    row =>
      row.status === status
  ).length;
}

function buildBrandSummary(statuses) {

  const brandMap = {};

  appCache.productMaster.forEach(row => {

    const brand =
      row.brand;

    if (!brandMap[brand]) {

      brandMap[brand] = {

        brand,
        total: 0

      };

      statuses.forEach(status => {

        brandMap[brand][status] = 0;

      });

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

  const statuses =
    getAllStatuses();

  const brandSummary =
    buildBrandSummary(
      statuses
    );

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

        ${statuses.map(status => `

          <div class="status-card">

            <div class="status-label">
              ${status}
            </div>

            <div class="status-value">
              ${getStatusCount(status)
                .toLocaleString()}
            </div>

          </div>

        `).join('')}

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

              ${statuses.map(status => `

                <th>${status}</th>

              `).join('')}

            </tr>

          </thead>

          <tbody>

            ${brandSummary.map(item => `

              <tr>

                <td>${item.brand}</td>

                <td>${item.total}</td>

                ${statuses.map(status => `

                  <td>
                    ${item[status] || 0}
                  </td>

                `).join('')}

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