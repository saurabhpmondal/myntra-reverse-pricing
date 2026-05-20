import { appCache } from '../services/cacheService.js';

import { findMatchingSlab } from './slabMatcher.js';

export function calculateCommercials({
  brand,
  articleType,
  sellerPrice
}) {

  const brandData =
    appCache.commercialMap?.[brand];

  if (!brandData) {
    throw new Error(
      `COMMERCIAL BRAND NOT FOUND: ${brand}`
    );
  }

  const slabs =
    brandData?.[articleType];

  if (!slabs || !slabs.length) {
    throw new Error(
      `COMMERCIAL ARTICLE TYPE NOT FOUND: ${articleType}`
    );
  }

  const matchingSlab =
    findMatchingSlab(
      slabs,
      sellerPrice
    );

  if (!matchingSlab) {
    throw new Error(
      `NO COMMERCIAL SLAB FOUND FOR SP1: ${sellerPrice}`
    );
  }

  return {
    slab: matchingSlab,

    commissionPercent: Number(
      matchingSlab.commission || 0
    ),

    royaltyPercent: Number(
      matchingSlab.royalty || 0
    ),

    marketingPercent: Number(
      matchingSlab.marketing || 0
    ),

    fixedFee: Number(
      matchingSlab.fixed_fee || 0
    ),

    returnFee: Number(
      matchingSlab.return_fee || 0
    ),

    pickAndPack: Number(
      matchingSlab.pick_and_pack || 0
    )
  };
}