/* -----------------------------------
GLOBAL STORE
----------------------------------- */

if (!window.exportJobs) {

  window.exportJobs = [];

}

/* -----------------------------------
NOTIFY UI
----------------------------------- */

function notifyExportListeners() {

  window.dispatchEvent(
    new CustomEvent(
      'export-jobs-updated'
    )
  );

}

/* -----------------------------------
CREATE JOB
----------------------------------- */

export function createExportJob({
  type,
  total
}) {

  const job = {

    id:
      `JOB-${Date.now()}`,

    type,

    status:
      'PROCESSING',

    progress: 0,

    processed: 0,

    total,

    rows: [],

    error: null,

    createdAt:
      new Date()
        .toISOString(),

    fileName:
      `${type}_${Date.now()}.xlsx`

  };

  window.exportJobs.unshift(
    job
  );

  notifyExportListeners();

  return job;

}

/* -----------------------------------
UPDATE JOB
----------------------------------- */

export function updateExportJob(
  jobId,
  updates
) {

  const job =
    window.exportJobs.find(
      item =>
        item.id === jobId
    );

  if (!job) {
    return;
  }

  Object.assign(
    job,
    updates
  );

  notifyExportListeners();

}

/* -----------------------------------
COMPLETE JOB
----------------------------------- */

export function completeExportJob(
  jobId,
  rows
) {

  const job =
    window.exportJobs.find(
      item =>
        item.id === jobId
    );

  if (!job) {
    return;
  }

  job.status =
    'COMPLETED';

  job.progress = 100;

  job.processed =
    job.total;

  job.rows = rows;

  notifyExportListeners();

}

/* -----------------------------------
FAIL JOB
----------------------------------- */

export function failExportJob(
  jobId,
  error
) {

  const job =
    window.exportJobs.find(
      item =>
        item.id === jobId
    );

  if (!job) {
    return;
  }

  job.status =
    'FAILED';

  job.error =
    error?.message ||
    'Unknown Error';

  notifyExportListeners();

}

/* -----------------------------------
GET JOBS
----------------------------------- */

export function getExportJobs() {

  return (
    window.exportJobs || []
  );

}

/* -----------------------------------
DOWNLOAD JOB
----------------------------------- */

export function downloadExportJob(
  jobId
) {

  const job =
    window.exportJobs.find(
      item =>
        item.id === jobId
    );

  if (!job) {
    return;
  }

  if (
    !job.rows?.length
  ) {

    alert(
      'Export not ready'
    );

    return;

  }

  if (
    typeof XLSX ===
    'undefined'
  ) {

    alert(
      'XLSX library missing'
    );

    return;

  }

  /*
  -----------------------------------
  WORKSHEET
  -----------------------------------
  */

  const worksheet =
    XLSX.utils.json_to_sheet(
      job.rows
    );

  /*
  -----------------------------------
  WORKBOOK
  -----------------------------------
  */

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(

    workbook,
    worksheet,
    'Export'

  );

  /*
  -----------------------------------
  COLUMN WIDTH
  -----------------------------------
  */

  const columnWidths =
    Object.keys(
      job.rows[0]
    ).map(key => ({

      wch: Math.max(

        key.length,

        ...job.rows.map(
          row =>

            String(
              row[key] || ''
            ).length
        )

      ) + 4

    }));

  worksheet['!cols'] =
    columnWidths;

  /*
  -----------------------------------
  DOWNLOAD
  -----------------------------------
  */

  XLSX.writeFile(
    workbook,
    job.fileName
  );

}