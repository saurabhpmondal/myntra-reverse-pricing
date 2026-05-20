import {
  appCache
} from '../services/cacheService.js';

import {
  solveSellingPrice
} from '../engine/reverseSolver.js';

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

function getSuggestionMap(results) {

  const valid =
    results.filter(
      item => item
    );

  const sorted =
    [...valid].sort(
      (a, b) =>
        a.sp - b.sp
    );

  const map = {};

  const total =
    sorted.length;

  sorted.forEach(
    (item, index) => {

      const ratio =
        index / total;

      if (ratio <= 0.33) {

        map[item.brand] =
          'GOOD';

      } else if (
        ratio <= 0.66
      ) {

        map[item.brand] =
          'MODERATE';

      } else {

        map[item.brand] =
          'BAD';

      }

    }
  );

  return map;

}

function getSuggestionClass(
  suggestion
) {

  if (
    suggestion === 'GOOD'
  ) {
    return 'status-good';
  }

  if (
    suggestion ===
    'MODERATE'
  ) {
    return 'status-moderate';
  }

  return 'status-bad';

}

function getUniqueBrands() {

  return [
    ...new Set(
      appCache.productMaster.map(
        row => row.brand
      )
    )
  ]
  .filter(Boolean)
  .sort();

}

function buildMetricRow(
  label,
  key,
  results,
  formatter = formatNumber
) {

  return `

    <tr>

      <td>
        ${label}
      </td>

      ${results.map(item => `

        <td>

          ${
            item
              ? formatter(
                  item[key]
                )
              : '-'
          }

        </td>

      `).join('')}

    </tr>

  `;

}

export function renderBestBrandReport() {

  return `

    <div class="calculator-wrapper">

      <div class="calculator-grid">

        <div class="filter-group">

          <label class="filter-label">

            TP VALUE

          </label>

          <input
            type="number"
            class="filter-input"
            id="bestBrandTP"
            placeholder="Enter TP"
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
          id="generateBestBrand"
        >

          Find Best Brand

        </button>

      </div>

      <div
        id="bestBrandResult"
        style="
          margin-top:24px;
        "
      >

      </div>

    </div>

  `;

}

export function initializeBestBrand() {

  const generateBtn =
    document.getElementById(
      'generateBestBrand'
    );

  const resultContainer =
    document.getElementById(
      'bestBrandResult'
    );

  generateBtn.addEventListener(
    'click',
    () => {

      const tp =
        Number(
          document.getElementById(
            'bestBrandTP'
          ).value
        );

      if (!tp) {

        resultContainer.innerHTML = `

          <div class="empty-state">

            Please enter TP

          </div>

        `;

        return;

      }

      const brands =
        getUniqueBrands();

      const results =
        brands.map(brand => {

          try {

            /*
            -----------------------------------
            REAL PRODUCT SAMPLE
            -----------------------------------
            */

            const sampleProduct =
              appCache.productMaster.find(
                row =>
                  row.brand === brand
              );

            if (!sampleProduct) {
              return null;
            }

            /*
            -----------------------------------
            SOLVE PRICE
            -----------------------------------
            */

            const solved =
              solveSellingPrice({

                ...sampleProduct,

                tp

              });

            if (!solved) {
              return null;
            }

            const s =
              solved.settlement;

            return {

              brand,

              sp:
                solved.sellingPrice,

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
                s.uploadSettlement,

              bankSettlement:
                s.bankSettlement,

              royalty:
                s.royalty,

              marketing:
                s.marketing,

              payoutBeforeCODB:
                s.payoutBeforeCODB,

              dispatchCost:
                s.dispatchCost,

              returnCost:
                s.returnCost,

              rtvCodb:
                s.rtvCodb,

              payoutAfterCODB:
                s.payoutAfterCODB,

              tpProfitRs:
                s.tpProfitRs,

              tpProfitPercent:
                s.tpProfitPercent

            };

          } catch (error) {

            console.error(error);

            return null;

          }

        });

      const suggestionMap =
        getSuggestionMap(
          results
        );

      resultContainer.innerHTML = `

        <div class="brand-table-wrapper">

          <table class="brand-table">

            <thead>

              <tr>

                <th>
                  METRIC
                </th>

                ${brands.map(brand => `

                  <th>
                    ${brand}
                  </th>

                `).join('')}

              </tr>

            </thead>

            <tbody>

              ${buildMetricRow(
                'Derived SP',
                'sp',
                results
              )}

              ${buildMetricRow(
                'GTA',
                'gta',
                results
              )}

              ${buildMetricRow(
                'Seller Price',
                'sellerPrice',
                results
              )}

              ${buildMetricRow(
                'Commission %',
                'commissionPercent',
                results
              )}

              ${buildMetricRow(
                'Commission Rs',
                'commissionRs',
                results
              )}

              ${buildMetricRow(
                'Fixed Fee',
                'fixedFee',
                results
              )}

              ${buildMetricRow(
                'GST',
                'gst',
                results
              )}

              ${buildMetricRow(
                'Upload Settlement',
                'uploadSettlement',
                results
              )}

              ${buildMetricRow(
                'Bank Settlement',
                'bankSettlement',
                results
              )}

              ${buildMetricRow(
                'Royalty',
                'royalty',
                results
              )}

              ${buildMetricRow(
                'Marketing',
                'marketing',
                results
              )}

              ${buildMetricRow(
                'Payout Before CODB',
                'payoutBeforeCODB',
                results
              )}

              ${buildMetricRow(
                'Dispatch Cost',
                'dispatchCost',
                results
              )}

              ${buildMetricRow(
                'Return Cost',
                'returnCost',
                results
              )}

              ${buildMetricRow(
                'RTV CODB',
                'rtvCodb',
                results
              )}

              ${buildMetricRow(
                'Final Payout',
                'payoutAfterCODB',
                results
              )}

              ${buildMetricRow(
                'TP Profit Rs',
                'tpProfitRs',
                results
              )}

              ${buildMetricRow(
                'TP Profit %',
                'tpProfitPercent',
                results
              )}

              <tr>

                <td>
                  Suggestion
                </td>

                ${brands.map(
                  brand => {

                    const suggestion =
                      suggestionMap[
                        brand
                      ];

                    return `

                      <td>

                        <span class="
                          ${getSuggestionClass(
                            suggestion
                          )}
                        ">

                          ${suggestion || '-'}

                        </span>

                      </td>

                    `;

                  }
                ).join('')}

              </tr>

            </tbody>

          </table>

        </div>

      `;

    }
  );

}