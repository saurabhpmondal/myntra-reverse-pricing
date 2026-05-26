import {
  calculateSettlement
} from './settlementCalculator.js';

/*
-----------------------------------
PURE REVERSE PAYOUT SOLVER
NO MRP DEPENDENCY
-----------------------------------
*/

export function solveSellingPrice({

  brand,
  articleType,

  targetPayout,
  tp,
  mrp,

  customReturnPercent = null,
  customDispatchCost = null

}) {

  /*
  -----------------------------------
  VALIDATION
  -----------------------------------
  */

  if (
    !brand ||
    !articleType ||
    !targetPayout
  ) {

    return null;

  }

  /*
  -----------------------------------
  START SEARCH
  -----------------------------------
  */

  let sellingPrice = 50;

  let matchedSettlement = null;

  /*
  -----------------------------------
  PROGRESSIVE SEARCH
  -----------------------------------
  */

  while (sellingPrice <= 50000) {

    const settlement =
      calculateSettlement({

        brand,
        articleType,

        sellingPrice,

        tp,
        mrp,

        customReturnPercent,
        customDispatchCost

      });

    /*
    -----------------------------------
    INVALID SETTLEMENT
    -----------------------------------
    */

    if (!settlement) {

      sellingPrice++;

      continue;

    }

    /*
    -----------------------------------
    TARGET MATCHED
    -----------------------------------
    */

    if (
      settlement.payoutAfterCODB >=
      targetPayout
    ) {

      matchedSettlement =
        settlement;

      break;

    }

    sellingPrice++;

  }

  /*
  -----------------------------------
  NO MATCH
  -----------------------------------
  */

  if (!matchedSettlement) {

    return null;

  }

  /*
  -----------------------------------
  FINAL RESULT
  -----------------------------------
  */

  return {

    sellingPrice,

    settlement:
      matchedSettlement

  };

}