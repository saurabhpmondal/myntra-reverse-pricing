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
VALID RULES
----------------------------------- */

const VALID_RULES = [

  'TP-40%',
  'TP-20%',
  'TP-15%',
  'TP-10%',
  'TP-5%',
  'TP',
  'TP+5%',
  'TP+10%',
  'TP+15%'

];

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

  /*
  -----------------------------------
  READ FILE
  -----------------------------------
  */

  let workbook;

  /*
  -----------------------------------
  CSV
  -----------------------------------
  */

  if (
    file.name
      .toLowerCase()
      .endsWith('.csv')
  ) {

    const text =
      await file.text();

    workbook =
      XLSXLib.read(
        text,
        {
          type: 'string'
        }
      );

  } else {

    /*
    -----------------------------------
    XLSX
    -----------------------------------
    */

    const buffer =
      await file.arrayBuffer();

    workbook =
      XLSXLib.read(
        buffer,
        {
          type: 'array'
        }
      );

  }

  const sheetName =
    workbook.SheetNames[0];

  const sheet =
    workbook.Sheets[sheetName];

  const rows =
    XLSXLib.utils.sheet_to_json(
      sheet,
      {
        defval: ''
      }
    );

  const results = [];

  rows.forEach(row => {

    /*
    -----------------------------------
    NORMALIZED HEADERS
    -----------------------------------
    */

    const styleId =
      row['style_id']
        ?.toString()
        .trim()
        .toUpperCase();

    const customReturnPercent =
      Number(
        row[
          'return_percentage'
        ] || 0
      );

    const customDispatchCost =
      Number(
        row[
          'dispatch_cost'
        ] || 0
      );

    const selectedRule =
      row['rule']
        ?.toString()
        .trim()
        .toUpperCase();

    /*
    -----------------------------------
    INVALID RULE
    -----------------------------------
    */

    if (
      !VALID_RULES.includes(
        selectedRule
      )
    ) {

      return;

    }

    /*
    -----------------------------------
    PRODUCT
    -----------------------------------
    */

    const product =
      appCache.productMap[
        styleId
      ];

    if (!product) {
      return;
    }

    /*
    -----------------------------------
    GENERATE LADDER
    -----------------------------------
    */

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

    /*
    -----------------------------------
    SELECT RULE
    -----------------------------------
    */

    const matchedRule =
      ladder.find(
        item =>

          item.pricingRule
            .toUpperCase() ===
          selectedRule
      );

    if (!matchedRule) {
      return;
    }

    const settlement =
      matchedRule.settlement;

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
        matchedRule.pricingRule,

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