import {
  solveSellingPrice
} from './reverseSolver.js';

function round2(value) {

  return Number(
    Number(value || 0)
      .toFixed(2)
  );

}

function generateContinueRules(tp) {

  return [

    {
      label: 'TP-15%',
      target:
        round2(
          tp * 0.85
        )
    },

    {
      label: 'TP-10%',
      target:
        round2(
          tp * 0.90
        )
    },

    {
      label: 'TP-5%',
      target:
        round2(
          tp * 0.95
        )
    },

    {
      label: 'TP',
      target:
        round2(tp)
    },

    {
      label: 'TP+5%',
      target:
        round2(
          tp * 1.05
        )
    },

    {
      label: 'TP+10%',
      target:
        round2(
          tp * 1.10
        )
    },

    {
      label: 'TP+15%',
      target:
        round2(
          tp * 1.15
        )
    }

  ];

}

function generateOtherRules(tp) {

  return [

    {
      label: 'TP-40%',
      target:
        round2(
          tp * 0.60
        )
    },

    {
      label: 'TP-20%',
      target:
        round2(
          tp * 0.80
        )
    },

    {
      label: 'TP-15%',
      target:
        round2(
          tp * 0.85
        )
    },

    {
      label: 'TP-10%',
      target:
        round2(
          tp * 0.90
        )
    },

    {
      label: 'TP-5%',
      target:
        round2(
          tp * 0.95
        )
    },

    {
      label: 'TP',
      target:
        round2(tp)
    }

  ];

}

function getPricingRules({
  status,
  tp
}) {

  if (
    status === 'CONTINUE'
  ) {

    return generateContinueRules(tp);

  }

  return generateOtherRules(tp);

}

export function generatePricingLadder({

  brand,
  articleType,

  status,

  tp,
  mrp,

  customReturnPercent = null,
  customDispatchCost = null

}) {

  const pricingRules =
    getPricingRules({
      status,
      tp
    });

  const results = [];

  pricingRules.forEach(rule => {

    try {

      const solved =
        solveSellingPrice({

          brand,
          articleType,

          targetPayout:
            rule.target,

          tp,
          mrp,

          customReturnPercent,
          customDispatchCost

        });

      if (!solved) {
        return;
      }

      results.push({

        pricingRule:
          rule.label,

        targetPayout:
          rule.target,

        derivedSP:
          solved.sellingPrice,

        achievedPayout:
          solved.payout,

        payoutDifference:
          round2(
            solved.difference
          ),

        iterations:
          solved.iterations,

        settlement:
          solved.settlement

      });

    } catch (error) {

      console.error(
        `PRICING RULE FAILED: ${rule.label}`
      );

      console.error(error);

    }

  });

  return results;

}