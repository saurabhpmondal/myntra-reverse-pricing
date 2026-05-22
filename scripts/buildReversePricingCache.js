import { createClient } from '@supabase/supabase-js';

/* -----------------------------------
SUPABASE
----------------------------------- */

const supabase =
  createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      realtime: {
        enabled: false
      }
    }
  );

/* -----------------------------------
RULES
----------------------------------- */

const CONTINUE_RULES = [

  {
    name: 'TP',
    margin: 0
  },

  {
    name: 'TP+5%',
    margin: 5
  },

  {
    name: 'TP+10%',
    margin: 10
  },

  {
    name: 'TP-5%',
    margin: -5
  },

  {
    name: 'TP-10%',
    margin: -10
  },

  {
    name: 'TP-15%',
    margin: -15
  }

];

const OTHER_RULES = [

  {
    name: 'TP',
    margin: 0
  },

  {
    name: 'TP+5%',
    margin: 5
  },

  {
    name: 'TP+10%',
    margin: 10
  },

  {
    name: 'TP-5%',
    margin: -5
  },

  {
    name: 'TP-10%',
    margin: -10
  },

  {
    name: 'TP-15%',
    margin: -15
  },

  {
    name: 'TP-20%',
    margin: -20
  },

  {
    name: 'TP-25%',
    margin: -25
  },

  {
    name: 'TP-30%',
    margin: -30
  },

  {
    name: 'TP-35%',
    margin: -35
  },

  {
    name: 'TP-40%',
    margin: -40
  }

];

/* -----------------------------------
HELPERS
----------------------------------- */

function round(value) {

  return Number(
    Number(value || 0)
      .toFixed(2)
  );

}

/* -----------------------------------
GET COMMERCIAL
----------------------------------- */

function getCommercialRow({
  commercials,
  brand,
  articleType,
  sellingPrice
}) {

  return commercials.find(row =>

    row.brand === brand &&

    row.article_type === articleType &&

    Number(sellingPrice) >=
    Number(row.lower_limit) &&

    Number(sellingPrice) <=
    Number(row.upper_limit)

  );

}

/* -----------------------------------
GET GTA
----------------------------------- */

function getGTARow({
  gtaRows,
  brand,
  articleType,
  sellingPrice
}) {

  return gtaRows.find(row =>

    row.brand === brand &&

    row.article_type === articleType &&

    Number(sellingPrice) >=
    Number(row.lower_limit) &&

    Number(sellingPrice) <=
    Number(row.upper_limit)

  );

}

/* -----------------------------------
CALCULATE SETTLEMENT
----------------------------------- */

function calculateSettlement({
  product,
  sellingPrice,
  commercial,
  gta
}) {

  const tp =
    Number(product.tp);

  const mrp =
    Number(product.mrp);

  const tradeDiscount =
    round(
      (
        (
          mrp - sellingPrice
        ) / mrp
      ) * 100
    );

  const gtaCharge =
    round(
      gta?.gta_charges || 0
    );

  const sellerPrice =
    round(
      sellingPrice - gtaCharge
    );

  const commissionPercent =
    round(
      commercial.commission
    );

  const commissionRs =
    round(
      (
        sellerPrice *
        commissionPercent
      ) / 100
    );

  const fixedFee =
    round(
      commercial.fixed_fee
    );

  const gst =
    round(
      (
        commissionRs +
        fixedFee
      ) * 0.18
    );

  const uploadSettlement =
    round(
      sellerPrice -
      commissionRs -
      fixedFee -
      gst
    );

  const tdsTcs =
    round(
      uploadSettlement *
      0.011
    );

  const bankSettlement =
    round(
      uploadSettlement -
      tdsTcs
    );

  const royalty =
    round(
      commercial.royalty || 0
    );

  const marketing =
    round(
      commercial.marketing || 0
    );

  const payoutBeforeCODB =
    round(
      bankSettlement -
      royalty -
      marketing
    );

  const dispatchCost =
    round(
      commercial.pick_and_pack || 0
    );

  const returnCost =
    round(
      commercial.return_fee || 0
    );

  const rtvCodb =
    round(
      dispatchCost +
      returnCost
    );

  const finalPayout =
    round(
      payoutBeforeCODB -
      rtvCodb
    );

  const tpProfitRs =
    round(
      finalPayout - tp
    );

  const tpProfitPercent =
    round(
      (
        tpProfitRs / tp
      ) * 100
    );

  return {

    tradeDiscount,
    gtaCharge,
    sellerPrice,
    commissionPercent,
    commissionRs,
    fixedFee,
    gst,
    uploadSettlement,
    tdsTcs,
    bankSettlement,
    royalty,
    marketing,
    payoutBeforeCODB,
    dispatchCost,
    returnCost,
    rtvCodb,
    finalPayout,
    tpProfitRs,
    tpProfitPercent

  };

}

/* -----------------------------------
SOLVE SP
----------------------------------- */

function solveSellingPrice({
  targetPayout,
  product,
  commercial,
  gta
}) {

  let sp =
    Number(product.tp);

  for (
    let i = 0;
    i < 1000;
    i++
  ) {

    const settlement =
      calculateSettlement({

        product,
        sellingPrice: sp,
        commercial,
        gta

      });

    if (
      settlement.finalPayout >=
      targetPayout
    ) {

      return {

        sellingPrice: round(sp),
        settlement

      };

    }

    sp += 1;

  }

  return null;

}

/* -----------------------------------
BUILD PRICING JSON
----------------------------------- */

function buildPricingJSON({
  product,
  commercials,
  gtaRows
}) {

  const pricingData = {};

  const rules =
    product.status ===
    'CONTINUE'

      ? CONTINUE_RULES
      : OTHER_RULES;

  rules.forEach(rule => {

    const targetPayout =
      Number(product.tp) *

      (
        1 +
        (
          rule.margin / 100
        )
      );

    const commercial =
      getCommercialRow({

        commercials,
        brand:
          product.brand,

        articleType:
          product.article_type,

        sellingPrice:
          product.mrp

      });

    const gta =
      getGTARow({

        gtaRows,
        brand:
          product.brand,

        articleType:
          product.article_type,

        sellingPrice:
          product.mrp

      });

    if (!commercial) {

      console.log(
        `COMMERCIAL NOT FOUND: ${product.brand}`
      );

      return;

    }

    if (!gta) {

      console.log(
        `GTA NOT FOUND: ${product.brand}`
      );

      return;

    }

    const solved =
      solveSellingPrice({

        targetPayout,
        product,
        commercial,
        gta

      });

    if (!solved) {
      return;
    }

    pricingData[
      rule.name
    ] = {

      sp:
        solved.sellingPrice,

      ...solved.settlement

    };

  });

  return pricingData;

}

/* -----------------------------------
MAIN
----------------------------------- */

async function buildReversePricingCache() {

  console.log(
    '\nLoading masters...\n'
  );

  const {
    data: products
  } = await supabase
    .from('product_master')
    .select('*');

  const {
    data: commercials
  } = await supabase
    .from('commercials_master')
    .select('*');

  const {
    data: gtaRows
  } = await supabase
    .from('gta_master')
    .select('*');

  console.log(
    `Products: ${products.length}`
  );

  console.log(
    `Commercials: ${commercials.length}`
  );

  console.log(
    `GTA: ${gtaRows.length}`
  );

  console.log(
    '\nClearing old cache...\n'
  );

  await supabase
    .from('reverse_pricing_cache')
    .delete()
    .neq('id', 0);

  const rows = [];

  let processed = 0;

  products.forEach(product => {

    const pricingData =
      buildPricingJSON({

        product,
        commercials,
        gtaRows

      });

    rows.push({

      style_id:
        product.style_id,

      erp_sku:
        product.erp_sku,

      brand:
        product.brand,

      article_type:
        product.article_type,

      status:
        product.status,

      launch_date:
        product.launch_date,

      live_date:
        product.live_date,

      tp:
        product.tp,

      mrp:
        product.mrp,

      pricing_data:
        pricingData,

      generated_at:
        new Date()
          .toISOString()

    });

    processed++;

    if (
      processed % 500 === 0
    ) {

      console.log(
        `Prepared ${processed} rows`
      );

    }

  });

  console.log(
    '\nStarting insert...\n'
  );

  const batchSize = 500;

  for (
    let i = 0;
    i < rows.length;
    i += batchSize
  ) {

    const batch =
      rows.slice(
        i,
        i + batchSize
      );

    const {
      error
    } = await supabase
      .from(
        'reverse_pricing_cache'
      )
      .insert(batch);

    if (error) {

      console.log(error);

      continue;

    }

    console.log(

      `Inserted ${
        Math.min(
          i + batchSize,
          rows.length
        )
      } / ${rows.length}`

    );

  }

  console.log(
    '\nCACHE BUILD COMPLETE\n'
  );

}

buildReversePricingCache();