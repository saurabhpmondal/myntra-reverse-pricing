import {
  filterReversePricingCache,
  getReversePricingRuleData,
  loadReversePricingCache
} from '../services/reversePricingCacheService.js';

let reversePricingGenerated =
  false;

let reversePricingLoading =
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
PROFIT CLASS
----------------------------------- */

function getProfitClass(value) {

  return value >= 0
    ? 'profit-positive'
    : 'profit-negative';

}

/* -----------------------------------
RULE
----------------------------------- */

function getRuleForStatus(
  row,
  filters
) {

  if (
    row.status ===
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
BUILD TABLE ROWS
----------------------------------- */

function buildRows(
  rows,
  filters
) {

  return rows.map(row => {

    const selectedRule =
      getRuleForStatus(
        row,
        filters
      );

    const pricing =
      getReversePricingRuleData(
        row,
        selectedRule
      );

    if (!pricing) {
      return '';
    }

    return `

      <tr>

        <td>${row.style_id}</td>

        <td>${row.erp_sku}</td>

        <td>${row.brand}</td>

        <td>${row.article_type}</td>

        <td>${row.status}</td>

        <td>${row.launch_date || '-'}</td>

        <td>${row.live_date || '-'}</td>

        <td>${formatNumber(row.tp)}</td>

        <td>${selectedRule}</td>

        <td>${formatNumber(
          pricing.sp
        )}</td>

        <td>${formatNumber(
          row.mrp
        )}</td>

        <td>${formatNumber(
          pricing.tradeDiscount
        )}%</td>

        <td>${formatNumber(
          pricing.gtaCharge
        )}</td>

        <td>${formatNumber(
          pricing.sellerPrice
        )}</td>

        <td>${formatNumber(
          pricing.commissionPercent
        )}%</td>

        <td>${formatNumber(
          pricing.commissionRs
        )}</td>

        <td>${formatNumber(
          pricing.fixedFee
        )}</td>

        <td>${formatNumber(
          pricing.gst
        )}</td>

        <td>${formatNumber(
          pricing.uploadSettlement
        )}</td>

        <td>${formatNumber(
          pricing.tdsTcs
        )}</td>

        <td>${formatNumber(
          pricing.bankSettlement
        )}</td>

        <td>${formatNumber(
          pricing.royalty
        )}</td>

        <td>${formatNumber(
          pricing.marketing
        )}</td>

        <td>${formatNumber(
          pricing.payoutBeforeCODB
        )}</td>

        <td>${formatNumber(
          pricing.dispatchCost
        )}</td>

        <td>${formatNumber(
          pricing.returnCost
        )}</td>

        <td>${formatNumber(
          pricing.rtvCodb
        )}</td>

        <td>${formatNumber(
          pricing.finalPayout
        )}</td>

        <td class="${getProfitClass(
          pricing.tpProfitRs
        )}">

          ${formatNumber(
            pricing.tpProfitRs
          )}

        </td>

        <td class="${getProfitClass(
          pricing.tpProfitPercent
        )}">

          ${formatNumber(
            pricing.tpProfitPercent
          )}%

        </td>

      </tr>

    `;

  }).join('');

}

/* -----------------------------------
TABLE
----------------------------------- */

function renderTable(
  rows,
  filters
) {

  return `

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

          ${buildRows(
            rows,
            filters
          )}

        </tbody>

      </table>

    </div>

  `;

}

/* -----------------------------------
RENDER
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

            Reverse Pricing Cache Ready

          </div>

          <div
            style="
              color:#777;
              text-align:center;
              max-width:420px;
              line-height:1.6;
            "
          >

            Pricing is now loaded from prebuilt cache for ultra fast performance.

          </div>

          <button
            class="tab-btn active"
            id="generateReversePricingBtn"
            style="
              min-width:220px;
              height:48px;
            "
          >

            Load Pricing

          </button>

        </div>

      </div>

    `;

  }

  if (
    reversePricingLoading
  ) {

    return `

      <div class="bulk-processing-loader">

        <div class="bulk-processing-spinner">

        </div>

        <div>

          Loading reverse pricing cache...

        </div>

      </div>

    `;

  }

  const filteredRows =
    filterReversePricingCache(
      filters
    );

  if (!filteredRows.length) {

    return `

      <div class="empty-state">

        No products found

      </div>

    `;

  }

  return renderTable(
    filteredRows.slice(0, 100),
    filters
  );

}

/* -----------------------------------
INITIALIZE
----------------------------------- */

export function initializeReversePricingGeneration(
  renderCallback
) {

  const button =
    document.getElementById(
      'generateReversePricingBtn'
    );

  if (!button) {
    return;
  }

  button.addEventListener(
    'click',
    async () => {

      reversePricingGenerated =
        true;

      reversePricingLoading =
        true;

      renderCallback();

      await loadReversePricingCache();

      reversePricingLoading =
        false;

      renderCallback();

    }
  );

}

/* -----------------------------------
RESET
----------------------------------- */

export function resetReversePricingGeneration() {

  reversePricingGenerated =
    false;

}