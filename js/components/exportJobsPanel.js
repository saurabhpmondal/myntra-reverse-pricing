import {
  getExportJobs,
  downloadExportJob
} from '../services/exportJobService.js';

/* -----------------------------------
STATUS CLASS
----------------------------------- */

function getStatusClass(
  status
) {

  if (
    status ===
    'COMPLETED'
  ) {

    return 'status-good';

  }

  if (
    status ===
    'FAILED'
  ) {

    return 'status-bad';

  }

  return 'status-moderate';

}

/* -----------------------------------
PROGRESS BAR
----------------------------------- */

function renderProgressBar(
  progress
) {

  return `

    <div
      style="
        width:100%;
        height:10px;
        background:#e5e7eb;
        border-radius:999px;
        overflow:hidden;
        margin-top:8px;
      "
    >

      <div
        style="
          width:${progress}%;
          height:100%;
          background:#111827;
          transition:width .3s ease;
        "
      >

      </div>

    </div>

  `;

}

/* -----------------------------------
RENDER JOBS
----------------------------------- */

export function renderExportJobsPanel() {

  const jobs =
    getExportJobs();

  if (!jobs.length) {

    return '';

  }

  return `

    <div
      class="summary-card"
      style="
        margin-bottom:20px;
      "
    >

      <div
        style="
          font-size:16px;
          font-weight:700;
          margin-bottom:20px;
        "
      >

        Export Jobs

      </div>

      <div
        style="
          display:flex;
          flex-direction:column;
          gap:16px;
        "
      >

        ${jobs.map(job => `

          <div
            style="
              border:1px solid #e5e7eb;
              border-radius:12px;
              padding:16px;
            "
          >

            <div
              style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                gap:16px;
                flex-wrap:wrap;
              "
            >

              <div>

                <div
                  style="
                    font-weight:700;
                    margin-bottom:6px;
                  "
                >

                  ${job.type}

                </div>

                <div
                  style="
                    font-size:12px;
                    color:#6b7280;
                  "
                >

                  ${job.processed}
                  /
                  ${job.total}
                  styles processed

                </div>

              </div>

              <div
                style="
                  display:flex;
                  align-items:center;
                  gap:12px;
                "
              >

                <span class="
                  ${getStatusClass(
                    job.status
                  )}
                ">

                  ${job.status}

                </span>

                ${
                  job.status ===
                  'COMPLETED'

                    ? `

                      <button
                        class="tab-btn active download-job-btn"
                        data-job-id="${job.id}"
                      >

                        Download

                      </button>

                    `

                    : ''
                }

              </div>

            </div>

            ${
              job.status ===
              'PROCESSING'

                ? renderProgressBar(
                    job.progress
                  )

                : ''
            }

          </div>

        `).join('')}

      </div>

    </div>

  `;

}

/* -----------------------------------
INITIALIZE
----------------------------------- */

export function initializeExportJobsPanel() {

  document
    .querySelectorAll(
      '.download-job-btn'
    )
    .forEach(button => {

      button.addEventListener(
        'click',
        () => {

          downloadExportJob(
            button.dataset.jobId
          );

        }
      );

    });

}