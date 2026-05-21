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

function round2(value) {

  return Number(
    Number(value || 0)
      .toFixed(2)
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
    Number(sellingPrice);

  const TP =
    Number(tp);

  const MRP =
    Number(mrp);

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

  const commissionPercent =
    commercialData
      .commissionPercent;

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
  NO ROUNDUP
  -----------------------------------
  */

  const gstOnComAndFee =
    round2(

      (
        commissionRs +
        fixedFee
      ) *

      (
        BUSINESS_RULES
          .GST_PERCENT / 100
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
        BUSINESS_RULES
          .TDS_PERCENT / 100
      )

    );

  const tcs =
    round2(

      sellerPrice *

      (
        BUSINESS_RULES
          .TCS_PERCENT / 100
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
    commercialData
      .royaltyPercent;

  const marketingPercent =
    commercialData
      .marketingPercent;

  const royaltyBase =
    round2(

      SP *

      (
        royaltyPercent / 100
      )

    );

  const marketingBase =
    round2(

      SP *

      (
        marketingPercent / 100
      )

    );

  const royaltyGST =
    round2(

      royaltyBase *

      (
        BUSINESS_RULES
          .GST_PERCENT / 100
      )

    );

  const marketingGST =
    round2(

      marketingBase *

      (
        BUSINESS_RULES
          .GST_PERCENT / 100
      )

    );

  /*
  -----------------------------------
  FINAL ROYALTY
  GST INCLUDED
  -----------------------------------
  */

  const royalty =
    round2(
      royaltyBase +
      royaltyGST
    );

  const marketing =
    round2(
      marketingBase +
      marketingGST
    );

  const gstOnRoyaltyMarketing =
    round2(
      royaltyGST +
      marketingGST
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
      marketing

    );

  /*
  -----------------------------------
  DISPATCH COST
  -----------------------------------
  */

  const dispatchCost =
    SP < 1000
      ? BUSINESS_RULES
          .DISPATCH_BELOW_1000
      : BUSINESS_RULES
          .DISPATCH_ABOVE_1000;

  /*
  -----------------------------------
  CODB
  -----------------------------------
  */

  const codbData =
    calculateCODB({

      fixedFee,

      returnFee:
        commercialData
          .returnFee

    });

  /*
  -----------------------------------
  FINAL PAYOUT
  -----------------------------------
  */

  const payoutAfterCODB =
    round2(

      payoutBeforeCODB -
      dispatchCost -
      codbData.rtvCodb

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
            ) * 100
          ) / MRP

        )

      : 0;

  return {

    /*
    INPUTS
    */

    brand,
    articleType,

    mrp: MRP,
    tp: TP,

    sellingPrice: SP,

    /*
    GTA
    */

    gtaCharge,

    /*
    SELLER PRICE
    */

    sellerPrice,

    /*
    COMMERCIALS
    */

    commissionPercent,
    commissionRs,

    fixedFee,

    /*
    GST
    */

    gstOnComAndFee,

    /*
    UPLOAD
    */

    uploadSettlement,

    /*
    TAXES
    */

    tds,
    tcs,

    totalTaxDeduction,

    /*
    BANK
    */

    bankSettlement,

    /*
    ROYALTY
    */

    royaltyPercent,
    royaltyBase,
    royaltyGST,
    royalty,

    marketingPercent,
    marketingBase,
    marketingGST,
    marketing,

    gstOnRoyaltyMarketing,

    /*
    PAYOUT
    */

    payoutBeforeCODB,

    /*
    DISPATCH
    */

    dispatchCost,

    /*
    CODB
    */

    baseReturnCost:
      round2(
        codbData
          .baseReturnCost
      ),

    returnCost:
      round2(
        codbData
          .returnCost
      ),

    rtvPercent:
      codbData
        .rtvPercent,

    rtvCodb:
      round2(
        codbData
          .rtvCodb
      ),

    /*
    FINAL
    */

    payoutAfterCODB,

    tpProfitRs,

    tpProfitPercent,

    tradeDiscount

  };

}