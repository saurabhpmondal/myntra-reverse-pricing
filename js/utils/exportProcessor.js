import {
  createExportJob,
  updateExportJob,
  completeExportJob,
  failExportJob
} from '../services/exportJobService.js';

/* -----------------------------------
PROCESS EXPORT IN BACKGROUND
----------------------------------- */

export async function processExportJob({

  type,

  products,

  rowBuilder

}) {

  const job =
    createExportJob({

      type,

      total:
        products.length

    });

  const exportRows = [];

  let currentIndex = 0;

  /*
  -----------------------------------
  CHUNK SIZE
  -----------------------------------
  */

  const chunkSize = 25;

  /*
  -----------------------------------
  PROCESS CHUNKS
  -----------------------------------
  */

  async function processChunk() {

    try {

      const endIndex =
        Math.min(

          currentIndex +
          chunkSize,

          products.length

        );

      /*
      -----------------------------------
      PROCESS STYLES
      -----------------------------------
      */

      for (
        let i = currentIndex;
        i < endIndex;
        i++
      ) {

        const product =
          products[i];

        try {

          const row =
            rowBuilder(
              product
            );

          if (row) {

            exportRows.push(
              row
            );

          }

        } catch (error) {

          console.error(
            error
          );

        }

      }

      currentIndex =
        endIndex;

      /*
      -----------------------------------
      UPDATE PROGRESS
      -----------------------------------
      */

      const progress =
        Math.floor(

          (
            currentIndex /
            products.length
          ) * 100

        );

      updateExportJob(

        job.id,

        {

          processed:
            currentIndex,

          progress

        }

      );

      /*
      -----------------------------------
      CONTINUE
      -----------------------------------
      */

      if (
        currentIndex <
        products.length
      ) {

        setTimeout(
          processChunk,
          0
        );

        return;

      }

      /*
      -----------------------------------
      COMPLETE
      -----------------------------------
      */

      completeExportJob(

        job.id,

        exportRows

      );

    } catch (error) {

      failExportJob(
        job.id,
        error
      );

    }

  }

  /*
  -----------------------------------
  START
  -----------------------------------
  */

  processChunk();

  return job.id;

}