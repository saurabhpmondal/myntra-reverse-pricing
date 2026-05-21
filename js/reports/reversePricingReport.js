import {
  appCache
} from '../services/cacheService.js';

import {
  generatePricingLadder
} from '../engine/pricingEngine.js';

let reversePricingGenerated =
  false;

/* -----------------------------------
GLOBAL EXPORT JOB
----------------------------------- */

if (
  !window.reversePricingExportJob
) {

  window.reversePricingExportJob = {

    running: false,

    completed: false,

    progress: 0,

    processed: 0,

    total: 0,

    rows: [],

    blobUrl: null

  };

}

/* -----------------------------------
FORMAT NUMBER
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
PROFIT CLASS
----------------------------------- */

function getProfitClass(value) {

  return value >= 0
    ? 'profit-positive'
    : 'profit-negative';

}

/* -----------------------------------
FILTER PRODUCTS
----------------------------------- */

function filterProducts({
  brand,
  articleType,
  status,
  search
}) {

  const searchValue =
    search
      ?.toString()
      .trim()
      .toUpperCase() || '';

  return appCache.productMaster
    .filter(row => {

      if (
        brand &&
        row.brand !== brand
      ) {
        return false;
      }

      if (
        articleType &&
        row.article_type !== articleType
      ) {
        return false;
      }

      if (
        status &&
        row.status !== status
      ) {
        return false;
      }

      if (searchValue) {

        const combinedText = `

          ${row.style_id}
          ${row.erp_sku}
          ${row.brand}
          ${row.article_type}

        `.toUpperCase();

        if (
          !combinedText.includes(
            searchValue
          )
        ) {

          return false;

        }

      }

      return true;

    })
    .sort((a, b) => {

      const aDate =
        new Date(
          a.launch_date || 0
        );

      const bDate =
        new Date(
          b.launch_date || 0
        );

      return bDate - aDate;

    });

}

/* -----------------------------------
RULE
----------------------------------- */

function getRuleForStatus(
  product,
  filters
) {

  if (
    product.status ===
    'CONTINUE'
  ) {

    return (
      filters.continueRule ||
      'TP+5%'
    );

  }

  return (
    filters.otherRule ||
    'TP'
  );

}

/* -----------------------------------
BUILD EXPORT ROW
----------------------------------- */

function buildExportRow(
  product,
  filters
) {

  const selectedRule =
    getRuleForStatus(
      product,
      filters
    );

  const pricingLadder =
    generatePricingLadder({

      brand:
        product.brand,

      articleType:
        product.article_type,

      status:
        product.status,

      tp:
        Number(product.tp),

      mrp:
        Number(product.mrp)

    });

  const matchedRule =
    pricingLadder.find(
      item =>
        item.pricingRule ===
        selectedRule
    );

  if (!matchedRule) {
    return null;
  }

  const s =
    matchedRule.settlement;

  return {

    styleId:
      product.style_id,

    erpSku:
      product.erp_sku,

    brand:
      product.brand,

    article:
      product.article_type,

    status:
      product.status,

    launchDate:
      product.launch_date,

    liveDate:
      product.live_date,

    tp:
      product.tp,

    rule:
      matchedRule.pricingRule,

    sp:
      matchedRule.derivedSP,

    mrp:
      product.mrp,

    td:
      s.tradeDiscount,

    gta:
      s.gtaCharge,

    sellerPrice:
      s.sellerPrice,

    commissionPercent:
      s.commissionPercent,

    commissionRs:
      s.commissionRs,

    fixedFee:
      s.fixedFee,

    gst:
      s.gstOnComAndFee,

    uploadSettlement:
      Math.ceil(
        s.uploadSettlement
      ),

    tds:
      s.totalTaxDeduction,

    bank:
      s.bankSettlement,

    royalty:
      s.royalty,

    marketing:
      s.marketing,

    payoutBeforeCODB:
      s.payoutBeforeCODB,

    dispatch:
      s.dispatchCost,

    returnCost:
      s.returnCost,

    rtvCodb:
      s.rtvCodb,

    finalPayout:
      s.payoutAfterCODB,

    tpProfitRs:
      s.tpProfitRs,

    tpProfitPercent:
      s.tpProfitPercent

  };

}

/* -----------------------------------
BUILD TABLE ROWS
----------------------------------- */

function buildRows(
  products,
  filters
) {

  const rows = [];

  products.forEach(product => {

    try {

      const row =
        buildExportRow(
          product,
          filters
        );

      if (!row) {
        return;
      }

      rows.push(`

        <tr>

          <td>${row.styleId}</td>

          <td>${row.erpSku}</td>

          <td>${row.brand}</td>

          <td>${row.article}</td>

          <td>${row.status}</td>

          <td>${row.launchDate || '-'}</td>

          <td>${row.liveDate || '-'}</td>

          <td>${formatNumber(row.tp)}</td>

          <td>${row.rule}</td>

          <td>${formatNumber(row.sp)}</td>

          <td>${formatNumber(row.mrp)}</td>

          <td>${formatNumber(row.td)}%</td>

          <td>${formatNumber(row.gta)}</td>

          <td>${formatNumber(row.sellerPrice)}</td>

          <td>${formatNumber(row.commissionPercent)}%</td>

          <td>${formatNumber(row.commissionRs)}</td>

          <td>${formatNumber(row.fixedFee)}</td>

          <td>${formatNumber(row.gst)}</td>

          <td>${row.uploadSettlement}</td>

          <td>${formatNumber(row.tds)}</td>

          <td>${formatNumber(row.bank)}</td>

          <td>${formatNumber(row.royalty)}</td>

          <td>${formatNumber(row.marketing)}</td>

          <td>${formatNumber(row.payoutBeforeCODB)}</td>

          <td>${formatNumber(row.dispatch)}</td>

          <td>${formatNumber(row.returnCost)}</td>

          <td>${formatNumber(row.rtvCodb)}</td>

          <td>${formatNumber(row.finalPayout)}</td>

          <td class="${getProfitClass(
            row.tpProfitRs
          )}">

            ${formatNumber(
              row.tpProfitRs
            )}

          </td>

          <td class="${getProfitClass(
            row.tpProfitPercent
          )}">

            ${formatNumber(
              row.tpProfitPercent
            )}%

          </td>

        </tr>

      `);

    } catch (error) {

      console.error(error);

    }

  });

  return rows.join('');

}

/* -----------------------------------
EXPORT UI
----------------------------------- */

function renderExportSection() {

  const job =
    window.reversePricingExportJob;

  if (!job.running && !job.completed) {

    return `

      <div
        style="
          display:flex;
          justify-content:flex-end;
          margin-bottom:16px;
        "
      >

        <button
          class="tab-btn active"
          id="generateFullExportBtn"
        >

          Generate Full Export

        </button>

      </div>

    `;

  }

  if (job.running) {

    return `

      <div
        style="
          margin-bottom:20px;
          background:#fff;
          border-radius:12px;
          padding:20px;
          border:1px solid #e5e7eb;
        "
      >

        <div
          style="
            display:flex;
            justify-content:space-between;
            margin-bottom:12px;
            font-weight:600;
          "
        >

          <div>
            Generating Export...
          </div>

          <div>
            ${job.progress}%
          </div>

        </div>

        <div
          style="
            width:100%;
            height:10px;
            background:#ececec;
            border-radius:999px;
            overflow:hidden;
          "
        >

          <div
            style="
              width:${job.progress}%;
              height:100%;
              background:#111827;
              transition:width .2s;
            "
          >

          </div>

        </div>

        <div
          style="
            margin-top:12px;
            color:#666;
            font-size:13px;
          "
        >

          Processed
          ${job.processed}
          /
          ${job.total}
          styles

        </div>

      </div>

    `;

  }

  return `

    <div
      style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        margin-bottom:20px;
        background:#fff;
        border:1px solid #e5e7eb;
        border-radius:12px;
        padding:20px;
      "
    >

      <div>

        <div
          style="
            font-weight:600;
          "
        >

          Export Ready

        </div>

        <div
          style="
            color:#666;
            font-size:13px;
            margin-top:4px;
          "
        >

          ${job.total}
          styles processed successfully

        </div>

      </div>

      <a
        href="${job.blobUrl}"
        download="reverse_pricing_export.csv"
        class="tab-btn active"
      >

        Download Export

      </a>

    </div>

  `;

}

/* -----------------------------------
RENDER REPORT
----------------------------------- */

export function renderReversePricingReport(
  filters
) {

  if (
    !reversePricingGenerated
  ) {

    return `

      <div class="empty-state">

        <div
          style="
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:center;
            gap:16px;
            padding:60px 20px;
          "
        >

          <div
            style="
              font-size:18px;
              font-weight:600;
            "
          >

            Reverse Pricing Engine Ready

          </div>

          <div
            style="
              color:#777;
              text-align:center;
              max-width:420px;
              line-height:1.6;
            "
          >

            Apply filters if needed and click generate pricing to run the pricing engine.

          </div>

          <button
            class="tab-btn active"
            id="generateReversePricingBtn"
            style="
              min-width:220px;
              height:48px;
            "
          >

            Generate Pricing

          </button>

        </div>

      </div>

    `;

  }

  const filteredProducts =
    filterProducts(filters)
      .slice(0, 50);

  if (
    !filteredProducts.length
  ) {

    return `

      <div class="empty-state">

        No products found

      </div>

    `;

  }

  const tableRows =
    buildRows(
      filteredProducts,
      filters
    );

  return `

    ${renderExportSection()}

    <div class="report-table-wrapper">

      <table class="report-table">

        <thead>

          <tr>

            <th>STYLE ID</th>

            <th>ERP SKU</th>

            <th>BRAND</th>

            <th>ARTICLE</th>

            <th>STATUS</th>

            <th>LAUNCH DATE</th>

            <th>LIVE DATE</th>

            <th>TP</th>

            <th>RULE</th>

            <th>SP</th>

            <th>MRP</th>

            <th>TD %</th>

            <th>GTA</th>

            <th>SP1</th>

            <th>COM %</th>

            <th>COM RS</th>

            <th>FIXED FEE</th>

            <th>GST</th>

            <th>US</th>

            <th>TDS+TCS</th>

            <th>BANK</th>

            <th>ROYALTY</th>

            <th>MARKETING</th>

            <th>PB CODB</th>

            <th>DISPATCH</th>

            <th>RETURN COST</th>

            <th>RTV CODB</th>

            <th>FINAL PAYOUT</th>

            <th>TP PROFIT RS</th>

            <th>TP PROFIT %</th>

          </tr>

        </thead>

        <tbody>

          ${tableRows}

        </tbody>

      </table>

    </div>

  ";

}

/* -----------------------------------
START EXPORT
----------------------------------- */

function startExportJob(
  filters,
  renderCallback
) {

  const products =
    filterProducts(filters);

  const job =
    window.reversePricingExportJob;

  job.running = true;

  job.completed = false;

  job.progress = 0;

  job.processed = 0;

  job.total = products.length;

  job.rows = [];

  renderCallback();

  let index = 0;

  const batchSize = 50;

  function processBatch() {

    const batch =
      products.slice(
        index,
        index + batchSize
      );

    batch.forEach(product => {

      try {

        const row =
          buildExportRow(
            product,
            filters
          );

        if (row) {

          job.rows.push(row);

        }

      } catch (error) {

        console.error(error);

      }

      job.processed++;

    });

    index += batchSize;

    job.progress =
      Math.min(

        100,

        Math.round(
          (
            job.processed /
            job.total
          ) * 100
        )

      );

    renderCallback();

    if (
      index < products.length
    ) {

      setTimeout(
        processBatch,
        0
      );

      return;

    }

    const headers = [

      'STYLE ID',
      'ERP SKU',
      'BRAND',
      'ARTICLE',
      'STATUS',
      'LAUNCH DATE',
      'LIVE DATE',
      'TP',
      'RULE',
      'SP',
      'MRP',
      'TD %',
      'GTA',
      'SP1',
      'COM %',
      'COM RS',
      'FIXED FEE',
      'GST',
      'US',
      'TDS+TCS',
      'BANK',
      'ROYALTY',
      'MARKETING',
      'PB CODB',
      'DISPATCH',
      'RETURN COST',
      'RTV CODB',
      'FINAL PAYOUT',
      'TP PROFIT RS',
      'TP PROFIT %'

    ];

    const csvRows = [

      headers.join(',')

    ];

    job.rows.forEach(row => {

      csvRows.push([

        row.styleId,
        row.erpSku,
        row.brand,
        row.article,
        row.status,
        row.launchDate,
        row.liveDate,
        row.tp,
        row.rule,
        row.sp,
        row.mrp,
        row.td,
        row.gta,
        row.sellerPrice,
        row.commissionPercent,
        row.commissionRs,
        row.fixedFee,
        row.gst,
        row.uploadSettlement,
        row.tds,
        row.bank,
        row.royalty,
        row.marketing,
        row.payoutBeforeCODB,
        row.dispatch,
        row.returnCost,
        row.rtvCodb,
        row.finalPayout,
        row.tpProfitRs,
        row.tpProfitPercent

      ].join(','));

    });

    const blob =
      new Blob(
        [csvRows.join('\n')],
        {
          type:
            'text/csv;charset=utf-8;'
        }
      );

    if (job.blobUrl) {

      URL.revokeObjectURL(
        job.blobUrl
      );

    }

    job.blobUrl =
      URL.createObjectURL(
        blob
      );

    job.running = false;

    job.completed = true;

    renderCallback();

  }

  processBatch();

}

/* -----------------------------------
INITIALIZE
----------------------------------- */

export function initializeReversePricingGeneration(
  renderCallback,
  filters
) {

  const button =
    document.getElementById(
      'generateReversePricingBtn'
    );

  if (button) {

    button.addEventListener(
      'click',
      () => {

        reversePricingGenerated =
          true;

        renderCallback();

      }
    );

  }

  const exportBtn =
    document.getElementById(
      'generateFullExportBtn'
    );

  if (exportBtn) {

    exportBtn.addEventListener(
      'click',
      () => {

        if (
          window.reversePricingExportJob
            .running
        ) {

          return;

        }

        startExportJob(
          filters,
          renderCallback
        );

      }
    );

  }

}

/* -----------------------------------
RESET
----------------------------------- */

export function resetReversePricingGeneration() {

  reversePricingGenerated =
    false;

}