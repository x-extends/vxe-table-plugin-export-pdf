import XEUtils from 'xe-utils/methods/xe-utils'
import VXETable from 'vxe-table/lib/vxe-table'
import jsPDF from 'jspdf'

function exportPDF(params: any) {
  let colWidth: number = 0
  const { $table, options, columns, datas } = params
  const { type, filename, isHeader, isFooter, original, message, footerFilterMethod } = options
  const colHead: any = {}
  const footList: any[] = []
  const headers: any[] = columns.map((column: any) => {
    const title: string = XEUtils.toString(original ? column.property : column.getTitle()) || ' '
    colWidth += column.renderWidth
    if (isHeader) {
      colHead[column.id] = title
    }
    return {
      name: column.id,
      prompt: title,
      width: column.renderWidth
    }
  })
  const colRatio = colWidth / 100
  headers.forEach((column: any) => {
    column.width = Math.floor(column.width / colRatio * 4) - 1
  })
  const rowList: any[] = datas.map((row: any, rowIndex: number) => {
    const item: any = {}
    columns.forEach((column: any, columnIndex: number) => {
      let cellValue
      const property = column.property
      const isIndex = column.type === 'index'
      if (!original || isIndex) {
        cellValue = isIndex ? (column.indexMethod ? column.indexMethod({ row, rowIndex, column, columnIndex }) : rowIndex + 1) : row[column.id]
      } else {
        cellValue = XEUtils.get(row, property)
      }
      item[column.id] = XEUtils.toString(cellValue) || ' '
    })
    return item
  })
  if (isFooter) {
    const footerData: any[] = $table.footerData
    const footers: any[] = footerFilterMethod ? footerData.filter(footerFilterMethod) : footerData
    footers.forEach((rows: any[]) => {
      const item: any = {}
      columns.forEach((column: any) => {
        item[column.id] = XEUtils.toString(rows[$table.getColumnIndex(column)]) || ' '
      })
      footList.push(item)
    })
  }
  // 转换pdf
  const doc = new jsPDF({ putOnlyUsedFonts: true, orientation: 'landscape' });
  doc.table(1, 1, (isHeader ? [colHead] : []).concat(rowList).concat(footList), headers, { printHeaders: false, autoSize: false });
  doc.save(`${filename}.${type}`)
  if (message !== false) {
    $table.$XModal.message({ message: i18n('vxe.table.expSuccess'), status: 'success' })
  }
}

function handleExportEvent(params: any) {
  if (params.options.type === 'pdf') {
    exportPDF(params)
    return false
  }
}

/**
 * 基于 vxe-table 表格的增强插件，支持导出 pdf 格式
 */
export const VXETablePluginExportPDF: any = {
  install(xtable: typeof VXETable) {
    Object.assign(xtable.types, { pdf: 0 })
    xtable.interceptor.mixin({
      'event.export': handleExportEvent
    })
    VXETablePluginExportPDF.t = xtable.t
  }
}

function i18n(key: string) {
  if (VXETablePluginExportPDF.t) {
    return VXETablePluginExportPDF.t(key)
  }
}

if (typeof window !== 'undefined' && window.VXETable) {
  window.VXETable.use(VXETablePluginExportPDF)
}

export default VXETablePluginExportPDF
