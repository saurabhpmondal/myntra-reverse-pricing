import { supabase } from './supabaseClient.js';

import {
  appCache,
  resetCache
} from './cacheService.js';

function cleanText(value) {
  return value?.toString().trim().toUpperCase() || '';
}

function normalizeProductRow(row) {
  return {
    ...row,

    style_id: cleanText(row.style_id),
    erp_sku: cleanText(row.erp_sku),

    brand: cleanText(row.brand),
    article_type: cleanText(row.article_type),
    status: cleanText(row.status)
  };
}

function normalizeCommercialRow(row) {
  return {
    ...row,

    brand: cleanText(row.brand),
    article_type: cleanText(row.article_type),
    level: cleanText(row.level),
    range: cleanText(row.range)
  };
}

function normalizeGtaRow(row) {
  return {
    ...row,

    brand: cleanText(row.brand),
    article_type: cleanText(row.article_type),
    level: cleanText(row.level),
    range: cleanText(row.range)
  };
}

async function fetchProductMaster() {
  const { data, error } = await supabase
    .from('product_master')
    .select('*')
    .range(0, 20000);

  if (error) {
    throw new Error(`PRODUCT MASTER FETCH FAILED: ${error.message}`);
  }

  return data.map(normalizeProductRow);
}

async function fetchCommercialsMaster() {
  const { data, error } = await supabase
    .from('commercials_master')
    .select('*')
    .range(0, 5000);

  if (error) {
    throw new Error(`COMMERCIALS MASTER FETCH FAILED: ${error.message}`);
  }

  return data.map(normalizeCommercialRow);
}

async function fetchGtaMaster() {
  const { data, error } = await supabase
    .from('gta_master')
    .select('*')
    .range(0, 5000);

  if (error) {
    throw new Error(`GTA MASTER FETCH FAILED: ${error.message}`);
  }

  return data.map(normalizeGtaRow);
}

function buildCommercialMap(data) {
  const map = {};

  data.forEach(row => {
    const brand = row.brand;
    const article = row.article_type;

    if (!map[brand]) {
      map[brand] = {};
    }

    if (!map[brand][article]) {
      map[brand][article] = [];
    }

    map[brand][article].push(row);
  });

  return map;
}

function buildGtaMap(data) {
  const map = {};

  data.forEach(row => {
    const brand = row.brand;
    const article = row.article_type;

    if (!map[brand]) {
      map[brand] = {};
    }

    if (!map[brand][article]) {
      map[brand][article] = [];
    }

    map[brand][article].push(row);
  });

  return map;
}

function buildProductMap(data) {
  const map = {};

  data.forEach(row => {
    const styleId = row.style_id;

    map[styleId] = row;
  });

  return map;
}

export async function initializeApp() {
  try {
    console.clear();

    console.log('====================================');
    console.log('MYNTRA REVERSE PRICING INITIALIZING');
    console.log('====================================');

    resetCache();

    const [
      productMaster,
      commercialsMaster,
      gtaMaster
    ] = await Promise.all([
      fetchProductMaster(),
      fetchCommercialsMaster(),
      fetchGtaMaster()
    ]);

    appCache.productMaster = productMaster;
    appCache.commercialsMaster = commercialsMaster;
    appCache.gtaMaster = gtaMaster;

    appCache.productMap = buildProductMap(productMaster);

    appCache.commercialMap = buildCommercialMap(
      commercialsMaster
    );

    appCache.gtaMap = buildGtaMap(
      gtaMaster
    );

    appCache.initialized = true;

    console.log('------------------------------------');
    console.log('DATA LOADED SUCCESSFULLY');
    console.log('------------------------------------');

    console.log(
      `PRODUCT MASTER: ${productMaster.length}`
    );

    console.log(
      `COMMERCIALS MASTER: ${commercialsMaster.length}`
    );

    console.log(
      `GTA MASTER: ${gtaMaster.length}`
    );

    console.log('------------------------------------');
    console.log('CACHE INITIALIZED');
    console.log('------------------------------------');

    window.appCache = appCache;

  } catch (error) {
    console.error('APP INITIALIZATION FAILED');
    console.error(error);
  }
}

