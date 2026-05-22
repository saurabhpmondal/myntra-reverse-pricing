import {
  createClient
} from '@supabase/supabase-js';

import {
  appCache
} from '../js/services/cacheService.js';

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
HELPERS
----------------------------------- */

function cleanText(value) {

  return value
    ?.toString()
    .trim()
    .toUpperCase() || '';

}

function buildCommercialMap(data) {

  const map = {};

  data.forEach(row => {

    const brand =
      cleanText(row.brand);

    const article =
      cleanText(row.article_type);

    if (!map[brand]) {
      map[brand] = {};
    }

    if (!map[brand][article]) {
      map[brand][article] = [];
    }

    map[brand][article].push({

      ...row,

      brand,
      article_type: article

    });

  });

  return map;

}

function buildGtaMap(data) {

  const map = {};

  data.forEach(row => {

    const brand =
      cleanText(row.brand);

    const article =
      cleanText(row.article_type);

    if (!map[brand]) {
      map[brand] = {};
    }

    if (!map[brand][article]) {
      map[brand][article] = [];
    }

    map[brand][article].push({

      ...row,

      brand,
      article_type: article

    });

  });

  return map;

}

function normalizeProduct(product) {

  return {

    ...product,

    style_id:
      cleanText(
        product.style_id
      ),

    erp_sku:
      cleanText(
        product.erp_sku
      ),

    brand:
      cleanText(
        product.brand
      ),

    article_type:
      cleanText(
        product.article_type
      ),

    status:
      cleanText(
        product.status
      )

  };

}

/* -----------------------------------
RULES
----------------------------------- */

const CONTINUE_RULES = [

  'TP-15%',
  'TP-10%',
  'TP-5%',
  'TP',
  'TP+5%',
  'TP+10%',
  'TP+15%'

];

const OTHER_RULES = [

  'TP-40%',
  'TP-20%',
  'TP-10%',
  'TP-5%',
  'TP'

];

/* -----------------------------------
BUILD PRICING
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
            product.tp || 0
          ),

        mrp:
          Number(
            product.mrp || 0
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

      pricingData[rule] = {

        sp:
          matched.derivedSP,

        ...matched.settlement

      };

    });

  } catch (error) {

    console.error(
      `Pricing failed for ${product.style_id}`
    );

    console.error(error);

  }

  return pricingData;

}

/* -----------------------------------
MAIN
----------------------------------- */

async function buildReversePricingCache() {

  console.log(
    '\n===================================='
  );

  console.log(
    'LOADING PRICING ENGINE'
  );

  console.log(
    '====================================\n'
  );

  /*
  -----------------------------------
  LOAD MASTERS
  -----------------------------------
  */

  const {
    data: commercialsMaster,
    error: commercialsError
  } = await supabase
    .from('commercials_master')
    .select('*');

  if (commercialsError) {

    console.error(
      commercialsError
    );

    return;

  }

  const {
    data: gtaMaster,
    error: gtaError
  } = await supabase
    .from('gta_master')
    .select('*');

  if (gtaError) {

    console.error(
      gtaError
    );

    return;

  }

  appCache.commercialsMaster =
    commercialsMaster;

  appCache.gtaMaster =
    gtaMaster;

  appCache.commercialMap =
    buildCommercialMap(
      commercialsMaster
    );

  appCache.gtaMap =
    buildGtaMap(
      gtaMaster
    );

  console.log(
    '\nPricing maps initialized.\n'
  );

  /*
  -----------------------------------
  LOAD PRODUCTS
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
      deleteError
    );

    return;

  }

  /*
  -----------------------------------
  BUILD ROWS
  -----------------------------------
  */

  const rows = [];

  let processed = 0;

  products.forEach(rawProduct => {

    const product =
      normalizeProduct(
        rawProduct
      );

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
  INSERT
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
    '\n===================================='
  );

  console.log(
    'CACHE BUILD COMPLETED'
  );

  console.log(
    '====================================\n'
  );

}

/* -----------------------------------
RUN
----------------------------------- */

buildReversePricingCache();