/* -----------------------------------
GLOBAL EXPORT JOB STORE
----------------------------------- */

if (!window.exportJobs) {

  window.exportJobs = [];

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

    createdAt:
      new Date()
        .toISOString(),

    fileName:
      `${type}_${Date.now()}.xlsx`

  };

  window.exportJobs.unshift(
    job
  );

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

  job.rows = rows;

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

  const worksheet =
    XLSX.utils.json_to_sheet(
      job.rows
    );

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(

    workbook,
    worksheet,
    'Export'

  );

  XLSX.writeFile(
    workbook,
    job.fileName
  );

}