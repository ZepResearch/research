function escapeCsvValue(value) {
  let text = ""

  if (value !== null && value !== undefined) {
    text = typeof value === "object" ? JSON.stringify(value) : String(value)
  }

  // Do not allow submitted data to be treated as a spreadsheet formula in Excel.
  const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text
  return `"${safeText.replace(/"/g, '""')}"`
}

/**
 * Downloads records as a UTF-8 CSV that can be opened directly in Excel.
 * A column can specify a record field or a value(record) callback.
 */
export function downloadCsv({ filename, columns, records }) {
  const headerRow = columns.map(({ header }) => escapeCsvValue(header)).join(",")
  const dataRows = records.map((record) =>
    columns
      .map(({ field, value }) => escapeCsvValue(value ? value(record) : record[field]))
      .join(",")
  )
  const csv = `\uFEFF${[headerRow, ...dataRows].join("\r\n")}`
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
  const link = document.createElement("a")

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
