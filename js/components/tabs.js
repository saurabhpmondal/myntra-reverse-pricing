export function renderTabs(
  activeTab
) {

  return `

    <div class="tabs-wrapper">

      <button
        class="
          tab-btn
          ${
            activeTab ===
            'dashboard'
              ? 'active'
              : ''
          }
        "
        data-tab="dashboard"
      >

        Dashboard

      </button>

      <button
        class="
          tab-btn
          ${
            activeTab ===
            'reverse-pricing'
              ? 'active'
              : ''
          }
        "
        data-tab="reverse-pricing"
      >

        Reverse Pricing

      </button>

      <button
        class="
          tab-btn
          ${
            activeTab ===
            'pricing-calculator'
              ? 'active'
              : ''
          }
        "
        data-tab="pricing-calculator"
      >

        Pricing Calculator

      </button>

      <button
        class="
          tab-btn
          ${
            activeTab ===
            'best-brand'
              ? 'active'
              : ''
          }
        "
        data-tab="best-brand"
      >

        Best Brand

      </button>

      <button
        class="
          tab-btn
          ${
            activeTab ===
            'bulk-pricing'
              ? 'active'
              : ''
          }
        "
        data-tab="bulk-pricing"
      >

        Bulk Pricing

      </button>

      <button
        class="
          tab-btn
          ${
            activeTab ===
            'rebates'
              ? 'active'
              : ''
          }
        "
        data-tab="rebates"
      >

        Rebate Engine

      </button>

      <button
        class="
          tab-btn
          ${
            activeTab ===
            'reco-engine'
              ? 'active'
              : ''
          }
        "
        data-tab="reco-engine"
      >

        Reco Engine

      </button>

    </div>

  `;

}