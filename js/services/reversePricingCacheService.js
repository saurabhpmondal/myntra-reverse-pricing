import {
  supabase
} from './supabaseService.js';

/* -----------------------------------
CACHE
----------------------------------- */

let reversePricingCache = [];

/* -----------------------------------
LOAD CACHE
----------------------------------- */

export async function loadReversePricingCache() {

  if (
    reversePricingCache.length
  ) {

    return reversePricingCache;

  }

  let allRows = [];

  let from = 0;

  const batchSize = 1000;

  while (true) {

    const {
      data,
      error
    } = await supabase
      .from(
        'reverse_pricing_cache'
      )
      .select('*')
      .range(
        from,
        from + batchSize - 1
      );

    if (error) {

      console.error(
        'Reverse pricing cache load failed:',
        error
      );

      return [];

    }

    if (!data?.length) {
      break;
    }

    allRows =
      allRows.concat(data);

    from += batchSize;

    console.log(
      `Loaded ${allRows.length} reverse pricing rows`
    );

    if (
      data.length <
      batchSize
    ) {
      break;
    }

  }

  reversePricingCache =
    allRows;

  console.log(
    `Reverse pricing cache ready: ${reversePricingCache.length} rows`
  );

  return reversePricingCache;

}

/* -----------------------------------
GET ALL CACHE
----------------------------------- */

export function getReversePricingCache() {

  return reversePricingCache;

}

/* -----------------------------------
FILTER CACHE
----------------------------------- */

export function filterReversePricingCache({
  brand,
  articleType,
  status,
  search
}) {

  const searchValue =
    search
      ?.toString()
      .trim()
      .toUpperCase() || '';

  return reversePricingCache
    .filter(row => {

      if (
        brand &&
        row.brand !== brand
      ) {
        return false;
      }

      if (
        articleType &&
        row.article_type !== articleType
      ) {
        return false;
      }

      if (
        status &&
        row.status !== status
      ) {
        return false;
      }

      if (searchValue) {

        const combined = `

          ${row.style_id}
          ${row.erp_sku}
          ${row.brand}
          ${row.article_type}

        `.toUpperCase();

        if (
          !combined.includes(
            searchValue
          )
        ) {

          return false;

        }

      }

      return true;

    })
    .sort((a, b) => {

      const aDate =
        new Date(
          a.launch_date || 0
        );

      const bDate =
        new Date(
          b.launch_date || 0
        );

      return bDate - aDate;

    });

}

/* -----------------------------------
GET RULE DATA
----------------------------------- */

export function getReversePricingRuleData(
  row,
  rule
) {

  if (
    !row?.pricing_data
  ) {

    return null;

  }

  return (
    row.pricing_data[rule] ||
    null
  );

}

/* -----------------------------------
GET FULL EXPORT DATA
----------------------------------- */

export async function getFullReversePricingExportData(
  filters
) {

  await loadReversePricingCache();

  return filterReversePricingCache(
    filters
  );

}

/* -----------------------------------
RESET CACHE
----------------------------------- */

export function resetReversePricingCache() {

  reversePricingCache = [];

}