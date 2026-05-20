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
  tp

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

        tp

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