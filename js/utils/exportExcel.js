export function exportToExcel({
  fileName = 'export.xlsx',
  rows = []
}) {

  if (!rows.length) {
    return;
  }

  /*
  -----------------------------------
  XLSX CHECK
  -----------------------------------
  */

  if (
    typeof XLSX ===
    'undefined'
  ) {

    alert(
      'XLSX library not loaded'
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
      rows
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
  AUTO WIDTH
  -----------------------------------
  */

  const columnWidths =
    Object.keys(
      rows[0]
    ).map(key => ({

      wch: Math.max(

        key.length,

        ...rows.map(
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
    fileName
  );

}