import {
  appCache
} from '../services/cacheService.js';

function formatNumber(value) {

  return Number(
    value || 0
  ).toLocaleString('en-IN');

}

function getFilteredData(filters = {}) {

  let rows = [
    ...appCache.productMaster
  ];

  /*
  -----------------------------------
  BRAND
  -----------------------------------
  */

  if (filters.brand) {

    rows = rows.filter(row =>
      row.brand === filters.brand
    );

  }

  /*
  -----------------------------------
  ARTICLE TYPE
  -----------------------------------
  */

  if (filters.articleType) {

    rows = rows.filter(row =>
      row.article_type ===
      filters.articleType
    );

  }

  /*
  -----------------------------------
  STATUS
  -----------------------------------
  */

  if (filters.status) {

    rows = rows.filter(row =>
      row.status === filters.status
    );

  }

  /*
  -----------------------------------
  SEARCH
  -----------------------------------
  */

  if (filters.search) {

    const search =
      filters.search
        .toLowerCase();

    rows = rows.filter(row => {

      return [

        row.style_id,
        row.erp_sku,
        row.brand

      ]
      .join(' ')
      .toLowerCase()
      .includes(search);

    });

  }

  return rows;

}

function renderSystemStatus() {

  return `

    <div class="dashboard-section">

      <div class="section-title">
        System Status
      </div>

      <div class="cards-grid">

        <div class="summary-card">

          <div class="summary-title">
            CONNECTION ESTABLISHED
          </div>

          <div class="summary-value">
            ACTIVE
          </div>

        </div>

        <div class="summary-card">

          <div class="summary-title">
            PRODUCT MASTER LOADED
          </div>

          <div class="summary-value">
            ${formatNumber(
              appCache.productMaster.length
            )}
          </div>

        </div>

        <div class="summary-card">

          <div class="summary-title">
            COMMERCIALS LOADED
          </div>

          <div class="summary-value">
            ${formatNumber(
              appCache.commercialsMaster.length
            )}
          </div>

        </div>

        <div class="summary-card">

          <div class="summary-title">
            GTA LOADED
          </div>

          <div class="summary-value">
            ${formatNumber(
              appCache.gtaMaster.length
            )}
          </div>

        </div>

      </div>

    </div>

  `;

}

function renderStatusDistribution(rows) {

  const statusMap = {};

  rows.forEach(row => {

    const status =
      row.status || 'UNKNOWN';

    statusMap[status] =
      (statusMap[status] || 0) + 1;

  });

  const statuses =
    Object.entries(statusMap)
      .sort((a, b) =>
        b[1] - a[1]
      );

  return `

    <div class="dashboard-section">

      <div class="section-title">
        Status Distribution
      </div>

      <div class="cards-grid">

        ${statuses.map(item => `

          <div class="summary-card">

            <div class="summary-title">
              ${item[0]}
            </div>

            <div class="summary-value">
              ${formatNumber(item[1])}
            </div>

          </div>

        `).join('')}

      </div>

    </div>

  `;

}

function renderBrandSnapshot(rows) {

  const statusSet =
    new Set();

  const brandMap = {};

  rows.forEach(row => {

    const brand =
      row.brand || 'UNKNOWN';

    const status =
      row.status || 'UNKNOWN';

    statusSet.add(status);

    if (!brandMap[brand]) {

      brandMap[brand] = {

        total: 0,

        statuses: {}

      };

    }

    brandMap[brand].total++;

    brandMap[brand]
      .statuses[status] =

      (
        brandMap[brand]
          .statuses[status] || 0
      ) + 1;

  });

  const statuses =
    [...statusSet].sort();

  const brands =
    Object.entries(brandMap)
      .sort((a, b) =>
        b[1].total - a[1].total
      );

  return `

    <div class="dashboard-section">

      <div class="section-title">
        Brand Snapshot
      </div>

      <div class="brand-table-wrapper">

        <table class="brand-table">

          <thead>

            <tr>

              <th>BRAND</th>

              <th>TOTAL</th>

              ${statuses.map(status => `

                <th>
                  ${status}
                </th>

              `).join('')}

            </tr>

          </thead>

          <tbody>

            ${brands.map(item => {

              const brand =
                item[0];

              const data =
                item[1];

              return `

                <tr>

                  <td>
                    ${brand}
                  </td>

                  <td>
                    ${formatNumber(
                      data.total
                    )}
                  </td>

                  ${statuses.map(status => `

                    <td>

                      ${formatNumber(

                        data.statuses[
                          status
                        ] || 0

                      )}

                    </td>

                  `).join('')}

                </tr>

              `;

            }).join('')}

          </tbody>

        </table>

      </div>

    </div>

  `;

}

function renderQuickActions() {

  return `

    <div class="dashboard-section">

      <div class="section-title">
        Quick Actions
      </div>

      <div class="cards-grid">

        <div
          class="quick-action-card"
          data-tab-target="reverse-pricing"
        >

          <div class="summary-value">
            Reverse Pricing
          </div>

          <div class="summary-title">
            Open pricing engine
          </div>

        </div>

        <div
          class="quick-action-card"
          data-tab-target="pricing-calculator"
        >

          <div class="summary-value">
            Pricing Calculator
          </div>

          <div class="summary-title">
            Settlement simulator
          </div>

        </div>

        <div
          class="quick-action-card"
          data-tab-target="best-brand"
        >

          <div class="summary-value">
            Best Brand
          </div>

          <div class="summary-title">
            Compare profitability
          </div>

        </div>

        <div
          class="quick-action-card"
          data-tab-target="export-center"
        >

          <div class="summary-value">
            Export Center
          </div>

          <div class="summary-title">
            Download reports
          </div>

        </div>

      </div>

    </div>

  `;

}

export function renderDashboard(
  filters = {}
) {

  const rows =
    getFilteredData(filters);

  return `

    <div class="dashboard-wrapper">

      ${renderSystemStatus()}

      ${renderStatusDistribution(
        rows
      )}

      ${renderBrandSnapshot(
        rows
      )}

      ${renderQuickActions()}

    </div>

  `;

}