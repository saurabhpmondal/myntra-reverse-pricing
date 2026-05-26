import {
  processCustomReversePricingFile,
  exportCustomReversePricing
} from '../services/customReversePricingService.js';

let uploadedRows = [];

let uploadedFileVerified =
  false;

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
DOWNLOAD SAMPLE
----------------------------------- */

function downloadSampleFile() {

  if (
    typeof XLSX ===
    'undefined'
  ) {

    alert(
      'XLSX library not loaded'
    );

    return;

  }

  const rows = [

    {
      'STYLE ID': '',
      'RETURN %': '',
      'DISPATCH COST': ''
    }

  ];

  const worksheet =
    XLSX.utils.json_to_sheet(
      rows
    );

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(

    workbook,
    worksheet,
    'Sample'

  );

  XLSX.writeFile(
    workbook,
    'custom_reverse_pricing_sample.xlsx'
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

      <!-- -----------------------------------
      UPLOAD CARD
      ----------------------------------- -->

      <div
        style="
          max-width:760px;
          margin:0 auto 28px auto;
          background:#fff;
          border-radius:24px;
          padding:48px 32px;
          border:1px solid #ececec;
          text-align:center;
        "
      >

        <div
          style="
            width:72px;
            height:72px;
            border-radius:50%;
            background:#f5f6fa;
            display:flex;
            align-items:center;
            justify-content:center;
            margin:0 auto 24px auto;
            font-size:34px;
          "
        >

          📊

        </div>

        <div
          style="
            font-size:32px;
            font-weight:700;
            margin-bottom:12px;
            color:#111;
          "
        >

          Custom Reverse Pricing

        </div>

        <div
          style="
            color:#777;
            margin-bottom:28px;
            font-size:15px;
          "
        >

          Upload simulation file with custom return %
          and dispatch cost.

        </div>

        <div
          style="
            display:flex;
            gap:12px;
            justify-content:center;
            flex-wrap:wrap;
            align-items:center;
          "
        >

          <input
            type="file"
            id="customReversePricingFile"
            accept=".xlsx,.csv"
          >

          <button
            class="tab-btn"
            id="downloadCustomReversePricingSampleBtn"
          >

            Download Sample

          </button>

        </div>

      </div>

      <!-- -----------------------------------
      FILE VERIFIED
      ----------------------------------- -->

      <div
        id="customReversePricingVerification"
        style="
          display:none;
          max-width:760px;
          margin:0 auto 28px auto;
          background:#f3fffa;
          border:2px solid #62d2a2;
          border-radius:24px;
          padding:28px;
        "
      >

        <div
          style="
            text-align:center;
            font-size:30px;
            color:#12a56f;
            margin-bottom:8px;
          "
        >

          ✓

        </div>

        <div
          style="
            text-align:center;
            font-size:26px;
            font-weight:700;
            color:#067647;
            margin-bottom:28px;
          "
        >

          FILE VERIFIED

        </div>

        <div
          style="
            display:grid;
            grid-template-columns:
              repeat(auto-fit,minmax(180px,1fr));
            gap:16px;
          "
        >

          <div class="summary-card">

            <div
              class="summary-value"
              id="customTotalUploaded"
            >

              0

            </div>

            <div class="summary-title">

              STYLES UPLOADED

            </div>

          </div>

          <div class="summary-card">

            <div
              class="summary-value"
              id="customFoundCount"
            >

              0

            </div>

            <div class="summary-title">

              FOUND IN MASTER

            </div>

          </div>

          <div class="summary-card">

            <div
              class="summary-value"
              id="customNotFoundCount"
            >

              0

            </div>

            <div class="summary-title">

              NOT FOUND

            </div>

          </div>

        </div>

      </div>

      <!-- -----------------------------------
      ACTIONS
      ----------------------------------- -->

      <div
        id="customReversePricingActions"
        style="
          display:none;
          text-align:center;
          margin-bottom:24px;
        "
      >

        <button
          class="tab-btn active"
          id="generateCustomReversePricingBtn"
          style="
            min-width:220px;
            height:48px;
          "
        >

          Generate Pricing

        </button>

        <button
          class="tab-btn"
          id="exportCustomReversePricingBtn"
          style="
            margin-left:12px;
            min-width:180px;
            height:48px;
          "
        >

          Export XLSX

        </button>

      </div>

      <!-- -----------------------------------
      SUMMARY
      ----------------------------------- -->

      <div
        id="customReversePricingSummary"
        style="
          margin-bottom:20px;
          font-weight:600;
          color:#666;
          text-align:center;
        "
      >

      </div>

      <!-- -----------------------------------
      TABLE
      ----------------------------------- -->

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

  const sampleBtn =
    document.getElementById(
      'downloadCustomReversePricingSampleBtn'
    );

  const fileInput =
    document.getElementById(
      'customReversePricingFile'
    );

  const verificationBox =
    document.getElementById(
      'customReversePricingVerification'
    );

  const actionsBox =
    document.getElementById(
      'customReversePricingActions'
    );

  const generateBtn =
    document.getElementById(
      'generateCustomReversePricingBtn'
    );

  const exportBtn =
    document.getElementById(
      'exportCustomReversePricingBtn'
    );

  const tbody =
    document.getElementById(
      'customReversePricingTableBody'
    );

  const summary =
    document.getElementById(
      'customReversePricingSummary'
    );

  /*
  -----------------------------------
  SAMPLE
  -----------------------------------
  */

  if (sampleBtn) {

    sampleBtn.onclick =
      downloadSampleFile;

  }

  /*
  -----------------------------------
  FILE VERIFY
  -----------------------------------
  */

  if (fileInput) {

    fileInput.onchange =
      async () => {

        const file =
          fileInput.files?.[0];

        if (!file) {
          return;
        }

        uploadedFileVerified =
          true;

        verificationBox.style.display =
          'block';

        actionsBox.style.display =
          'block';

        /*
        -----------------------------------
        TEMP KPI
        -----------------------------------
        */

        document.getElementById(
          'customTotalUploaded'
        ).innerText =
          '1';

        document.getElementById(
          'customFoundCount'
        ).innerText =
          '1';

        document.getElementById(
          'customNotFoundCount'
        ).innerText =
          '0';

      };

  }

  /*
  -----------------------------------
  GENERATE
  -----------------------------------
  */

  if (generateBtn) {

    generateBtn.onclick =
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

        /*
        -----------------------------------
        KPI UPDATE
        -----------------------------------
        */

        document.getElementById(
          'customTotalUploaded'
        ).innerText =
          uploadedRows.length.toLocaleString('en-IN');

        document.getElementById(
          'customFoundCount'
        ).innerText =
          uploadedRows.length.toLocaleString('en-IN');

        document.getElementById(
          'customNotFoundCount'
        ).innerText =
          '0';

        if (!uploadedRows.length) {

          tbody.innerHTML = `

            <tr>

              <td colspan="12">

                No Pricing Generated

              </td>

            </tr>

          `;

        } else {

          tbody.innerHTML =
            buildRows(uploadedRows);

        }

        generateBtn.disabled = false;

        generateBtn.innerText =
          'Generate Pricing';

      };

  }

  /*
  -----------------------------------
  EXPORT
  -----------------------------------
  */

  if (exportBtn) {

    exportBtn.onclick =
      () => {

        exportCustomReversePricing(
          uploadedRows
        );

      };

  }

}