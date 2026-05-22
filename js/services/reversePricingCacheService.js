import {
  createClient
} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

/* -----------------------------------
SUPABASE
----------------------------------- */

const supabaseUrl =
  'https://mkaypthahezxsjldbvnf.supabase.co';

const supabaseKey =
  'YOUR_PUBLISHABLE_KEY';

const supabase =
  createClient(
    supabaseUrl,
    supabaseKey
  );

/* -----------------------------------
GET REVERSE PRICING
----------------------------------- */

export async function getReversePricingData({

  filters = {},

  page = 0,

  pageSize = 100

} = {}) {

  try {

    let query =
      supabase
        .from(
          'reverse_pricing_cache'
        )
        .select('*')

        .range(
          page * pageSize,
          (
            (page + 1) *
            pageSize
          ) - 1
        );

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
        query.or(

          `style_id.ilike.%${filters.search}%,
           erp_sku.ilike.%${filters.search}%,
           brand.ilike.%${filters.search}%`

        );

    }

    /*
    -----------------------------------
    FETCH
    -----------------------------------
    */

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

    /*
    -----------------------------------
    NORMALIZE DATA
    -----------------------------------
    */

    return (
      data || []
    ).map(row => {

      /*
      -----------------------------------
      SELECT RULE
      -----------------------------------
      */

      const selectedRule =

        row.status ===
        'CONTINUE'

          ? (
              filters.continueRule ||

              'TP+5%'
            )

          : (
              filters.otherRule ||

              'TP'
            );

      /*
      -----------------------------------
      RULE DATA
      -----------------------------------
      */

      const ruleData =

        row.pricing_data?.[
          selectedRule
        ] || {};

      /*
      -----------------------------------
      RETURN FLAT STRUCTURE
      -----------------------------------
      */

      return {

        ...row,

        selectedRule,

        sp:
          ruleData.sp || 0,

        trade_discount:
          ruleData.trade_discount || 0,

        gta:
          ruleData.gta || 0,

        seller_price:
          ruleData.seller_price || 0,

        commission_percent:
          ruleData.commission_percent || 0,

        commission_rs:
          ruleData.commission_rs || 0,

        fixed_fee:
          ruleData.fixed_fee || 0,

        gst:
          ruleData.gst || 0,

        upload_settlement:
          ruleData.upload_settlement || 0,

        tds_tcs:
          ruleData.tds_tcs || 0,

        bank_settlement:
          ruleData.bank_settlement || 0,

        royalty:
          ruleData.royalty || 0,

        marketing:
          ruleData.marketing || 0,

        payout_before_codb:
          ruleData.payout_before_codb || 0,

        dispatch_cost:
          ruleData.dispatch_cost || 0,

        return_cost:
          ruleData.return_cost || 0,

        rtv_codb:
          ruleData.rtv_codb || 0,

        final_payout:
          ruleData.final_payout || 0,

        tp_profit_rs:
          ruleData.tp_profit_rs || 0,

        tp_profit_percent:
          ruleData.tp_profit_percent || 0

      };

    });

  } catch (error) {

    console.error(
      'Reverse pricing service failed',
      error
    );

    return [];

  }

}