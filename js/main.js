import {
  initializeApp
} from './services/dataLoader.js';

import {
  renderHeader
} from './components/header.js';

import {
  renderTabs
} from './components/tabs.js';

import {
  renderFilters
} from './components/filters.js';

import {
  renderSummaryCards
} from './reports/summaryCards.js';

import {
  renderReversePricingReport
} from './reports/reversePricingReport.js';

import {
  renderDashboard
} from './reports/dashboardReport.js';

import {
  renderPricingCalculator,
  initializePricingCalculator
} from './calculators/pricingCalculator.js';

let activeTab = 'dashboard';

let filters = {

  brand: '',
  articleType: '',
  status: '',
  search: '',

  continueRule: 'TP+5%',
  otherRule: 'TP'

};

/*
-----------------------------------
MAIN CONTENT RENDER
-----------------------------------
*/

function renderContent() {

  const content =
    document.getElementById(
      'contentArea'
    );

  if (!content) {
    return;
  }

  /*
  -----------------------------------
  DASHBOARD
  -----------------------------------
  */

  if (
    activeTab ===
    'dashboard'
  ) {

    content.innerHTML =
      renderDashboard(filters);

    initializeQuickActions();

    return;

  }

  /*
  -----------------------------------
  REVERSE PRICING
  -----------------------------------
  */

  if (
    activeTab ===
    'reverse-pricing'
  ) {

    content.innerHTML =
      renderReversePricingReport(
        filters
      );

    return;

  }

  /*
  -----------------------------------
  PRICING CALCULATOR
  -----------------------------------
  */

  if (
    activeTab ===
    'pricing-calculator'
  ) {

    content.innerHTML =
      renderPricingCalculator();

    initializePricingCalculator();

    return;

  }

  /*
  -----------------------------------
  BEST BRAND
  -----------------------------------
  */

  if (
    activeTab ===
    'best-brand'
  ) {

    content.innerHTML = `

      <div class="placeholder-content">

        BEST BRAND MODULE
        COMING NEXT

      </div>

    `;

    return;

  }

  /*
  -----------------------------------
  EXPORT CENTER
  -----------------------------------
  */

  if (
    activeTab ===
    'export-center'
  ) {

    content.innerHTML = `

      <div class="placeholder-content">

        EXPORT CENTER
        COMING NEXT

      </div>

    `;

    return;

  }

  /*
  -----------------------------------
  DEFAULT
  -----------------------------------
  */

  content.innerHTML = `

    <div class="placeholder-content">

      ${activeTab
        .replaceAll('-', ' ')
        .toUpperCase()}

    </div>

  `;
}

/*
-----------------------------------
ACTIVE TAB UI
-----------------------------------
*/

function setActiveTabUI() {

  document
    .querySelectorAll('.tab-btn')
    .forEach(btn => {

      btn.classList.remove(
        'active'
      );

      if (
        btn.dataset.tab ===
        activeTab
      ) {

        btn.classList.add(
          'active'
        );

      }

    });

}

/*
-----------------------------------
SWITCH TAB
-----------------------------------
*/

function switchTab(tabId) {

  activeTab = tabId;

  setActiveTabUI();

  renderContent();

}

/*
-----------------------------------
QUICK ACTIONS
-----------------------------------
*/

function initializeQuickActions() {

  const cards =
    document.querySelectorAll(
      '.quick-action-card'
    );

  cards.forEach(card => {

    card.addEventListener(
      'click',
      () => {

        switchTab(
          card.dataset.tabTarget
        );

      }
    );

  });

}

/*
-----------------------------------
TAB INITIALIZATION
-----------------------------------
*/

function initializeTabs() {

  const tabButtons =
    document.querySelectorAll(
      '.tab-btn'
    );

  tabButtons.forEach(button => {

    button.addEventListener(
      'click',
      () => {

        switchTab(
          button.dataset.tab
        );

      }
    );

  });

}

/*
-----------------------------------
FILTERS
-----------------------------------
*/

function initializeFilters() {

  const brandFilter =
    document.getElementById(
      'brandFilter'
    );

  const articleFilter =
    document.getElementById(
      'articleFilter'
    );

  const statusFilter =
    document.getElementById(
      'statusFilter'
    );

  const continueRuleFilter =
    document.getElementById(
      'continueRuleFilter'
    );

  const otherRuleFilter =
    document.getElementById(
      'otherRuleFilter'
    );

  const searchInput =
    document.getElementById(
      'globalSearch'
    );

  let debounceTimer = null;

  /*
  -----------------------------------
  BRAND
  -----------------------------------
  */

  brandFilter.addEventListener(
    'change',
    event => {

      filters.brand =
        event.target.value;

      renderContent();

    }
  );

  /*
  -----------------------------------
  ARTICLE TYPE
  -----------------------------------
  */

  articleFilter.addEventListener(
    'change',
    event => {

      filters.articleType =
        event.target.value;

      renderContent();

    }
  );

  /*
  -----------------------------------
  STATUS
  -----------------------------------
  */

  statusFilter.addEventListener(
    'change',
    event => {

      filters.status =
        event.target.value;

      renderContent();

    }
  );

  /*
  -----------------------------------
  CONTINUE RULE
  -----------------------------------
  */

  continueRuleFilter.addEventListener(
    'change',
    event => {

      filters.continueRule =
        event.target.value;

      renderContent();

    }
  );

  /*
  -----------------------------------
  OTHER RULE
  -----------------------------------
  */

  otherRuleFilter.addEventListener(
    'change',
    event => {

      filters.otherRule =
        event.target.value;

      renderContent();

    }
  );

  /*
  -----------------------------------
  SEARCH
  -----------------------------------
  */

  searchInput.addEventListener(
    'input',
    event => {

      clearTimeout(
        debounceTimer
      );

      debounceTimer =
        setTimeout(() => {

          filters.search =
            event.target.value;

          renderContent();

        }, 300);

    }
  );

}

/*
-----------------------------------
BOOTSTRAP UI
-----------------------------------
*/

async function bootstrapUI() {

  const app =
    document.getElementById(
      'app'
    );

  app.innerHTML = `

    <div class="app-shell">

      ${renderHeader()}

      <div class="app-content">

        ${renderFilters()}

        ${renderSummaryCards()}

        ${renderTabs(activeTab)}

        <div
          class="content-section"
          id="contentArea"
        >

        </div>

      </div>

    </div>

  `;

  initializeTabs();

  initializeFilters();

  renderContent();

}

/*
-----------------------------------
APP START
-----------------------------------
*/

document.addEventListener(
  'DOMContentLoaded',
  async () => {

    await initializeApp();

    await bootstrapUI();

  }
);