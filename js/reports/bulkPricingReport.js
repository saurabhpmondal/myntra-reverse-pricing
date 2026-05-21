import {
  appCache
} from '../services/cacheService.js';

import {
  solveSellingPrice
} from '../engine/reverseSolver.js';

import {
  exportToExcel
} from '../utils/exportExcel.js';

let uploadedRows = [];

let processedRows = [];

let failedRows = [];

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
DOWNLOAD SAMPLE FILE
----------------------------------- */

function downloadSampleFile() {

  const csv =
    'style_id\nSTYLE123';

  const blob =
    new Blob(
      [csv],
      {
        type:
          'text/csv;charset=utf-8;'
      }
    );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement('a');

  link.href = url;

  link.download =
    'bulk_pricing_sample.csv';

  link.click();

  URL.revokeObjectURL(
    url
  );

}

/* -----------------------------------
EXPORT SUCCESS
----------------------------------- */

function exportSuccessFile() {

  if (
    !processedRows.length
  ) {
    return;
  }

  exportToExcel({

    fileName:
      'bulk_pricing_output.xlsx',

    rows:
      processedRows.map(
        row => ({

          'Style ID':
            row.styleId,

          Brand:
            row.brand,

          'Article Type':
            row.articleType,

          TP:
            row.tp,

          'Margin %':
            row.marginPercent,

          'Derived SP':
            row.sp,

          'Upload Settlement':
            row.uploadSettlement,

          'Final Payout':
            row.finalPayout,

          'TP Profit Rs':
            row.tpProfitRs,

          'TP Profit %':
            row.tpProfitPercent,

          GTA:
            row.gta,

          'RTV CODB':
            row.rtvCodb,

          Status:
            row.status

        })
      )

  });

}

/* -----------------------------------
EXPORT FAILED
----------------------------------- */

function exportErrorFile() {

  if (
    !failedRows.length
  ) {
    return;
  }

  exportToExcel({

    fileName:
      'bulk_pricing_errors.xlsx',

    rows:
      failedRows.map(
        row => ({

          'Style ID':
            row.styleId,

          Status:
            row.status,

          Reason:
            row.reason

        })
      )

  });

}

/* -----------------------------------
KPI CARDS
----------------------------------- */

function renderKPICards({
  uploaded,
  passed,
  failed,
  notFound
}) {

  return `

    <div class="cards-grid">

      <div class="summary-card">

        <div class="summary-title">
          UPLOADED
        </div>

        <div class="summary-value">
          ${uploaded}
        </div>

      </div>

      <div class="summary-card">

        <div class="summary-title">
          PASSED
        </div>

        <div class="
          summary-value
          profit-positive
        ">

          ${passed}

        </div>

      </div>

      <div class="summary-card">

        <div class="summary-title">
          FAILED
        </div>

        <div class="
          summary-value
          profit-negative
        ">

          ${failed}

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

/* -----------------------------------
RESULT TABLE
----------------------------------- */

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
            <th>Article Type</th>
            <th>TP</th>
            <th>Margin %</th>
            <th>Derived SP</th>
            <th>Upload Settlement</th>
            <th>Final Payout</th>
            <th>TP Profit Rs</th>
            <th>TP Profit %</th>
            <th>GTA</th>
            <th>CODB</th>
            <th>Status</th>

          </tr>

        </thead>

        <tbody>

          ${rows.map(row => `

            <tr>

              <td>
                ${row.styleId}
              </td>

              <td>
                ${row.brand || '-'}
              </td>

              <td>
                ${row.articleType || '-'}
              </td>

              <td>
                ${formatNumber(
                  row.tp
                )}
              </td>

              <td>
                ${row.marginPercent}%
              </td>

              <td>
                ${formatNumber(
                  row.sp
                )}
              </td>

              <td>
                ${formatNumber(
                  row.uploadSettlement
                )}
              </td>

              <td>
                ${formatNumber(
                  row.finalPayout
                )}
              </td>

              <td>
                ${formatNumber(
                  row.tpProfitRs
                )}
              </td>

              <td>
                ${formatNumber(
                  row.tpProfitPercent
                )}%
              </td>

              <td>
                ${formatNumber(
                  row.gta
                )}
              </td>

              <td>
                ${formatNumber(
                  row.rtvCodb
                )}
              </td>

              <td>
                ${row.status}
              </td>

            </tr>

          `).join('')}

        </tbody>

      </table>

    </div>

  `;

}

/* -----------------------------------
RENDER
----------------------------------- */

export function renderBulkPricingReport() {

  return `

    <div class="bulk-upload-wrapper">

      <div class="bulk-upload-card">

        <div class="bulk-upload-icon">

          ⬆

        </div>

        <div class="bulk-upload-title">

          Download sample file and upload CSV

        </div>

        <div class="bulk-upload-subtitle">

          Upload style list
          for bulk pricing

        </div>

        <input
          type="file"
          id="bulkPricingFile"
          accept=".csv"
          style="
            margin-top:20px;
          "
        >

        <div
          style="
            margin-top:16px;
          "
        >

          <button
            class="tab-btn"
            id="downloadSampleFile"
          >

            Download Sample File

          </button>

        </div>

      </div>

      <div
        id="bulkValidationArea"
        style="
          margin-top:24px;
        "
      >

      </div>

      <div
        class="bulk-generate-bar"
        style="
          margin-top:24px;
        "
      >

        <div
          class="filter-group"
          style="
            margin-bottom:0;
            max-width:180px;
          "
        >

          <label class="filter-label">

            Margin %

          </label>

          <input
            type="number"
            class="filter-input"
            id="bulkMarginPercent"
            placeholder="5 / -3 / 0"
          >

        </div>

        <button
          class="tab-btn active"
          id="generateBulkPricing"
          disabled
          style="
            height:44px;
            margin-top:24px;
          "
        >

          Generate Pricing

        </button>

      </div>

      <div
        id="bulkPricingResult"
        style="
          margin-top:24px;
        "
      >

      </div>

    </div>

  `;

}

/* -----------------------------------
INITIALIZE
----------------------------------- */

export function initializeBulkPricing() {

  const fileInput =
    document.getElementById(
      'bulkPricingFile'
    );

  const validationArea =
    document.getElementById(
      'bulkValidationArea'
    );

  const generateBtn =
    document.getElementById(
      'generateBulkPricing'
    );

  const resultArea =
    document.getElementById(
      'bulkPricingResult'
    );

  const sampleBtn =
    document.getElementById(
      'downloadSampleFile'
    );

  sampleBtn.addEventListener(
    'click',
    downloadSampleFile
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
          .map(item => item.trim())
          .filter(Boolean);

      uploadedRows = rows;

      const foundCount =
        rows.filter(styleId =>

          appCache.productMaster.some(
            row =>
              String(
                row.style_id
              ) ===
              String(
                styleId
              )
          )

        ).length;

      const notFoundCount =
        rows.length -
        foundCount;

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
                Uploaded
              </div>

            </div>

            <div class="bulk-verified-item">

              <div class="bulk-verified-value">
                ${foundCount}
              </div>

              <div class="bulk-verified-label">
                Found
              </div>

            </div>

            <div class="bulk-verified-item">

              <div class="bulk-verified-value">
                ${notFoundCount}
              </div>

              <div class="bulk-verified-label">
                Not Found
              </div>

            </div>

          </div>

        </div>

      `;

      generateBtn.disabled =
        false;

    }
  );

  generateBtn.addEventListener(
    'click',
    () => {

      const marginPercent =
        Number(
          document.getElementById(
            'bulkMarginPercent'
          ).value || 0
        );

      processedRows = [];
      failedRows = [];

      resultArea.innerHTML = `

        <div class="bulk-processing-loader">

          <div class="bulk-processing-spinner">

          </div>

          <div>

            Generating pricing...

          </div>

        </div>

      `;

      setTimeout(() => {

        uploadedRows.forEach(
          styleId => {

            const product =
              appCache.productMaster.find(
                row =>
                  String(
                    row.style_id
                  ) ===
                  String(
                    styleId
                  )
              );

            if (!product) {

              failedRows.push({

                styleId,

                status:
                  'NOT FOUND',

                reason:
                  'Style missing in master'

              });

              return;

            }

            try {

              const solved =
                solveSellingPrice({

                  brand:
                    product.brand,

                  articleType:
                    product.article_type,

                  targetPayout:
                    Number(
                      product.tp
                    ) *
                    (
                      1 +
                      (
                        marginPercent / 100
                      )
                    ),

                  tp:
                    Number(
                      product.tp
                    )

                });

              if (!solved) {

                failedRows.push({

                  styleId,

                  status:
                    'FAILED',

                  reason:
                    'Unable to derive SP'

                });

                return;

              }

              const s =
                solved.settlement;

              processedRows.push({

                styleId,

                brand:
                  product.brand,

                articleType:
                  product.article_type,

                tp:
                  product.tp,

                marginPercent,

                sp:
                  solved.sellingPrice,

                uploadSettlement:
                  s.uploadSettlement,

                finalPayout:
                  s.payoutAfterCODB,

                tpProfitRs:
                  s.tpProfitRs,

                tpProfitPercent:
                  s.tpProfitPercent,

                gta:
                  s.gtaCharge,

                rtvCodb:
                  s.rtvCodb,

                status:
                  'SUCCESS'

              });

            } catch (error) {

              failedRows.push({

                styleId,

                status:
                  'FAILED',

                reason:
                  error.message

              });

            }

          }
        );

        resultArea.innerHTML = `

          ${renderKPICards({

            uploaded:
              uploadedRows.length,

            passed:
              processedRows.length,

            failed:
              failedRows.filter(
                row =>
                  row.status ===
                  'FAILED'
              ).length,

            notFound:
              failedRows.filter(
                row =>
                  row.status ===
                  'NOT FOUND'
              ).length

          })}

          <div class="bulk-export-bar">

            <button
              class="tab-btn active"
              id="exportSuccessFile"
            >

              Export Success XLSX

            </button>

            ${
              failedRows.length
                ? `

                  <button
                    class="tab-btn"
                    id="exportErrorFile"
                  >

                    Export Error XLSX

                  </button>

                `
                : ''
            }

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

        /*
        -----------------------------------
        EXPORT EVENTS
        -----------------------------------
        */

        document
          .getElementById(
            'exportSuccessFile'
          )
          .addEventListener(
            'click',
            exportSuccessFile
          );

        if (
          failedRows.length
        ) {

          document
            .getElementById(
              'exportErrorFile'
            )
            .addEventListener(
              'click',
              exportErrorFile
            );

        }

      }, 400);

    }
  );

}