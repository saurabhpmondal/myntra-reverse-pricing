import {
  appCache
} from '../services/cacheService.js';

import {
  findMatchingSlab
} from './slabMatcher.js';

function defaultGTA() {

  return {

    slab: null,

    gtaCharge: 0

  };

}

export function calculateGTA({
  brand,
  articleType,
  sellingPrice
}) {

  const brandData =
    appCache.gtaMap?.[brand];

  /*
  -----------------------------------
  BRAND NOT FOUND
  -----------------------------------
  */

  if (!brandData) {

    console.warn(
      `GTA BRAND NOT FOUND: ${brand}`
    );

    return defaultGTA();

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
      `GTA ARTICLE TYPE NOT FOUND: ${articleType}`
    );

    return defaultGTA();

  }

  const matchingSlab =
    findMatchingSlab(
      slabs,
      sellingPrice
    );

  /*
  -----------------------------------
  NO SLAB FOUND
  -----------------------------------
  */

  if (!matchingSlab) {

    console.warn(
      `NO GTA SLAB FOUND FOR SP: ${sellingPrice}`
    );

    return defaultGTA();

  }

  return {

    slab: matchingSlab,

    gtaCharge:
      Number(
        matchingSlab.gta_charges || 0
      )

  };

}