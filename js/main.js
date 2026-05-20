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

let activeTab = 'dashboard';

let filters = {
  brand: '',
  articleType: '',
  status: '',
  search: '',

  continueRule: 'TP+5%',
  otherRule: 'TP'
};

function renderContent() {

  const content =
    document.getElementById(
      'contentArea'
    );

  if (!content) {
    return;
  }

  if (
    activeTab ===
    'dashboard'
  ) {

    content.innerHTML =
      renderDashboard();

    initializeQuickActions();

    return;

  }

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

  content.innerHTML = `

    <div class="placeholder-content">

      ${activeTab
        .replaceAll('-', ' ')
        .toUpperCase()}

    </div>

  `;
}

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

function switchTab(tabId) {

  activeTab = tabId;

  setActiveTabUI();

  renderContent();

}

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

  brandFilter.addEventListener(
    'change',
    event => {

      filters.brand =
        event.target.value;

      renderContent();

    }
  );

  articleFilter.addEventListener(
    'change',
    event => {

      filters.articleType =
        event.target.value;

      renderContent();

    }
  );

  statusFilter.addEventListener(
    'change',
    event => {

      filters.status =
        event.target.value;

      renderContent();

    }
  );

  continueRuleFilter.addEventListener(
    'change',
    event => {

      filters.continueRule =
        event.target.value;

      renderContent();

    }
  );

  otherRuleFilter.addEventListener(
    'change',
    event => {

      filters.otherRule =
        event.target.value;

      renderContent();

    }
  );

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

document.addEventListener(
  'DOMContentLoaded',
  async () => {

    await initializeApp();

    await bootstrapUI();

  }
);