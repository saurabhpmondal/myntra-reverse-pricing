import {
  appCache
} from '../services/cacheService.js';

import {
  generatePricingLadder
} from '../engine/pricingEngine.js';

import {
  exportToExcel
} from '../utils/exportExcel.js';

/* -----------------------------------
EXPORT CACHE
----------------------------------- */

let currentExportRows = [];

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
PROFIT CLASS
----------------------------------- */

function getProfitClass(value) {

  return value >= 0
    ? 'profit-positive'
    : 'profit-negative';

}

/* -----------------------------------
TD %
----------------------------------- */

function calculateTD(
  mrp,
  sp
) {

  if (
    !mrp ||
    !sp
  ) {
    return 0;
  }

  return (
    (
      (
        mrp - sp
      ) * 100
    ) / mrp
  );

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

  return appCache.productMaster.filter(row => {

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

  });

}

/* -----------------------------------
RULE SELECTION
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
EXPORT FUNCTION
----------------------------------- */

function exportReversePricing() {

  if (
    !currentExportRows.length
  ) {

    alert(
      'No pricing rows available'
    );

    return;

  }

  exportToExcel({

    fileName:
      'reverse_pricing_export.xlsx',

    rows:
      currentExportRows

  });

}

/* -----------------------------------
BUILD ROWS
----------------------------------- */

function buildRows(
  products,
  filters,
  isExportMode = false
) {

  const rows = [];

  if (isExportMode) {
    currentExportRows = [];
  }

  products.forEach(product => {

    try {

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
        return;
      }

      const s =
        matchedRule.settlement;

      /*
      -----------------------------------
      TD %
      -----------------------------------
      */

      const tdPercent =
        calculateTD(

          Number(
            product.mrp
          ),

          Number(
            matchedRule.derivedSP
          )

        );

      /*
      -----------------------------------
      ROUND UP UPLOAD SETTLEMENT
      -----------------------------------
      */

      const roundedUploadSettlement =
        Math.ceil(
          Number(
            s.uploadSettlement || 0
          )
        );

      /*
      -----------------------------------
      EXPORT DATA
      -----------------------------------
      */

      if (isExportMode) {

        currentExportRows.push({

          'Style ID':
            product.style_id,

          'ERP SKU':
            product.erp_sku,

          Brand:
            product.brand,

          'Article Type':
            product.article_type,

          Status:
            product.status,

          TP:
            Number(product.tp),

          Rule:
            matchedRule.pricingRule,

          SP:
            matchedRule.derivedSP,

          MRP:
            Number(product.mrp),

          'TD %':
            tdPercent,

          GTA:
            s.gtaCharge,

          'Seller Price':
            s.sellerPrice,

          'Commission %':
            s.commissionPercent,

          'Commission Rs':
            s.commissionRs,

          'Fixed Fee':
            s.fixedFee,

          GST:
            s.gstOnComAndFee,

          'Upload Settlement':
            roundedUploadSettlement,

          'TDS + TCS':
            s.totalTaxDeduction,

          'Bank Settlement':
            s.bankSettlement,

          Royalty:
            s.royalty,

          Marketing:
            s.marketing,

          'Payout Before CODB':
            s.payoutBeforeCODB,

          Dispatch:
            s.dispatchCost,

          'Return Cost':
            s.returnCost,

          'RTV CODB':
            s.rtvCodb,

          'Final Payout':
            s.payoutAfterCODB,

          'TP Profit Rs':
            s.tpProfitRs,

          'TP Profit %':
            s.tpProfitPercent

        });

      }

      /*
      -----------------------------------
      TABLE ROWS
      -----------------------------------
      */

      rows.push(`

        <tr>

          <td>${product.style_id}</td>

          <td>${product.erp_sku}</td>

          <td>${product.brand}</td>

          <td>${product.article_type}</td>

          <td>${product.status}</td>

          <td>${formatNumber(product.tp)}</td>

          <td>${matchedRule.pricingRule}</td>

          <td>${formatNumber(
            matchedRule.derivedSP
          )}</td>

          <td>${formatNumber(product.mrp)}</td>

          <td>${formatNumber(
            tdPercent
          )}%</td>

          <td>${formatNumber(
            s.gtaCharge
          )}</td>

          <td>${formatNumber(
            s.sellerPrice
          )}</td>

          <td>${formatNumber(
            s.commissionPercent
          )}%</td>

          <td>${formatNumber(
            s.commissionRs
          )}</td>

          <td>${formatNumber(
            s.fixedFee
          )}</td>

          <td>${formatNumber(
            s.gstOnComAndFee
          )}</td>

          <td>${formatNumber(
            roundedUploadSettlement
          )}</td>

          <td>${formatNumber(
            s.totalTaxDeduction
          )}</td>

          <td>${formatNumber(
            s.bankSettlement
          )}</td>

          <td>${formatNumber(
            s.royalty
          )}</td>

          <td>${formatNumber(
            s.marketing
          )}</td>

          <td>${formatNumber(
            s.payoutBeforeCODB
          )}</td>

          <td>${formatNumber(
            s.dispatchCost
          )}</td>

          <td>${formatNumber(
            s.returnCost
          )}</td>

          <td>${formatNumber(
            s.rtvCodb
          )}</td>

          <td>${formatNumber(
            s.payoutAfterCODB
          )}</td>

          <td class="${getProfitClass(
            s.tpProfitRs
          )}">

            ${formatNumber(
              s.tpProfitRs
            )}

          </td>

          <td class="${getProfitClass(
            s.tpProfitPercent
          )}">

            ${formatNumber(
              s.tpProfitPercent
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
RENDER REPORT
----------------------------------- */

export function renderReversePricingReport(
  filters
) {

  /*
  -----------------------------------
  FULL DATASET FOR EXPORT
  -----------------------------------
  */

  const fullFilteredProducts =
    filterProducts(filters);

  /*
  -----------------------------------
  EXPORT DATA
  -----------------------------------
  */

  buildRows(
    fullFilteredProducts,
    filters,
    true
  );

  /*
  -----------------------------------
  UI LIMITED TO 100
  -----------------------------------
  */

  const visibleProducts =
    fullFilteredProducts
      .slice(0, 100);

  if (
    !visibleProducts.length
  ) {

    return `

      <div class="empty-state">

        No products found

      </div>

    `;

  }

  /*
  -----------------------------------
  TABLE DATA
  -----------------------------------
  */

  const tableRows =
    buildRows(
      visibleProducts,
      filters,
      false
    );

  /*
  -----------------------------------
  EXPORT BUTTON EVENT
  -----------------------------------
  */

  setTimeout(() => {

    const exportBtn =
      document.getElementById(
        'exportReversePricing'
      );

    if (exportBtn) {

      exportBtn.addEventListener(
        'click',
        exportReversePricing
      );

    }

  }, 0);

  return `

    <div class="report-actions-bar">

      <button
        class="tab-btn active"
        id="exportReversePricing"
      >

        Export Pricing XLSX

      </button>

    </div>

    <div class="report-table-wrapper">

      <table class="report-table">

        <thead>

          <tr>

            <th>STYLE ID</th>

            <th>ERP SKU</th>

            <th>BRAND</th>

            <th>ARTICLE</th>

            <th>STATUS</th>

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

  `;

}