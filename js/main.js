import {
  renderTabs
} from './components/tabs.js';

import {
  renderDashboard
} from './reports/dashboardReport.js';

import {
  renderReversePricingReport
} from './reports/reversePricingReport.js';

import {
  renderBestBrandReport,
  initializeBestBrandReport
} from './reports/bestBrandReport.js';

import {
  renderBulkPricingReport,
  initializeBulkPricing
} from './reports/bulkPricingReport.js';

import {
  renderRebateReport,
  initializeRebateReport
} from './reports/rebateReport.js';

import {
  renderRecoReport,
  initializeRecoReport
} from './reports/recoReport.js';

import {
  appCache
} from './services/cacheService.js';

/* -----------------------------------
APP STATE
----------------------------------- */

let activeTab =
  'dashboard';

/* -----------------------------------
FILTER STATE
----------------------------------- */

const filters = {

  brand: '',
  articleType: '',
  status: '',
  search: '',
  continueRule: 'TP+5%',
  otherRule: 'TP'

};

/* -----------------------------------
RENDER ACTIVE REPORT
----------------------------------- */

function renderActiveReport() {

  if (
    activeTab ===
    'dashboard'
  ) {

    return renderDashboard();

  }

  if (
    activeTab ===
    'reverse-pricing'
  ) {

    return renderReversePricingReport(
      filters
    );

  }

  if (
    activeTab ===
    'best-brand'
  ) {

    return renderBestBrandReport();

  }

  if (
    activeTab ===
    'bulk-pricing'
  ) {

    return renderBulkPricingReport();

  }

  if (
    activeTab ===
    'rebates'
  ) {

    return renderRebateReport();

  }

  if (
    activeTab ===
    'reco-engine'
  ) {

    return renderRecoReport();

  }

  return `

    <div class="empty-state">

      Report not found

    </div>

  `;

}

/* -----------------------------------
RENDER APP
----------------------------------- */

export function renderApp() {

  const app =
    document.getElementById(
      'app'
    );

  app.innerHTML = `

    <div class="app-layout">

      ${renderTabs(
        activeTab
      )}

      <div class="page-content">

        ${renderActiveReport()}

      </div>

    </div>

  `;

  /*
  -----------------------------------
  INITIALIZE REPORTS
  -----------------------------------
  */

  if (
    activeTab ===
    'best-brand'
  ) {

    initializeBestBrandReport();

  }

  if (
    activeTab ===
    'bulk-pricing'
  ) {

    initializeBulkPricing();

  }

  if (
    activeTab ===
    'rebates'
  ) {

    initializeRebateReport();

  }

  if (
    activeTab ===
    'reco-engine'
  ) {

    initializeRecoReport();

  }

  /*
  -----------------------------------
  TAB EVENTS
  -----------------------------------
  */

  document
    .querySelectorAll(
      '.tab-btn[data-tab]'
    )
    .forEach(button => {

      button.onclick =
        () => {

          activeTab =
            button.dataset.tab;

          renderApp();

        };

    });

}

/* -----------------------------------
INITIALIZE APP
----------------------------------- */

window.addEventListener(
  'DOMContentLoaded',
  () => {

    renderApp();

  }
);