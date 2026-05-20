export const appCache = {
  productMaster: [],
  commercialsMaster: [],
  gtaMaster: [],

  productMap: {},
  commercialMap: {},
  gtaMap: {},

  initialized: false
};

export function resetCache() {
  appCache.productMaster = [];
  appCache.commercialsMaster = [];
  appCache.gtaMaster = [];

  appCache.productMap = {};
  appCache.commercialMap = {};
  appCache.gtaMap = {};

  appCache.initialized = false;
}