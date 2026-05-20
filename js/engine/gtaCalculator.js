import { appCache } from '../services/cacheService.js';

import { findMatchingSlab } from './slabMatcher.js';

export function calculateGTA({
  brand,
  articleType,
  sellingPrice
}) {

  const brandData =
    appCache.gtaMap?.[brand];

  if (!brandData) {
    throw new Error(
      `GTA BRAND NOT FOUND: ${brand}`
    );
  }

  const slabs =
    brandData?.[articleType];

  if (!slabs || !slabs.length) {
    throw new Error(
      `GTA ARTICLE TYPE NOT FOUND: ${articleType}`
    );
  }

  const matchingSlab =
    findMatchingSlab(
      slabs,
      sellingPrice
    );

  if (!matchingSlab) {
    throw new Error(
      `NO GTA SLAB FOUND FOR SP: ${sellingPrice}`
    );
  }

  return {
    slab: matchingSlab,
    gtaCharge: Number(
      matchingSlab.gta_charges || 0
    )
  };
}