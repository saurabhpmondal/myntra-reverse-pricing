import {
  createClient
} from 'https://esm.sh/@supabase/supabase-js';

const supabaseUrl =
  'https://mkaypthahezxsjldbvnf.supabase.co';

const supabaseKey =
  'sb_publishable_pSu0F0Dx4J6JPyNkdBCRhw_3Rr1Jxwo';

const supabase =
  createClient(
    supabaseUrl,
    supabaseKey
  );

/* -----------------------------------
GET REVERSE PRICING DATA
----------------------------------- */

export async function getReversePricingData(
  filters = {}
) {

  let query =
    supabase
      .from(
        'reverse_pricing_cache'
      )
      .select('*');

  /*
  -----------------------------------
  BRAND
  -----------------------------------
  */

  if (
    filters.brand
  ) {

    query =
      query.eq(
        'brand',
        filters.brand
      );

  }

  /*
  -----------------------------------
  ARTICLE TYPE
  -----------------------------------
  */

  if (
    filters.articleType
  ) {

    query =
      query.eq(
        'article_type',
        filters.articleType
      );

  }

  /*
  -----------------------------------
  STATUS
  -----------------------------------
  */

  if (
    filters.status
  ) {

    query =
      query.eq(
        'status',
        filters.status
      );

  }

  /*
  -----------------------------------
  SEARCH
  -----------------------------------
  */

  if (
    filters.search
  ) {

    query =
      query.ilike(
        'style_id',
        `%${filters.search}%`
      );

  }

  const {
    data,
    error
  } = await query;

  if (error) {

    console.error(
      'Reverse pricing fetch failed',
      error
    );

    return [];

  }

  return data || [];

}