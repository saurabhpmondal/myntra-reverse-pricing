import {
  appCache
} from '../services/cacheService.js';

import {
  calculateSettlement
} from '../engine/settlementCalculator.js';

let uploadedRows = [];

let processedRows = [];

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
            <th>MRP</th>
            <th>TD %</th>
            <th>Rebate %</th>
            <th>Target ISP</th>
            <th>GTA</th>
            <th>List Price</th>
            <th>Com %</th>
            <th>Com Rs</th>
            <th>Fixed Fee</th>
            <th>Tax on Com+Fee</th>
            <th>Upload Settlement</th>
            <th>TDS+TCS</th>
            <th>Bank Settlement</th>
            <th>Royalty</th>
            <th>Marketing</th>
            <th>Rebate Amount</th>
            <th>PB-CODB</th>
            <th>Dispatch</th>
            <th>Return Charge</th>
            <th>Return Cost</th>
            <th>Return CODB</th>
            <th>Payout After CODB</th>
            <th>TP</th>
            <th>TP Profit %</th>
            <th>Rebate Action</th>

          </tr>

        </thead>

        <tbody>

          ${rows.map(row => `

            <tr>

              <td>${row.styleId}</td>
              <td>${row.brand}</td>
              <td>${formatNumber(row.mrp)}</td>
              <td>${formatNumber(row.td)}%</td>
              <td>${formatNumber(row.rebatePercent)}%</td>
              <td>${formatNumber(row.targetISP)}</td>
              <td>${formatNumber(row.gta)}</td>
              <td>${formatNumber(row.listPrice)}</td>
              <td>${formatNumber(row.comPercent)}%</td>
              <td>${formatNumber(row.comRs)}</td>
              <td>${formatNumber(row.fixedFee)}</td>
              <td>${formatNumber(row.taxOnComFee)}</td>
              <td>${formatNumber(row.uploadSettlement)}</td>
              <td>${formatNumber(row.tdsTcs)}</td>
              <td>${formatNumber(row.bankSettlement)}</td>
              <td>${formatNumber(row.royalty)}</td>
              <td>${formatNumber(row.marketing)}</td>
              <td>${formatNumber(row.rebateAmount)}</td>
              <td>${formatNumber(row.payoutBeforeCODB)}</td>
              <td>${formatNumber(row.dispatchCost)}</td>
              <td>${formatNumber(row.returnCharge)}</td>
              <td>${formatNumber(row.returnCost)}</td>
              <td>${formatNumber(row.returnCODB)}</td>
              <td>${formatNumber(row.payoutAfterCODB)}</td>
              <td>${formatNumber(row.tp)}</td>
              <td>${formatNumber(row.tpProfitPercent)}%</td>

              <td>

                <span class="
                  ${
                    row.rebateAction ===
                    'OPT-IN'
                      ? 'status-good'
                      : 'status-bad'
                  }
                ">

                  ${row.rebateAction}

                </span>

              </td>

            </tr>

          `).join('')}

        </tbody>

      </table>

    </div>

  `;

}

export function renderRebateReport() {

  return `

    <div class="bulk-upload-wrapper">

      <div class="bulk-upload-card">

        <div class="bulk-upload-icon">

          %

        </div>

        <div class="bulk-upload-title">

          Rebate Engine

        </div>

        <div class="bulk-upload-subtitle">

          Upload rebate planning file

        </div>

        <input
          type="file"
          id="rebateFile"
          accept=".csv,.xlsx"
          style="
            margin-top:20px;
          "
        >

      </div>

      <div
        id="rebateValidationArea"
        style="
          margin-top:24px;
        "
      >

      </div>

      <div
        style="
          margin-top:24px;
        "
      >

        <button
          class="tab-btn active"
          id="checkRebateBtn"
          disabled
        >

          Check Rebate

        </button>

      </div>

      <div
        id="rebateResultArea"
        style="
          margin-top:24px;
        "
      >

      </div>

    </div>

  `;

}

export function initializeRebateReport() {

  const fileInput =
    document.getElementById(
      'rebateFile'
    );

  const validationArea =
    document.getElementById(
      'rebateValidationArea'
    );

  const checkBtn =
    document.getElementById(
      'checkRebateBtn'
    );

  const resultArea =
    document.getElementById(
      'rebateResultArea'
    );

  fileInput.addEventListener(
    'change',
    async event => {

      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      const text =
        await file.text();

      const rows =
        text
          .split('\n')
          .slice(1)
          .map(row => {

            const cols =
              row.split(',');

            return {

              styleId:
                cols[0]?.trim(),

              targetISP:
                Number(cols[1]),

              targetDiscount:
                Number(cols[2]),

              rebatePercent:
                Number(cols[3])

            };

          })
          .filter(
            row => row.styleId
          );

      uploadedRows = rows;

      validationArea.innerHTML = `

        <div class="bulk-verified-card">

          <div class="bulk-verified-title">

            ✓ FILE VERIFIED

          </div>

          <div class="bulk-verified-grid">

            <div class="bulk-verified-item">

              <div class="bulk-verified-value">
                ${rows.length}
              </div>

              <div class="bulk-verified-label">
                Styles Uploaded
              </div>

            </div>

          </div>

        </div>

      `;

      checkBtn.disabled =
        false;

    }
  );

  checkBtn.addEventListener(
    'click',
    () => {

      processedRows = [];

      uploadedRows.forEach(
        item => {

          const product =
            appCache.productMaster.find(
              row =>
                row.style_id ===
                item.styleId
            );

          if (!product) {

            processedRows.push({

              styleId:
                item.styleId,

              rebateAction:
                'NOT FOUND'

            });

            return;

          }

          try {

            const settlement =
              calculateSettlement({

                brand:
                  product.brand,

                articleType:
                  product.article_type,

                sellingPrice:
                  item.targetISP,

                tp:
                  Number(
                    product.tp
                  ),

                mrp:
                  Number(
                    product.mrp
                  )

              });

            const rebateAmount =
              (
                item.targetISP *
                item.rebatePercent
              ) / 100;

            const adjustedPayout =
              settlement
                .payoutAfterCODB +
              rebateAmount;

            const tpProfitPercent =
              (
                (
                  adjustedPayout -
                  Number(
                    product.tp
                  )
                ) /
                Number(
                  product.tp
                )
              ) * 100;

            const allowedLoss =
              product.status ===
              'CONTINUE'
                ? -15
                : -40;

            const rebateAction =
              tpProfitPercent >=
              allowedLoss
                ? 'OPT-IN'
                : 'OPT-OUT';

            processedRows.push({

              styleId:
                item.styleId,

              brand:
                product.brand,

              mrp:
                product.mrp,

              td:
                (
                  (
                    product.mrp -
                    item.targetISP
                  ) * 100
                ) /
                product.mrp,

              rebatePercent:
                item.rebatePercent,

              targetISP:
                item.targetISP,

              gta:
                settlement.gtaCharge,

              listPrice:
                settlement.sellerPrice,

              comPercent:
                settlement.commissionPercent,

              comRs:
                settlement.commissionRs,

              fixedFee:
                settlement.fixedFee,

              taxOnComFee:
                settlement.gstOnComAndFee,

              uploadSettlement:
                settlement.uploadSettlement,

              tdsTcs:
                settlement.totalTaxDeduction,

              bankSettlement:
                settlement.bankSettlement,

              royalty:
                settlement.royalty,

              marketing:
                settlement.marketing,

              rebateAmount,

              payoutBeforeCODB:
                settlement.payoutBeforeCODB,

              dispatchCost:
                settlement.dispatchCost,

              returnCharge:
                settlement.baseReturnCost,

              returnCost:
                settlement.returnCost,

              returnCODB:
                settlement.rtvCodb,

              payoutAfterCODB:
                adjustedPayout,

              tp:
                product.tp,

              tpProfitPercent,

              rebateAction

            });

          } catch (error) {

            processedRows.push({

              styleId:
                item.styleId,

              rebateAction:
                'OPT-OUT'

            });

          }

        }
      );

      const optInCount =
        processedRows.filter(
          row =>
            row.rebateAction ===
            'OPT-IN'
        ).length;

      const optOutCount =
        processedRows.filter(
          row =>
            row.rebateAction ===
            'OPT-OUT'
        ).length;

      const notFoundCount =
        processedRows.filter(
          row =>
            row.rebateAction ===
            'NOT FOUND'
        ).length;

      resultArea.innerHTML = `

        ${renderKPICards({

          total:
            processedRows.length,

          optIn:
            optInCount,

          optOut:
            optOutCount,

          notFound:
            notFoundCount

        })}

        <div
          style="
            margin-top:24px;
          "
        >

          <button
            class="tab-btn active"
            id="exportRebateFile"
          >

            Export XLSX

          </button>

        </div>

        <div
          style="
            margin-top:24px;
          "
        >

          ${renderResultTable(
            processedRows
          )}

        </div>

      `;

    }
  );

}