/* eslint-disable no-unused-vars */
import XEUtils from 'xe-utils/methods/xe-utils'
import {
  VXETable,
  Table,
  InterceptorExportParams,
  ColumnConfig,
  ExportOptons
} from 'vxe-table/lib/vxe-table'
import jsPDF from 'jspdf'
/* eslint-enable no-unused-vars */

let _vxetable: typeof VXETable

function getFooterCellValue ($table: Table, opts: ExportOptons, rows: any[], column: ColumnConfig) {
  var cellValue = XEUtils.toString(rows[$table.$getColumnIndex(column)])
  return cellValue
}

function exportPDF (params: InterceptorExportParams) {
  let colWidth: number = 0
  const { options, columns, datas } = params
  const $table: any = params.$table
  const { treeConfig, treeOpts } = $table
  const { type, filename, isHeader, isFooter, original, message, footerFilterMethod } = options
  const footList: { [key: string]: any }[] = []
  const headers: { [key: string]: any }[] = columns.map((column) => {
    const title: string = XEUtils.toString(original ? column.property : column.getTitle()) || ' '
    colWidth += column.renderWidth
    return {
      name: column.id,
      prompt: title,
      width: column.renderWidth
    }
  })
  let rowList: { [key: string]: any }[] = []
  const colRatio = colWidth / 100
  headers.forEach((column) => {
    column.width = Math.floor(column.width / colRatio * 4) - 1
  })
  if (treeConfig) {
    rowList = datas.map((row) => {
      const item: any = {}
      columns.forEach((column) => {
        item[column.id] = column.treeNode ? (' '.repeat(row._level * treeOpts.indent / 8) + row[column.id]) : row[column.id]
      })
      return item
    })
  } else {
    rowList = datas
  }
  if (isFooter) {
    const { footerData } = $table.getTableData()
    const footers = footerFilterMethod ? footerData.filter(footerFilterMethod) : footerData
    footers.forEach((rows: any[]) => {
      const item: any = {}
      columns.forEach((column) => {
        item[column.id] = getFooterCellValue($table, options, rows, column)
      })
      footList.push(item)
    })
  }
  // 转换pdf
  /* eslint-disable new-cap */
  const doc = new jsPDF({ putOnlyUsedFonts: true, orientation: 'landscape' })
  doc.table(1, 1, rowList.concat(footList), headers, { printHeaders: isHeader, autoSize: false })
  doc.save(`${filename}.${type}`)
  if (message !== false) {
    _vxetable.modal.message({ message: _vxetable.t('vxe.table.expSuccess'), status: 'success' })
  }
}

function handleExportEvent (params: InterceptorExportParams) {
  if (params.options.type === 'pdf') {
    exportPDF(params)
    return false
  }
}

/**
 * 基于 vxe-table 表格的增强插件，支持导出 pdf 格式
 */
export const VXETablePluginExportPDF = {
  install (xtable: typeof VXETable) {
    const { interceptor } = xtable
    _vxetable = xtable
    Object.assign(xtable.types, { pdf: 0 })
    interceptor.mixin({
      'event.export': handleExportEvent
    })
  }
}

if (typeof window !== 'undefined' && window.VXETable) {
  window.VXETable.use(VXETablePluginExportPDF)
}

export default VXETablePluginExportPDF
