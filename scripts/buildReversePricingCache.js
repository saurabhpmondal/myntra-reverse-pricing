import { createClient } from '@supabase/supabase-js';

import {
  generatePricingLadder
} from '../js/engine/pricingEngine.js';

/* -----------------------------------
SUPABASE
----------------------------------- */

const supabaseUrl =
  process.env.SUPABASE_URL;

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  createClient(
    supabaseUrl,
    supabaseKey
  );

/* -----------------------------------
RULES
----------------------------------- */

const CONTINUE_RULES = [

  'TP',
  'TP+5%',
  'TP+10%',
  'TP-5%',
  'TP-10%',
  'TP-15%'

];

const OTHER_RULES = [

  'TP',
  'TP+5%',
  'TP+10%',
  'TP-5%',
  'TP-10%',
  'TP-15%',
  'TP-20%',
  'TP-25%',
  'TP-30%',
  'TP-35%',
  'TP-40%'

];

/* -----------------------------------
BUILD PRICING JSON
----------------------------------- */

function buildPricingJSON(
  product
) {

  const pricingData = {};

  const rules =
    product.status ===
    'CONTINUE'

      ? CONTINUE_RULES
      : OTHER_RULES;

  try {

    const ladder =
      generatePricingLadder({

        brand:
          product.brand,

        articleType:
          product.article_type,

        status:
          product.status,

        tp:
          Number(
            product.tp
          ),

        mrp:
          Number(
            product.mrp
          )

      });

    rules.forEach(rule => {

      const matched =
        ladder.find(
          item =>
            item.pricingRule ===
            rule
        );

      if (!matched) {
        return;
      }

      const s =
        matched.settlement;

      pricingData[rule] = {

        sp:
          matched.derivedSP,

        trade_discount:
          s.tradeDiscount,

        gta:
          s.gtaCharge,

        seller_price:
          s.sellerPrice,

        commission_percent:
          s.commissionPercent,

        commission_rs:
          s.commissionRs,

        fixed_fee:
          s.fixedFee,

        gst:
          s.gstOnComAndFee,

        upload_settlement:
          s.uploadSettlement,

        tds_tcs:
          s.totalTaxDeduction,

        bank_settlement:
          s.bankSettlement,

        royalty:
          s.royalty,

        marketing:
          s.marketing,

        payout_before_codb:
          s.payoutBeforeCODB,

        dispatch_cost:
          s.dispatchCost,

        return_cost:
          s.returnCost,

        rtv_codb:
          s.rtvCodb,

        final_payout:
          s.payoutAfterCODB,

        tp_profit_rs:
          s.tpProfitRs,

        tp_profit_percent:
          s.tpProfitPercent

      };

    });

  } catch (error) {

    console.error(
      `Pricing failed for style ${product.style_id}`
    );

  }

  return pricingData;

}

/* -----------------------------------
MAIN
----------------------------------- */

async function buildReversePricingCache() {

  console.log(
    '\nStarting Reverse Pricing Cache Build...\n'
  );

  /*
  -----------------------------------
  FETCH PRODUCT MASTER
  -----------------------------------
  */

  const {
    data: products,
    error: productError
  } = await supabase
    .from('product_master')
    .select('*');

  if (productError) {

    console.error(
      'Product fetch failed:',
      productError
    );

    return;

  }

  console.log(
    `Products Loaded: ${products.length}`
  );

  /*
  -----------------------------------
  CLEAR OLD CACHE
  -----------------------------------
  */

  console.log(
    '\nClearing old cache...\n'
  );

  const {
    error: deleteError
  } = await supabase
    .from('reverse_pricing_cache')
    .delete()
    .neq('id', 0);

  if (deleteError) {

    console.error(
      'Cache clear failed:',
      deleteError
    );

    return;

  }

  console.log(
    'Old cache cleared successfully.'
  );

  /*
  -----------------------------------
  BUILD CACHE ROWS
  -----------------------------------
  */

  const rows = [];

  let processed = 0;

  products.forEach(product => {

    const pricingData =
      buildPricingJSON(
        product
      );

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
    `\nRows Prepared: ${rows.length}\n`
  );

  /*
  -----------------------------------
  BATCH INSERT
  -----------------------------------
  */

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

      console.error(
        `Batch failed at ${i}`,
        error
      );

      continue;

    }

    console.log(

      `Inserted ${Math.min(
        i + batchSize,
        rows.length
      )} / ${rows.length}`

    );

  }

  console.log(
    '\nReverse Pricing Cache Build Completed.\n'
  );

}

/* -----------------------------------
RUN
----------------------------------- */

buildReversePricingCache();