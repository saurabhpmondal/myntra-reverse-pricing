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
GET RULE
----------------------------------- */

function getSelectedRule(row) {

  return row.status === 'CONTINUE'

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

}

/* -----------------------------------
GET PRICING DATA
----------------------------------- */

function getPricingData(row) {

  const selectedRule =
    getSelectedRule(row);

  const pricing =
    row.pricing_data?.[
      selectedRule
    ] || {};

  return {

    selectedRule,

    sp:
      pricing.sp || 0,

    trade_discount:
      pricing.trade_discount || 0,

    gta:
      pricing.gta || 0,

    seller_price:
      pricing.seller_price || 0,

    commission_percent:
      pricing.commission_percent || 0,

    commission_rs:
      pricing.commission_rs || 0,

    fixed_fee:
      pricing.fixed_fee || 0,

    gst:
      pricing.gst || 0,

    upload_settlement:
      pricing.upload_settlement || 0,

    tds_tcs:
      pricing.tds_tcs || 0,

    bank_settlement:
      pricing.bank_settlement || 0,

    royalty:
      pricing.royalty || 0,

    marketing:
      pricing.marketing || 0,

    payout_before_codb:
      pricing.payout_before_codb || 0,

    dispatch_cost:
      pricing.dispatch_cost || 0,

    return_cost:
      pricing.return_cost || 0,

    rtv_codb:
      pricing.rtv_codb || 0,

    final_payout:
      pricing.final_payout || 0,

    tp_profit_rs:
      pricing.tp_profit_rs || 0,

    tp_profit_percent:
      pricing.tp_profit_percent || 0

  };

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

  return rows.map(row => {

    const pricing =
      getPricingData(row);

    return `

      <tr>

        <td>${row.style_id}</td>

        <td>${row.brand}</td>

        <td>${row.article_type}</td>

        <td>${row.status}</td>

        <td>${formatNumber(row.tp)}</td>

        <td>${formatNumber(row.mrp)}</td>

        <td>${pricing.selectedRule}</td>

        <td>${formatNumber(pricing.sp)}</td>

        <td>${formatNumber(pricing.trade_discount)}%</td>

        <td>${formatNumber(pricing.gta)}</td>

        <td>${formatNumber(pricing.seller_price)}</td>

        <td>${formatNumber(pricing.commission_percent)}%</td>

        <td>${formatNumber(pricing.commission_rs)}</td>

        <td>${formatNumber(pricing.fixed_fee)}</td>

        <td>${formatNumber(pricing.gst)}</td>

        <td>${formatNumber(pricing.upload_settlement)}</td>

        <td>${formatNumber(pricing.tds_tcs)}</td>

        <td>${formatNumber(pricing.bank_settlement)}</td>

        <td>${formatNumber(pricing.royalty)}</td>

        <td>${formatNumber(pricing.marketing)}</td>

        <td>${formatNumber(pricing.payout_before_codb)}</td>

        <td>${formatNumber(pricing.dispatch_cost)}</td>

        <td>${formatNumber(pricing.return_cost)}</td>

        <td>${formatNumber(pricing.rtv_codb)}</td>

        <td>${formatNumber(pricing.final_payout)}</td>

        <td>${formatNumber(pricing.tp_profit_rs)}</td>

        <td>${formatNumber(pricing.tp_profit_percent)}%</td>

      </tr>

    `;

  }).join('');

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

  window.reversePricingFilters =
    filters;

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