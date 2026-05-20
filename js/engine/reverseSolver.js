import {
  calculateSettlement
} from './settlementCalculator.js';

function roundToNearestFive(value) {

  return (
    Math.round(
      Number(value) / 5
    ) * 5
  );
}

export function solveSellingPrice({

  brand,
  articleType,

  targetPayout,

  tp = 0,
  mrp = 0,

  minSP = 99,
  maxSP = null,

  tolerance = 1,

  maxIterations = 100

}) {

  const maximumSP =
    maxSP || mrp;

  let low = minSP;
  let high = maximumSP;

  let bestResult = null;

  let iteration = 0;

  while (
    low <= high &&
    iteration < maxIterations
  ) {

    iteration++;

    let mid =
      (low + high) / 2;

    mid =
      roundToNearestFive(mid);

    const settlement =
      calculateSettlement({

        brand,
        articleType,

        sellingPrice: mid,

        tp,
        mrp

      });

    const payout =
      settlement.payoutAfterCODB;

    const difference =
      payout - targetPayout;

    if (
      !bestResult ||
      Math.abs(difference) <
      Math.abs(
        bestResult.difference
      )
    ) {

      bestResult = {
        sellingPrice: mid,

        payout,

        difference,

        settlement,

        iterations: iteration
      };

    }

    if (
      Math.abs(difference)
      <= tolerance
    ) {

      break;

    }

    if (
      payout > targetPayout
    ) {

      high = mid - 5;

    } else {

      low = mid + 5;

    }

  }

  return bestResult;
}