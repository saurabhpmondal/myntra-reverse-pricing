import {
  appCache
} from '../services/cacheService.js';

let uploadedRows = [];

let processedRows = [];

/* -----------------------------------
FORMAT NUMBER
----------------------------------- */

function formatNumber(value) {

  return Number(
    value || 0
  ).toLocaleString(
    'en-IN',
    {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }
  );

}

/* -----------------------------------
DOWNLOAD SAMPLE FILE
----------------------------------- */

function downloadSampleFile() {

  const csv = `style_id,recommended_price,settlement_price
38992879,1602,912`;

  const blob =
    new Blob(
      [csv],
      {
        type: 'text/csv'
      }
    );

  const url =
    URL.createObjectURL(
      blob
    );

  const a =
    document.createElement(
      'a'
    );

  a.href = url;

  a.download =
    'reco_engine_sample.csv';

  a.click();

  URL.revokeObjectURL(
    url
  );

}

/* -----------------------------------
EXPORT CSV
----------------------------------- */

function exportToCSV() {

  if (
    !processedRows.length
  ) {
    return;
  }

  const headers = [

    'Style ID',
    'Brand',
    'Recommended Price',
    'Upload Settlement',
    'TDS+TCS',
    'Bank Settlement',
    'Royalty',
    'Marketing',
    'Rebate',
    'Payout Before CODB',
    'Dispatch Cost',
    'Return Charge',
    'Return Cost',
    'RTV CODB',
    'Payout After CODB',
    'TP',
    'TP Profit Rs',
    'TP Profit %',
    'Reco Status'

  ];

  const rows =
    processedRows.map(
      row => [

        row.styleId,
        row.brand,
        row.recommendedPrice,
        row.uploadSettlement,
        row.tdsTcs,
        row.bankSettlement,
        row.royalty,
        row.marketing,
        row.rebate,
        row.payoutBeforeCODB,
        row.dispatchCost,
        row.returnCharge,
        row.returnCost,
        row.returnCODB,
        row.payoutAfterCODB,
        row.tp,
        row.tpProfitRs,
        row.tpProfitPercent,
        row.recoStatus

      ]
    );

  const csvContent = [

    headers.join(','),

    ...rows.map(
      row =>
        row.join(',')
    )

  ].join('\n');

  const blob =
    new Blob(
      [csvContent],
      {
        type:
          'text/csv;charset=utf-8;'
      }
    );

  const url =
    URL.createObjectURL(
      blob
    );

  const link =
    document.createElement(
      'a'
    );

  link.href = url;

  link.download =
    'reco_engine_output.csv';

  link.click();

  URL.revokeObjectURL(
    url
  );

}

/* -----------------------------------
KPI CARDS
----------------------------------- */

function renderKPICards({
  total,
  optIn,
  optOut,
  notFound
}) {

  return `

    <div class="cards-grid">

      <div class="summary-card">

        <div class="summary-title">
          TOTAL STYLES
        </div>

        <div class="summary-value">
          ${total}
        </div>

      </div>

      <div class="summary-card">

        <div class="summary-title">
          OPT-IN
        </div>

        <div class="
          summary-value
          profit-positive
        ">

          ${optIn}

        </div>

      </div>

      <div class="summary-card">

        <div class="summary-title">
          OPT-OUT
        </div>

        <div class="
          summary-value
          profit-negative
        ">

          ${optOut}

        </div>

      </div>

      <div class="summary-card">

        <div class="summary-title">
          NOT FOUND
        </div>

        <div class="
          summary-value
          profit-negative
        ">

          ${notFound}

        </div>

      </div>

    </div>

  `;

}

/* -----------------------------------
STATUS CLASS
----------------------------------- */

function getStatusClass(
  status
) {

  if (
    status === 'OPT-IN'
  ) {

    return 'status-good';

  }

  if (
    status === 'NOT FOUND'
  ) {

    return 'status-moderate';

  }

  return 'status-bad';

}

/* -----------------------------------
RESULT TABLE
----------------------------------- */

function renderResultTable(
  rows
) {

  return `

    <div class="brand-table-wrapper">

      <table class="brand-table">

        <thead>

          <tr>

            <th>Style ID</th>
            <th>Brand</th>
            <th>Recommended Price</th>
            <th>Upload Settlement</th>
            <th>TDS+TCS</th>
            <th>Bank Settlement</th>
            <th>Royalty</th>
            <th>Marketing</th>
            <th>Rebate</th>
            <th>PB CODB</th>
            <th>Dispatch</th>
            <th>Return Charge</th>
            <th>Return Cost</th>
            <th>RTV CODB</th>
            <th>Payout After CODB</th>
            <th>TP</th>
            <th>TP Profit Rs</th>
            <th>TP Profit %</th>
            <th>Reco Status</th>

          </tr>

        </thead>

        <tbody>

          ${rows.map(row => `

            <tr>

              <td>${row.styleId}</td>
              <td>${row.brand || '-'}</td>
              <td>${formatNumber(row.recommendedPrice)}</td>
              <td>${formatNumber(row.uploadSettlement)}</td>
              <td>${formatNumber(row.tdsTcs)}</td>
              <td>${formatNumber(row.bankSettlement)}</td>
              <td>${formatNumber(row.royalty)}</td>
              <td>${formatNumber(row.marketing)}</td>
              <td>${formatNumber(row.rebate)}</td>
              <td>${formatNumber(row.payoutBeforeCODB)}</td>
              <td>${formatNumber(row.dispatchCost)}</td>
              <td>${formatNumber(row.returnCharge)}</td>
              <td>${formatNumber(row.returnCost)}</td>
              <td>${formatNumber(row.returnCODB)}</td>
              <td>${formatNumber(row.payoutAfterCODB)}</td>
              <td>${formatNumber(row.tp)}</td>
              <td>${formatNumber(row.tpProfitRs)}</td>
              <td>${formatNumber(row.tpProfitPercent)}%</td>

              <td>

                <span class="
                  ${getStatusClass(
                    row.recoStatus
                  )}
                ">

                  ${row.recoStatus}

                </span>

              </td>

            </tr>

          `).join('')}

        </tbody>

      </table>

    </div>

  `;

}

/* -----------------------------------
RENDER
----------------------------------- */

export function renderRecoReport() {

  return `

    <div class="bulk-upload-wrapper">

      <div class="bulk-upload-card">

        <div class="bulk-upload-icon">

          ₹

        </div>

        <div class="bulk-upload-title">

          Download sample file and upload CSV

        </div>

        <div class="bulk-upload-subtitle">

          Upload recommendation pricing file

        </div>

        <input
          type="file"
          id="recoFile"
          accept=".csv"
          class="bulk-upload-input"
        >

        <button
          class="secondary-btn"
          id="downloadRecoSample"
          style="
            margin-top:20px;
          "
        >

          Download Sample File

        </button>

      </div>

      <div
        id="recoValidationArea"
        style="
          margin-top:24px;
        "
      >

      </div>

      <div
        style="
          display:flex;
          justify-content:center;
          align-items:center;
          margin-top:24px;
        "
      >

        <button
          class="tab-btn active"
          id="checkRecoBtn"
          disabled
          style="
            min-width:180px;
            height:44px;
          "
        >

          Check Reco

        </button>

      </div>

      <div
        id="recoResultArea"
        style="
          margin-top:24px;
        "
      >

      </div>

    </div>

  `;

}