import {
  appCache
} from './cacheService.js';

import {
  exportToExcel
} from '../utils/exportExcel.js';

import {
  generatePricingLadder
} from '../engine/pricingEngine.js';

/* -----------------------------------
PROCESS FILE
----------------------------------- */

export async function processCustomReversePricingFile(file) {

  const XLSXLib =
    globalThis.XLSX;

  if (!XLSXLib) {

    alert(
      'XLSX library not loaded'
    );

    return [];

  }

  const buffer =
    await file.arrayBuffer();

  const workbook =
    XLSXLib.read(buffer);

  const sheetName =
    workbook.SheetNames[0];

  const sheet =
    workbook.Sheets[sheetName];

  const rows =
    XLSXLib.utils.sheet_to_json(sheet);

  const results = [];

  rows.forEach(row => {

    const styleId =
      row['STYLE ID']
        ?.toString()
        .trim()
        .toUpperCase();

    const customReturnPercent =
      Number(
        row['RETURN %'] || 0
      );

    const customDispatchCost =
      Number(
        row['DISPATCH COST'] || 0
      );

    const product =
      appCache.productMap[
        styleId
      ];

    if (!product) {
      return;
    }

    const ladder =
      generatePricingLadder({

        brand:
          product.brand,

        articleType:
          product.article_type,

        status:
          product.status,

        tp:
          Number(product.tp || 0),

        mrp:
          Number(product.mrp || 0),

        customReturnPercent,

        customDispatchCost

      });

    ladder.forEach(item => {

      const settlement =
        item.settlement;

      results.push({

        style_id:
          product.style_id,

        brand:
          product.brand,

        article_type:
          product.article_type,

        status:
          product.status,

        custom_return_percent:
          customReturnPercent,

        custom_dispatch_cost:
          customDispatchCost,

        selected_rule:
          item.pricingRule,

        sp:
          settlement.sellingPrice,

        gta:
          settlement.gtaCharge,

        final_payout:
          settlement.payoutAfterCODB,

        tp_profit_rs:
          settlement.tpProfitRs,

        tp_profit_percent:
          settlement.tpProfitPercent

      });

    });

  });

  return results;

}

/* -----------------------------------
EXPORT
----------------------------------- */

export function exportCustomReversePricing(rows) {

  if (!rows.length) {

    alert(
      'No data available'
    );

    return;

  }

  exportToExcel({

    fileName:
      'custom_reverse_pricing.xlsx',

    rows

  });

}