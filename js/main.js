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
  renderFilters,
  initializeFilters
} from './components/filters.js';

import {
  renderSummaryCards
} from './reports/summaryCards.js';

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

        ${renderTabs()}

        <div class="content-section">

          <div class="placeholder-content">

            Reverse Pricing Engine Ready

          </div>

        </div>

      </div>

    </div>

  `;

  initializeFilters();

}

document.addEventListener(
  'DOMContentLoaded',
  async () => {

    await initializeApp();

    await bootstrapUI();

  }
);