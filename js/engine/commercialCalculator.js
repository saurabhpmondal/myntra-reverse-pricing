import {
  appCache
} from '../services/cacheService.js';

import {
  findMatchingSlab
} from './slabMatcher.js';

function defaultCommercial() {

  return {

    slab: null,

    commissionPercent: 0,

    royaltyPercent: 0,

    marketingPercent: 0,

    fixedFee: 0,

    returnFee: 0,

    pickAndPack: 0

  };

}

export function calculateCommercials({
  brand,
  articleType,
  sellerPrice
}) {

  const brandData =
    appCache.commercialMap?.[brand];

  /*
  -----------------------------------
  BRAND NOT FOUND
  -----------------------------------
  */

  if (!brandData) {

    console.warn(
      `COMMERCIAL BRAND NOT FOUND: ${brand}`
    );

    return defaultCommercial();

  }

  const slabs =
    brandData?.[articleType];

  /*
  -----------------------------------
  ARTICLE TYPE NOT FOUND
  -----------------------------------
  */

  if (
    !slabs ||
    !slabs.length
  ) {

    console.warn(
      `COMMERCIAL ARTICLE TYPE NOT FOUND: ${articleType}`
    );

    return defaultCommercial();

  }

  const matchingSlab =
    findMatchingSlab(
      slabs,
      sellerPrice
    );

  /*
  -----------------------------------
  NO SLAB FOUND
  -----------------------------------
  */

  if (!matchingSlab) {

    console.warn(
      `NO COMMERCIAL SLAB FOUND FOR SP1: ${sellerPrice}`
    );

    return defaultCommercial();

  }

  return {

    slab: matchingSlab,

    commissionPercent:
      Number(
        matchingSlab.commission || 0
      ),

    royaltyPercent:
      Number(
        matchingSlab.royalty || 0
      ),

    marketingPercent:
      Number(
        matchingSlab.marketing || 0
      ),

    fixedFee:
      Number(
        matchingSlab.fixed_fee || 0
      ),

    returnFee:
      Number(
        matchingSlab.return_fee || 0
      ),

    pickAndPack:
      Number(
        matchingSlab.pick_and_pack || 0
      )

  };

}