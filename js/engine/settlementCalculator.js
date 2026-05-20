import {
  BUSINESS_RULES
} from '../config/businessRules.js';

import {
  calculateGTA
} from './gtaCalculator.js';

import {
  calculateCommercials
} from './commercialCalculator.js';

import {
  calculateCODB
} from './codbCalculator.js';

function safeNumber(value) {

  const number =
    Number(value);

  if (
    Number.isNaN(number) ||
    !Number.isFinite(number)
  ) {

    return 0;

  }

  return number;
}

function round2(value) {

  return Number(
    safeNumber(value)
      .toFixed(2)
  );
}

function ceil(value) {

  return Math.ceil(
    safeNumber(value)
  );
}

export function calculateSettlement({
  brand,
  articleType,
  sellingPrice,
  tp = 0,
  mrp = 0
}) {

  const SP =
    safeNumber(sellingPrice);

  const TP =
    safeNumber(tp);

  const MRP =
    safeNumber(mrp);

  /*
  -----------------------------------
  GTA
  -----------------------------------
  */

  const gtaData =
    calculateGTA({
      brand,
      articleType,
      sellingPrice: SP
    });

  if (!gtaData) {
    return null;
  }

  const gtaCharge =
    round2(
      gtaData.gtaCharge
    );

  /*
  -----------------------------------
  SELLER PRICE
  -----------------------------------
  */

  const sellerPrice =
    round2(
      SP - gtaCharge
    );

  /*
  -----------------------------------
  COMMERCIALS
  -----------------------------------
  */

  const commercialData =
    calculateCommercials({
      brand,
      articleType,
      sellerPrice
    });

  if (!commercialData) {
    return null;
  }

  const commissionPercent =
    safeNumber(
      commercialData.commissionPercent
    );

  const commissionRs =
    round2(
      sellerPrice *
      (
        commissionPercent / 100
      )
    );

  const fixedFee =
    round2(
      commercialData.fixedFee
    );

  /*
  -----------------------------------
  GST ON COM + FIXED FEE
  -----------------------------------
  */

  const gstOnComAndFee =
    ceil(
      (
        commissionRs +
        fixedFee
      ) *
      (
        BUSINESS_RULES.GST_PERCENT / 100
      )
    );

  /*
  -----------------------------------
  UPLOAD SETTLEMENT
  -----------------------------------
  */

  const uploadSettlement =
    round2(
      sellerPrice -
      commissionRs -
      fixedFee -
      gstOnComAndFee
    );

  /*
  -----------------------------------
  TDS + TCS
  -----------------------------------
  */

  const tds =
    round2(
      sellerPrice *
      (
        BUSINESS_RULES.TDS_PERCENT / 100
      )
    );

  const tcs =
    round2(
      sellerPrice *
      (
        BUSINESS_RULES.TCS_PERCENT / 100
      )
    );

  const totalTaxDeduction =
    round2(
      tds + tcs
    );

  /*
  -----------------------------------
  BANK SETTLEMENT
  -----------------------------------
  */

  const bankSettlement =
    round2(
      uploadSettlement -
      totalTaxDeduction
    );

  /*
  -----------------------------------
  ROYALTY + MARKETING
  -----------------------------------
  */

  const royaltyPercent =
    safeNumber(
      commercialData.royaltyPercent
    );

  const marketingPercent =
    safeNumber(
      commercialData.marketingPercent
    );

  const royalty =
    round2(
      SP *
      (
        royaltyPercent / 100
      )
    );

  const marketing =
    round2(
      SP *
      (
        marketingPercent / 100
      )
    );

  const gstOnRoyaltyMarketing =
    round2(
      (
        royalty +
        marketing
      ) *
      (
        BUSINESS_RULES.GST_PERCENT / 100
      )
    );

  /*
  -----------------------------------
  PAYOUT BEFORE CODB
  -----------------------------------
  */

  const payoutBeforeCODB =
    round2(
      bankSettlement -
      royalty -
      marketing -
      gstOnRoyaltyMarketing
    );

  /*
  -----------------------------------
  DISPATCH COST
  -----------------------------------
  */

  const dispatchCost =
    SP < 1000
      ? BUSINESS_RULES.DISPATCH_BELOW_1000
      : BUSINESS_RULES.DISPATCH_ABOVE_1000;

  /*
  -----------------------------------
  CODB
  -----------------------------------
  */

  const codbData =
    calculateCODB({
      fixedFee,
      returnFee:
        safeNumber(
          commercialData.returnFee
        )
    });

  if (!codbData) {
    return null;
  }

  /*
  -----------------------------------
  FINAL PAYOUT
  -----------------------------------
  */

  const payoutAfterCODB =
    round2(
      payoutBeforeCODB -
      dispatchCost -
      safeNumber(
        codbData.rtvCodb
      )
    );

  /*
  -----------------------------------
  TP PROFIT
  -----------------------------------
  */

  const tpProfitRs =
    round2(
      payoutAfterCODB - TP
    );

  const tpProfitPercent =
    TP > 0
      ? round2(
          (
            tpProfitRs / TP
          ) * 100
        )
      : 0;

  /*
  -----------------------------------
  TD %
  -----------------------------------
  */

  const tradeDiscount =
    MRP > 0
      ? round2(
          (
            (
              MRP - SP
            ) / MRP
          ) * 100
        )
      : 0;

  return {

    brand,
    articleType,

    mrp: MRP,
    tp: TP,

    sellingPrice: SP,

    gtaCharge,

    sellerPrice,

    commissionPercent,
    commissionRs,

    fixedFee,

    gstOnComAndFee,

    uploadSettlement,

    tds,
    tcs,

    totalTaxDeduction,

    bankSettlement,

    royaltyPercent,
    royalty,

    marketingPercent,
    marketing,

    gstOnRoyaltyMarketing,

    payoutBeforeCODB,

    dispatchCost,

    baseReturnCost:
      round2(
        codbData.baseReturnCost
      ),

    returnCost:
      round2(
        codbData.returnCost
      ),

    rtvPercent:
      codbData.rtvPercent,

    rtvCodb:
      round2(
        codbData.rtvCodb
      ),

    payoutAfterCODB,

    tpProfitRs,

    tpProfitPercent,

    tradeDiscount
  };
}