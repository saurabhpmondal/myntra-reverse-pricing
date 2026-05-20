import {
  appCache
} from '../services/cacheService.js';

import {
  generatePricingLadder
} from '../engine/pricingEngine.js';

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

function getProfitClass(value) {

  return value >= 0
    ? 'profit-positive'
    : 'profit-negative';
}

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

function buildRows(products) {

  const rows = [];

  products.forEach(product => {

    try {

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

      pricingLadder.forEach(item => {

        const s =
          item.settlement;

        rows.push(`

          <tr>

            <td>${product.style_id}</td>

            <td>${product.erp_sku}</td>

            <td>${product.brand}</td>

            <td>${product.article_type}</td>

            <td>${product.status}</td>

            <td>${formatNumber(product.tp)}</td>

            <td>${item.pricingRule}</td>

            <td>${formatNumber(item.derivedSP)}</td>

            <td>${formatNumber(product.mrp)}</td>

            <td>${formatNumber(s.tradeDiscount)}%</td>

            <td>${formatNumber(s.gtaCharge)}</td>

            <td>${formatNumber(s.sellerPrice)}</td>

            <td>${formatNumber(s.commissionPercent)}%</td>

            <td>${formatNumber(s.commissionRs)}</td>

            <td>${formatNumber(s.fixedFee)}</td>

            <td>${formatNumber(s.gstOnComAndFee)}</td>

            <td>${formatNumber(s.uploadSettlement)}</td>

            <td>${formatNumber(s.totalTaxDeduction)}</td>

            <td>${formatNumber(s.bankSettlement)}</td>

            <td>${formatNumber(s.royalty)}</td>

            <td>${formatNumber(s.marketing)}</td>

            <td>${formatNumber(s.payoutBeforeCODB)}</td>

            <td>${formatNumber(s.dispatchCost)}</td>

            <td>${formatNumber(s.returnCost)}</td>

            <td>${formatNumber(s.rtvCodb)}</td>

            <td>${formatNumber(s.payoutAfterCODB)}</td>

            <td class="${getProfitClass(
              s.tpProfitRs
            )}">

              ${formatNumber(s.tpProfitRs)}

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

      });

    } catch (error) {

      console.error(error);

    }

  });

  return rows.join('');

}

export function renderReversePricingReport(filters) {

  const filteredProducts =
    filterProducts(filters)
      .slice(0, 100);

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
    buildRows(filteredProducts);

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