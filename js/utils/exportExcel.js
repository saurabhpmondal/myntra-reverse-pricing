export function exportToExcel({
  fileName = 'export.xlsx',
  rows = []
}) {

  /*
  -----------------------------------
  EMPTY CHECK
  -----------------------------------
  */

  if (!rows.length) {

    alert(
      'No data available for export'
    );

    return;

  }

  /*
  -----------------------------------
  XLSX CHECK
  -----------------------------------
  */

  const XLSXLib =

    window.XLSX ||

    (typeof XLSX !== 'undefined'
      ? XLSX
      : null);

  if (!XLSXLib) {

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

    XLSXLib.utils.json_to_sheet(
      rows
    );

  /*
  -----------------------------------
  WORKBOOK
  -----------------------------------
  */

  const workbook =

    XLSXLib.utils.book_new();

  XLSXLib.utils.book_append_sheet(

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

  XLSXLib.writeFile(

    workbook,

    fileName

  );

}