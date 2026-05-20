export const tabsConfig = [

  {
    id: 'dashboard',
    label: 'Dashboard'
  },

  {
    id: 'reverse-pricing',
    label: 'Reverse Pricing'
  },

  {
    id: 'pricing-calculator',
    label: 'Pricing Calculator'
  },

  {
    id: 'best-brand',
    label: 'Best Brand'
  },

  {
    id: 'export-center',
    label: 'Export Center'
  }

];

export function renderTabs(
  activeTab = 'dashboard'
) {

  return `

    <div class="tabs-bar">

      ${tabsConfig.map(tab => `

        <button
          class="tab-btn ${
            activeTab === tab.id
              ? 'active'
              : ''
          }"
          data-tab="${tab.id}"
        >

          ${tab.label}

        </button>

      `).join('')}

    </div>

  `;
}