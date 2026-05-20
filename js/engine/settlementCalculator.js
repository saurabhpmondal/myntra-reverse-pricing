import {
  findCommercial
} from '../services/commercialMatcher.js';

import {
  findGTA
} from '../services/gtaMatcher.js';

/*
-----------------------------------
SAFE NUMBER
-----------------------------------
*/

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

/*
-----------------------------------
ROUND
-----------------------------------
*/

function round2(value) {

  return Number(
    safeNumber(value)
      .toFixed(2)
  );

}

/*
-----------------------------------
MAIN CALCULATOR
-----------------------------------
*/

export function calculateSettlement({

  brand,
  articleType,

  sellingPrice,
  tp = 0

}) {

  try {

    /*
    -----------------------------------
    INPUT NORMALIZATION
    -----------------------------------
    */

    sellingPrice =
      safeNumber(sellingPrice);

    tp =
      safeNumber(tp);

    /*
    -----------------------------------
    GTA LOOKUP
    -----------------------------------
    */

    const gtaData =
      findGTA({

        brand,
        articleType,

        sellingPrice

      });

    if (!gtaData) {

      return null;

    }

    const gtaCharge =
      safeNumber(
        gtaData.gta_charges
      );

    /*
    -----------------------------------
    SP1
    -----------------------------------
    */

    const sellerPrice =
      round2(
        sellingPrice -
        gtaCharge
      );

    /*
    -----------------------------------
    COMMERCIAL LOOKUP
    -----------------------------------
    */

    const commercial =
      findCommercial({

        brand,
        articleType,

        sellerPrice

      });

    if (!commercial) {

      return null;

    }

    /*
    -----------------------------------
    COMMERCIAL VALUES
    -----------------------------------
    */

    const commissionPercent =
      safeNumber(
        commercial.commission
      );

    const royaltyPercent =
      safeNumber(
        commercial.royalty
      );

    const marketingPercent =
      safeNumber(
        commercial.marketing
      );

    const fixedFee =
      safeNumber(
        commercial.fixed_fee
      );

    /*
    -----------------------------------
    COMMISSION
    -----------------------------------
    */

    const commissionRs =
      round2(
        sellerPrice *
        commissionPercent /
        100
      );

    /*
    -----------------------------------
    GST
    -----------------------------------
    */

    const gstOnComAndFee =
      round2(
        (
          commissionRs +
          fixedFee
        ) * 0.18
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

    const totalTaxDeduction =
      round2(
        sellerPrice *
        0.006
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
    ROYALTY
    -----------------------------------
    */

    const royalty =
      round2(
        sellingPrice *
        royaltyPercent /
        100
      );

    /*
    -----------------------------------
    MARKETING
    -----------------------------------
    */

    const marketing =
      round2(
        sellingPrice *
        marketingPercent /
        100
      );

    /*
    -----------------------------------
    GST ON R&M
    -----------------------------------
    */

    const gstOnRoyaltyMarketing =
      round2(
        (
          royalty +
          marketing
        ) * 0.18
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
      sellingPrice < 1000
        ? 25
        : 30;

    /*
    -----------------------------------
    RETURN CHARGE
    -----------------------------------
    */

    const returnCharge =
      233;

    /*
    -----------------------------------
    RETURN COST
    -----------------------------------
    */

    const returnCost =
      round2(

        (
          fixedFee +
          returnCharge
        ) * 1.18

      );

    /*
    -----------------------------------
    RETURN %
    -----------------------------------
    */

    const returnPercent =
      35;

    /*
    -----------------------------------
    RTV CODB
    -----------------------------------
    */

    const rtvCodb =
      round2(

        (
          returnCost *
          returnPercent
        ) /

        (
          100 -
          returnPercent
        )

      );

    /*
    -----------------------------------
    FINAL PAYOUT
    -----------------------------------
    */

    const payoutAfterCODB =
      round2(

        payoutBeforeCODB -
        dispatchCost -
        rtvCodb

      );

    /*
    -----------------------------------
    TP PROFIT
    -----------------------------------
    */

    const tpProfitRs =
      round2(
        payoutAfterCODB - tp
      );

    const tpProfitPercent =
      tp > 0

        ? round2(
            (
              tpProfitRs / tp
            ) * 100
          )

        : 0;

    /*
    -----------------------------------
    TRADE DISCOUNT
    -----------------------------------
    */

    const tradeDiscount =
      sellingPrice > 0

        ? round2(
            (
              (
                sellingPrice -
                sellerPrice
              ) /

              sellingPrice
            ) * 100
          )

        : 0;

    /*
    -----------------------------------
    FINAL SAFE OBJECT
    -----------------------------------
    */

    return {

      sellingPrice,

      gtaCharge,

      sellerPrice,

      commissionPercent,
      commissionRs,

      fixedFee,

      gstOnComAndFee,

      uploadSettlement,

      totalTaxDeduction,

      bankSettlement,

      royalty,
      marketing,

      payoutBeforeCODB,

      dispatchCost,

      returnCharge,

      returnCost,

      rtvCodb,

      payoutAfterCODB,

      tpProfitRs,

      tpProfitPercent,

      tradeDiscount

    };

  } catch (error) {

    console.error(
      'SETTLEMENT ERROR:',
      error
    );

    return null;

  }

}