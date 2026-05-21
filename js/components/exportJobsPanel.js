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
        margin-top:10px;
      "
    >

      <div
        style="
          width:${progress}%;
          height:100%;
          background:#111827;
          transition:width .25s ease;
        "
      >

      </div>

    </div>

  `;

}

/* -----------------------------------
JOB CARD
----------------------------------- */

function renderJobCard(
  job
) {

  return `

    <div
      style="
        border:1px solid #e5e7eb;
        border-radius:14px;
        padding:16px;
        background:#fff;
      "
    >

      <div
        style="
          display:flex;
          justify-content:space-between;
          align-items:flex-start;
          gap:16px;
          flex-wrap:wrap;
        "
      >

        <div
          style="
            flex:1;
            min-width:220px;
          "
        >

          <div
            style="
              font-size:15px;
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
              margin-bottom:4px;
            "
          >

            ${job.processed}
            /
            ${job.total}
            styles processed

          </div>

          <div
            style="
              font-size:12px;
              color:#9ca3af;
            "
          >

            ${job.progress}% complete

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
        job.error

          ? `

            <div
              style="
                margin-top:10px;
                color:#dc2626;
                font-size:12px;
              "
            >

              ${job.error}

            </div>

          `

          : ''
      }

    </div>

  `;

}

/* -----------------------------------
PANEL HTML
----------------------------------- */

export function renderExportJobsPanel() {

  return `

    <div
      class="summary-card"
      id="exportJobsPanel"
      style="
        margin-bottom:20px;
      "
    >

      <div
        style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:16px;
          margin-bottom:20px;
          flex-wrap:wrap;
        "
      >

        <div
          style="
            font-size:16px;
            font-weight:700;
          "
        >

          Export Jobs

        </div>

      </div>

      <div
        id="exportJobsList"
        style="
          display:flex;
          flex-direction:column;
          gap:14px;
        "
      >

      </div>

    </div>

  `;

}

/* -----------------------------------
RENDER LIST
----------------------------------- */

export function refreshExportJobsPanel() {

  const container =
    document.getElementById(
      'exportJobsList'
    );

  if (!container) {
    return;
  }

  const jobs =
    getExportJobs();

  if (!jobs.length) {

    container.innerHTML = `

      <div
        style="
          color:#6b7280;
          font-size:13px;
        "
      >

        No export jobs yet

      </div>

    `;

    return;

  }

  container.innerHTML =
    jobs.map(
      renderJobCard
    ).join('');

  /*
  -----------------------------------
  DOWNLOAD EVENTS
  -----------------------------------
  */

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

/* -----------------------------------
INITIALIZE
----------------------------------- */

export function initializeExportJobsPanel() {

  refreshExportJobsPanel();

  /*
  -----------------------------------
  LIVE UPDATE
  -----------------------------------
  */

  window.addEventListener(

    'export-jobs-updated',

    () => {

      refreshExportJobsPanel();

    }

  );

}