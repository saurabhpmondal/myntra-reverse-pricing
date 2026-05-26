import {
  processCustomReversePricingFile,
  exportCustomReversePricing
} from '../services/customReversePricingService.js';

let uploadedRows = [];

/* -----------------------------------
FORMAT
----------------------------------- */

function formatNumber(value) {

  return Number(
    value || 0
  ).toLocaleString(
    'en-IN',
    {
      maximumFractionDigits: 2
    }
  );

}

/* -----------------------------------
TABLE
----------------------------------- */

function buildRows(rows) {

  return rows.map(row => `

    <tr>

      <td>${row.style_id}</td>
      <td>${row.brand}</td>
      <td>${row.article_type}</td>
      <td>${row.status}</td>
      <td>${row.custom_return_percent}%</td>
      <td>${formatNumber(row.custom_dispatch_cost)}</td>
      <td>${row.selected_rule}</td>
      <td>${formatNumber(row.sp)}</td>
      <td>${formatNumber(row.gta)}</td>
      <td>${formatNumber(row.final_payout)}</td>
      <td>${formatNumber(row.tp_profit_rs)}</td>
      <td>${formatNumber(row.tp_profit_percent)}%</td>

    </tr>

  `).join('');

}

/* -----------------------------------
REPORT
----------------------------------- */

export function renderCustomReversePricingReport() {

  return `

    <div class="report-section">

      <div
        class="bulk-export-bar"
        style="
          margin-bottom:20px;
          display:flex;
          gap:12px;
          flex-wrap:wrap;
        "
      >

        <input
          type="file"
          id="customReversePricingFile"
          accept=".xlsx,.csv"
        >

        <button
          class="tab-btn active"
          id="generateCustomReversePricingBtn"
        >

          Generate Pricing

        </button>

        <button
          class="tab-btn"
          id="exportCustomReversePricingBtn"
        >

          Export XLSX

        </button>

      </div>

      <div
        id="customReversePricingSummary"
        style="
          margin-bottom:20px;
          font-weight:600;
          color:#666;
        "
      >

        Upload file and generate pricing.

      </div>

      <div class="report-table-wrapper">

        <table class="report-table">

          <thead>

            <tr>

              <th>STYLE ID</th>
              <th>BRAND</th>
              <th>ARTICLE</th>
              <th>STATUS</th>
              <th>RETURN %</th>
              <th>DISPATCH</th>
              <th>RULE</th>
              <th>SP</th>
              <th>GTA</th>
              <th>FINAL PAYOUT</th>
              <th>TP PROFIT RS</th>
              <th>TP PROFIT %</th>

            </tr>

          </thead>

          <tbody id="customReversePricingTableBody">

            <tr>

              <td colspan="12">

                No Data

              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </div>

  `;

}

/* -----------------------------------
INITIALIZE
----------------------------------- */

export function initializeCustomReversePricing() {

  const generateBtn =
    document.getElementById(
      'generateCustomReversePricingBtn'
    );

  const exportBtn =
    document.getElementById(
      'exportCustomReversePricingBtn'
    );

  const fileInput =
    document.getElementById(
      'customReversePricingFile'
    );

  const tbody =
    document.getElementById(
      'customReversePricingTableBody'
    );

  const summary =
    document.getElementById(
      'customReversePricingSummary'
    );

  generateBtn.addEventListener(
    'click',
    async () => {

      const file =
        fileInput.files?.[0];

      if (!file) {

        alert(
          'Please upload file'
        );

        return;

      }

      generateBtn.disabled = true;

      generateBtn.innerText =
        'Generating...';

      uploadedRows =
        await processCustomReversePricingFile(
          file
        );

      summary.innerHTML = `

        Generated
        ${uploadedRows.length.toLocaleString('en-IN')}
        Pricing Records

      `;

      tbody.innerHTML =
        buildRows(uploadedRows);

      generateBtn.disabled = false;

      generateBtn.innerText =
        'Generate Pricing';

    }
  );

  exportBtn.addEventListener(
    'click',
    () => {

      exportCustomReversePricing(
        uploadedRows
      );

    }
  );

}