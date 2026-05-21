import {
  appCache
} from '../services/cacheService.js';

import {
  solveSellingPrice
} from '../engine/reverseSolver.js';

import {
  calculateSettlement
} from '../engine/settlementCalculator.js';

function getUniqueValues(
  field
) {

  return [
    ...new Set(
      appCache.productMaster.map(
        row => row[field]
      )
    )
  ]
  .filter(Boolean)
  .sort();

}

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

function getProfitClass(value) {

  return value >= 0
    ? 'profit-positive'
    : 'profit-negative';
}

export function renderPricingCalculator() {

  const brands =
    getUniqueValues(
      'brand'
    );

  const articleTypes =
    getUniqueValues(
      'article_type'
    );

  return `

    <div class="calculator-wrapper">

      <div class="calculator-grid">

        <div class="filter-group">

          <label class="filter-label">
            Mode
          </label>

          <select
            class="filter-select"
            id="calculatorMode"
          >

            <option value="tp-sp">
              TP → SP
            </option>

            <option value="sp-tp">
              SP → TP
            </option>

          </select>

        </div>

        <div class="filter-group">

          <label class="filter-label">
            Brand
          </label>

          <select
            class="filter-select"
            id="calculatorBrand"
          >

            ${brands.map(item => `

              <option value="${item}">
                ${item}
              </option>

            `).join('')}

          </select>

        </div>

        <div class="filter-group">

          <label class="filter-label">
            Article Type
          </label>

          <select
            class="filter-select"
            id="calculatorArticle"
          >

            ${articleTypes.map(item => `

              <option value="${item}">
                ${item}
              </option>

            `).join('')}

          </select>

        </div>

        <div class="filter-group">

          <label
            class="filter-label"
            id="valueLabel"
          >

            TP Value

          </label>

          <input
            type="number"
            class="filter-input"
            id="calculatorValue"
            placeholder="Enter value"
          >

        </div>

      </div>

      <div
        style="
          margin-top:20px;
        "
      >

        <button
          class="tab-btn active"
          id="generateCalculator"
        >

          Generate

        </button>

      </div>

      <div
        id="calculatorResult"
        style="
          margin-top:24px;
        "
      >

      </div>

    </div>

  `;
}

function renderResultCards({
  sp,
  payout,
  tpProfitRs,
  tpProfitPercent,
  td
}) {

  return `

    <div class="cards-grid">

      <div class="summary-card">

        <div class="summary-title">
          DERIVED SP
        </div>

        <div class="summary-value">
          ${formatNumber(sp)}
        </div>

      </div>

      <div class="summary-card">

        <div class="summary-title">
          FINAL PAYOUT
        </div>

        <div class="summary-value">
          ${formatNumber(payout)}
        </div>

      </div>

      <div class="summary-card">

        <div class="summary-title">
          TP PROFIT RS
        </div>

        <div class="
          summary-value
          ${getProfitClass(
            tpProfitRs
          )}
        ">

          ${formatNumber(tpProfitRs)}

        </div>

      </div>

      <div class="summary-card">

        <div class="summary-title">
          TP PROFIT %
        </div>

        <div class="
          summary-value
          ${getProfitClass(
            tpProfitPercent
          )}
        ">

          ${formatNumber(
            tpProfitPercent
          )}%

        </div>

      </div>

      <div class="summary-card">

        <div class="summary-title">
          TD %
        </div>

        <div class="summary-value">

          ${formatNumber(td)}%

        </div>

      </div>

    </div>

  `;

}

function renderSettlementTable(
  s
) {

  return `

    <div class="brand-table-wrapper">

      <table class="brand-table">

        <tbody>

          <tr>
            <td>SP</td>
            <td>${formatNumber(
              s.sellingPrice
            )}</td>
          </tr>

          <tr>
            <td>TD %</td>
            <td>${formatNumber(
              s.tradeDiscount
            )}%</td>
          </tr>

          <tr>
            <td>GTA</td>
            <td>${formatNumber(
              s.gtaCharge
            )}</td>
          </tr>

          <tr>
            <td>Seller Price</td>
            <td>${formatNumber(
              s.sellerPrice
            )}</td>
          </tr>

          <tr>
            <td>Commission</td>
            <td>${formatNumber(
              s.commissionRs
            )}</td>
          </tr>

          <tr>
            <td>Fixed Fee</td>
            <td>${formatNumber(
              s.fixedFee
            )}</td>
          </tr>

          <tr>
            <td>GST</td>
            <td>${formatNumber(
              s.gstOnComAndFee
            )}</td>
          </tr>

          <tr>
            <td>Upload Settlement</td>
            <td>${formatNumber(
              s.uploadSettlement
            )}</td>
          </tr>

          <tr>
            <td>Bank Settlement</td>
            <td>${formatNumber(
              s.bankSettlement
            )}</td>
          </tr>

          <tr>
            <td>
              Royalty
              (Incl GST)
            </td>

            <td>${formatNumber(
              s.royalty
            )}</td>
          </tr>

          <tr>
            <td>
              Marketing
              (Incl GST)
            </td>

            <td>${formatNumber(
              s.marketing
            )}</td>
          </tr>

          <tr>
            <td>Dispatch</td>
            <td>${formatNumber(
              s.dispatchCost
            )}</td>
          </tr>

          <tr>
            <td>Return Cost</td>
            <td>${formatNumber(
              s.returnCost
            )}</td>
          </tr>

          <tr>
            <td>RTV CODB</td>
            <td>${formatNumber(
              s.rtvCodb
            )}</td>
          </tr>

          <tr>
            <td>Final Payout</td>
            <td>${formatNumber(
              s.payoutAfterCODB
            )}</td>
          </tr>

        </tbody>

      </table>

    </div>

  `;
}

export function initializePricingCalculator() {

  const mode =
    document.getElementById(
      'calculatorMode'
    );

  const label =
    document.getElementById(
      'valueLabel'
    );

  const generateBtn =
    document.getElementById(
      'generateCalculator'
    );

  const result =
    document.getElementById(
      'calculatorResult'
    );

  mode.addEventListener(
    'change',
    () => {

      label.textContent =
        mode.value === 'tp-sp'
          ? 'TP Value'
          : 'SP Value';

    }
  );

  generateBtn.addEventListener(
    'click',
    () => {

      try {

        const calculatorMode =
          mode.value;

        const brand =
          document.getElementById(
            'calculatorBrand'
          ).value;

        const articleType =
          document.getElementById(
            'calculatorArticle'
          ).value;

        const value =
          Number(
            document.getElementById(
              'calculatorValue'
            ).value
          );

        if (
          !brand ||
          !articleType ||
          !value
        ) {

          result.innerHTML = `

            <div class="empty-state">

              Please fill all fields

            </div>

          `;

          return;

        }

        /*
        -----------------------------------
        TP → SP
        -----------------------------------
        */

        if (
          calculatorMode ===
          'tp-sp'
        ) {

          const sampleProduct =
            appCache.productMaster.find(
              row =>

                row.brand === brand &&

                row.article_type ===
                articleType
            );

          const solved =
            solveSellingPrice({

              brand,
              articleType,

              targetPayout:
                value,

              tp: value

            });

          if (!solved) {

            result.innerHTML = `

              <div class="empty-state">

                Unable to derive SP

              </div>

            `;

            return;

          }

          const settlement =
            calculateSettlement({

              brand,
              articleType,

              sellingPrice:
                solved.sellingPrice,

              tp: value,

              mrp:
                Number(
                  sampleProduct?.mrp || 0
                )

            });

          result.innerHTML = `

            ${renderResultCards({

              sp:
                solved.sellingPrice,

              payout:
                settlement.payoutAfterCODB,

              tpProfitRs:
                settlement.tpProfitRs,

              tpProfitPercent:
                settlement.tpProfitPercent,

              td:
                settlement.tradeDiscount

            })}

            ${renderSettlementTable(
              settlement
            )}

          `;

          return;

        }

        /*
        -----------------------------------
        SP → TP
        -----------------------------------
        */

        const sampleProduct =
          appCache.productMaster.find(
            row =>

              row.brand === brand &&

              row.article_type ===
              articleType
          );

        const settlement =
          calculateSettlement({

            brand,
            articleType,

            sellingPrice:
              value,

            tp: 0,

            mrp:
              Number(
                sampleProduct?.mrp || 0
              )

          });

        result.innerHTML = `

          ${renderResultCards({

            sp:
              settlement.sellingPrice,

            payout:
              settlement.payoutAfterCODB,

            tpProfitRs:
              settlement.tpProfitRs,

            tpProfitPercent:
              settlement.tpProfitPercent,

            td:
              settlement.tradeDiscount

          })}

          ${renderSettlementTable(
            settlement
          )}

        `;

      } catch (error) {

        console.error(error);

        result.innerHTML = `

          <div class="empty-state">

            Calculation failed

          </div>

        `;

      }

    }
  );

}