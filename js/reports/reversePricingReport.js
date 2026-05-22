import {
  getReversePricingData
} from '../services/reversePricingCacheService.js';

import {
  exportToExcel
} from '../utils/exportExcel.js';

let currentRows = [];

let currentPage = 0;

let isExporting = false;

/* -----------------------------------
FORMAT
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
RESET
----------------------------------- */

export function resetReversePricingGeneration() {

  currentRows = [];

  currentPage = 0;

}

/* -----------------------------------
EXPORT
----------------------------------- */

async function exportReversePricing() {

  if (isExporting) {
    return;
  }

  isExporting = true;

  const exportBtn =
    document.getElementById(
      'reversePricingExportBtn'
    );

  const progressText =
    document.getElementById(
      'reversePricingExportText'
    );

  const progressWrapper =
    document.getElementById(
      'reversePricingExportProgress'
    );

  if (exportBtn) {

    exportBtn.disabled = true;

    exportBtn.innerText =
      'Preparing Export...';

  }

  if (progressWrapper) {

    progressWrapper.style.display =
      'block';

  }

  const exportRows = [];

  for (
    let i = 0;
    i < currentRows.length;
    i++
  ) {

    const row =
      currentRows[i];

    exportRows.push({

      'Style ID':
        row.style_id,

      Brand:
        row.brand,

      'Article Type':
        row.article_type,

      Status:
        row.status,

      TP:
        row.tp,

      MRP:
        row.mrp,

      Rule:
        row.selectedRule,

      SP:
        row.sp,

      'Trade Discount':
        row.trade_discount,

      GTA:
        row.gta,

      'Seller Price':
        row.seller_price,

      'Commission %':
        row.commission_percent,

      'Commission Rs':
        row.commission_rs,

      'Fixed Fee':
        row.fixed_fee,

      GST:
        row.gst,

      'Upload Settlement':
        row.upload_settlement,

      'TDS + TCS':
        row.tds_tcs,

      'Bank Settlement':
        row.bank_settlement,

      Royalty:
        row.royalty,

      Marketing:
        row.marketing,

      'Payout Before CODB':
        row.payout_before_codb,

      'Dispatch Cost':
        row.dispatch_cost,

      'Return Cost':
        row.return_cost,

      'RTV CODB':
        row.rtv_codb,

      'Final Payout':
        row.final_payout,

      'TP Profit Rs':
        row.tp_profit_rs,

      'TP Profit %':
        row.tp_profit_percent

    });

    if (
      i % 100 === 0
    ) {

      const progress =
        Math.round(
          (
            (i + 1) /
            currentRows.length
          ) * 100
        );

      if (progressText) {

        progressText.innerText =
          `Preparing Export ${progress}%`;

      }

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            0
          )
      );

    }

  }

  exportToExcel({

    fileName:
      'reverse_pricing_export.xlsx',

    rows:
      exportRows

  });

  if (exportBtn) {

    exportBtn.disabled = false;

    exportBtn.innerText =
      'Export XLSX';

  }

  if (progressText) {

    progressText.innerText =
      'Export Completed';

  }

  isExporting = false;

}

/* -----------------------------------
TABLE ROWS
----------------------------------- */

function renderTableRows(
  rows
) {

  return rows.map(row => `

    <tr>

      <td>${row.style_id}</td>

      <td>${row.brand}</td>

      <td>${row.article_type}</td>

      <td>${row.status}</td>

      <td>${formatNumber(row.tp)}</td>

      <td>${formatNumber(row.mrp)}</td>

      <td>${row.selectedRule}</td>

      <td>${formatNumber(row.sp)}</td>

      <td>${formatNumber(row.trade_discount)}%</td>

      <td>${formatNumber(row.gta)}</td>

      <td>${formatNumber(row.seller_price)}</td>

      <td>${formatNumber(row.commission_percent)}%</td>

      <td>${formatNumber(row.commission_rs)}</td>

      <td>${formatNumber(row.fixed_fee)}</td>

      <td>${formatNumber(row.gst)}</td>

      <td>${formatNumber(row.upload_settlement)}</td>

      <td>${formatNumber(row.tds_tcs)}</td>

      <td>${formatNumber(row.bank_settlement)}</td>

      <td>${formatNumber(row.royalty)}</td>

      <td>${formatNumber(row.marketing)}</td>

      <td>${formatNumber(row.payout_before_codb)}</td>

      <td>${formatNumber(row.dispatch_cost)}</td>

      <td>${formatNumber(row.return_cost)}</td>

      <td>${formatNumber(row.rtv_codb)}</td>

      <td>${formatNumber(row.final_payout)}</td>

      <td>${formatNumber(row.tp_profit_rs)}</td>

      <td>${formatNumber(row.tp_profit_percent)}%</td>

    </tr>

  `).join('');

}

/* -----------------------------------
LOAD MORE
----------------------------------- */

function initializeLoadMore(
  filters
) {

  const btn =
    document.getElementById(
      'loadMoreReversePricing'
    );

  if (!btn) {
    return;
  }

  btn.addEventListener(
    'click',
    async () => {

      btn.disabled = true;

      btn.innerText =
        'Loading...';

      currentPage++;

      const newRows =
        await getReversePricingData({

          filters,

          page:
            currentPage,

          pageSize:
            100

        });

      currentRows = [

        ...currentRows,

        ...newRows

      ];

      renderReversePricingRows(
        filters
      );

    }
  );

}

/* -----------------------------------
RENDER ROWS
----------------------------------- */

function renderReversePricingRows(
  filters
) {

  const tbody =
    document.getElementById(
      'reversePricingTableBody'
    );

  const loadMoreArea =
    document.getElementById(
      'loadMoreArea'
    );

  if (!tbody) {
    return;
  }

  tbody.innerHTML =
    renderTableRows(
      currentRows
    );

  if (
    currentRows.length >= 100
  ) {

    loadMoreArea.innerHTML = `

      <button
        class="tab-btn"
        id="loadMoreReversePricing"
      >

        Load More

      </button>

    `;

    initializeLoadMore(
      filters
    );

  } else {

    loadMoreArea.innerHTML = '';

  }

}

/* -----------------------------------
REPORT
----------------------------------- */

export function renderReversePricingReport() {

  return `

    <div class="report-section">

      <div
        class="bulk-export-bar"
        style="
          margin-bottom:20px;
        "
      >

        <button
          class="tab-btn active"
          id="reversePricingExportBtn"
        >

          Export XLSX

        </button>

      </div>

      <div
        id="reversePricingExportProgress"
        style="
          display:none;
          margin-bottom:20px;
        "
      >

        <div
          id="reversePricingExportText"
          class="summary-title"
        >

          Preparing Export...

        </div>

      </div>

      <div class="brand-table-wrapper">

        <table class="brand-table">

          <thead>

            <tr>

              <th>Style ID</th>
              <th>Brand</th>
              <th>Article Type</th>
              <th>Status</th>
              <th>TP</th>
              <th>MRP</th>
              <th>Rule</th>
              <th>SP</th>
              <th>TD %</th>
              <th>GTA</th>
              <th>Seller Price</th>
              <th>Com %</th>
              <th>Com Rs</th>
              <th>Fixed Fee</th>
              <th>GST</th>
              <th>Upload Settlement</th>
              <th>TDS+TCS</th>
              <th>Bank Settlement</th>
              <th>Royalty</th>
              <th>Marketing</th>
              <th>PB-CODB</th>
              <th>Dispatch</th>
              <th>Return Cost</th>
              <th>RTV CODB</th>
              <th>Final Payout</th>
              <th>TP Profit Rs</th>
              <th>TP Profit %</th>

            </tr>

          </thead>

          <tbody
            id="reversePricingTableBody"
          >

            <tr>

              <td colspan="27">

                Loading Pricing...

              </td>

            </tr>

          </tbody>

        </table>

      </div>

      <div
        id="loadMoreArea"
        style="
          margin-top:24px;
          text-align:center;
        "
      >

      </div>

    </div>

  `;

}

/* -----------------------------------
INITIALIZE
----------------------------------- */

export async function initializeReversePricingGeneration(
  renderContent,
  filters
) {

  currentPage = 0;

  const tbody =
    document.getElementById(
      'reversePricingTableBody'
    );

  const rows =
    await getReversePricingData({

      filters,

      page:
        currentPage,

      pageSize:
        100

    });

  currentRows = rows;

  if (!rows.length) {

    tbody.innerHTML = `

      <tr>

        <td colspan="27">

          No Records Found

        </td>

      </tr>

    `;

    return;

  }

  renderReversePricingRows(
    filters
  );

  const exportBtn =
    document.getElementById(
      'reversePricingExportBtn'
    );

  if (exportBtn) {

    exportBtn.addEventListener(
      'click',
      exportReversePricing
    );

  }

}