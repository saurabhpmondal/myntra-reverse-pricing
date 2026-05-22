import {
  getReversePricingData
} from '../services/reversePricingCacheService.js';

import {
  exportToExcel
} from '../utils/exportExcel.js';

let currentRows = [];

let renderedCount = 100;

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

  renderedCount = 100;

  currentPage = 0;

}

/* -----------------------------------
GET RULE DATA
----------------------------------- */

function getSelectedRule(row) {

  const rule =
    row.status === 'CONTINUE'
      ? (
          window.reversePricingFilters
            ?.continueRule ||

          'TP+5%'
        )
      : (
          window.reversePricingFilters
            ?.otherRule ||

          'TP'
        );

  return rule;

}

function getPricingData(row) {

  const selectedRule =
    getSelectedRule(row);

  const pricingData =
    row.pricing_data?.[
      selectedRule
    ] || {};

  return {

    selectedRule,

    sp:
      pricingData.sp || 0,

    trade_discount:
      pricingData.trade_discount || 0,

    gta:
      pricingData.gta || 0,

    seller_price:
      pricingData.seller_price || 0,

    commission_percent:
      pricingData.commission_percent || 0,

    commission_rs:
      pricingData.commission_rs || 0,

    fixed_fee:
      pricingData.fixed_fee || 0,

    gst:
      pricingData.gst || 0,

    upload_settlement:
      pricingData.upload_settlement || 0,

    tds_tcs:
      pricingData.tds_tcs || 0,

    bank_settlement:
      pricingData.bank_settlement || 0,

    royalty:
      pricingData.royalty || 0,

    marketing:
      pricingData.marketing || 0,

    payout_before_codb:
      pricingData.payout_before_codb || 0,

    dispatch_cost:
      pricingData.dispatch_cost || 0,

    return_cost:
      pricingData.return_cost || 0,

    rtv_codb:
      pricingData.rtv_codb || 0,

    final_payout:
      pricingData.final_payout || 0,

    tp_profit_rs:
      pricingData.tp_profit_rs || 0,

    tp_profit_percent:
      pricingData.tp_profit_percent || 0

  };

}

/* -----------------------------------
EXPORT
----------------------------------- */

async function exportReversePricing() {

  if (
    isExporting
  ) {
    return;
  }

  isExporting = true;

  const exportBtn =
    document.getElementById(
      'reversePricingExportBtn'
    );

  const progressBar =
    document.getElementById(
      'reversePricingExportProgress'
    );

  const progressText =
    document.getElementById(
      'reversePricingExportText'
    );

  if (exportBtn) {

    exportBtn.disabled = true;

    exportBtn.innerText =
      'Preparing Export...';

  }

  if (progressBar) {

    progressBar.style.display =
      'block';

  }

  const exportRows = [];

  const total =
    currentRows.length;

  for (
    let i = 0;
    i < total;
    i++
  ) {

    const row =
      currentRows[i];

    const pricing =
      getPricingData(row);

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
        pricing.selectedRule,

      SP:
        pricing.sp,

      'Trade Discount':
        pricing.trade_discount,

      GTA:
        pricing.gta,

      'Seller Price':
        pricing.seller_price,

      'Commission %':
        pricing.commission_percent,

      'Commission Rs':
        pricing.commission_rs,

      'Fixed Fee':
        pricing.fixed_fee,

      GST:
        pricing.gst,

      'Upload Settlement':
        pricing.upload_settlement,

      'TDS + TCS':
        pricing.tds_tcs,

      'Bank Settlement':
        pricing.bank_settlement,

      Royalty:
        pricing.royalty,

      Marketing:
        pricing.marketing,

      'Payout Before CODB':
        pricing.payout_before_codb,

      'Dispatch Cost':
        pricing.dispatch_cost,

      'Return Cost':
        pricing.return_cost,

      'RTV CODB':
        pricing.rtv_codb,

      'Final Payout':
        pricing.final_payout,

      'TP Profit Rs':
        pricing.tp_profit_rs,

      'TP Profit %':
        pricing.tp_profit_percent

    });

    if (
      i % 100 === 0
    ) {

      const progress =
        Math.round(
          (
            (i + 1) /
            total
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
TABLE
----------------------------------- */

function renderTableRows(
  rows
) {

  return rows.map(row => {

    const pricing =
      getPricingData(row);

    return `

      <tr>

        <td>
          ${row.style_id}
        </td>

        <td>
          ${row.brand}
        </td>

        <td>
          ${row.article_type}
        </td>

        <td>
          ${row.status}
        </td>

        <td>
          ${formatNumber(
            row.tp
          )}
        </td>

        <td>
          ${pricing.selectedRule}
        </td>

        <td>
          ${formatNumber(
            pricing.sp
          )}
        </td>

        <td>
          ${formatNumber(
            pricing.final_payout
          )}
        </td>

        <td>
          ${formatNumber(
            pricing.tp_profit_rs
          )}
        </td>

        <td>
          ${formatNumber(
            pricing.tp_profit_percent
          )}%
        </td>

      </tr>

    `;

  }).join('');

}

/* -----------------------------------
LOAD MORE
----------------------------------- */

function initializeLoadMore() {

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

          filters:
            window.reversePricingFilters,

          page:
            currentPage,

          pageSize:
            100

        });

      currentRows = [

        ...currentRows,

        ...newRows

      ];

      renderedCount =
        currentRows.length;

      renderReversePricingRows();

    }
  );

}

/* -----------------------------------
RENDER ROWS
----------------------------------- */

function renderReversePricingRows() {

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
    currentRows.length >=
    100
  ) {

    loadMoreArea.innerHTML = `

      <button
        class="tab-btn"
        id="loadMoreReversePricing"
      >

        Load More

      </button>

    `;

    initializeLoadMore();

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
              <th>Rule</th>
              <th>SP</th>
              <th>Final Payout</th>
              <th>TP Profit Rs</th>
              <th>TP Profit %</th>

            </tr>

          </thead>

          <tbody
            id="reversePricingTableBody"
          >

            <tr>

              <td colspan="10">

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

  window.reversePricingFilters =
    filters;

  const tbody =
    document.getElementById(
      'reversePricingTableBody'
    );

  currentPage = 0;

  const rows =
    await getReversePricingData({

      filters,

      page:
        currentPage,

      pageSize:
        100

    });

  currentRows = rows;

  renderedCount =
    rows.length;

  if (
    !rows.length
  ) {

    tbody.innerHTML = `

      <tr>

        <td colspan="10">

          No Records Found

        </td>

      </tr>

    `;

    return;

  }

  renderReversePricingRows();

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