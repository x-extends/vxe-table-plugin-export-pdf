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

const isWin = typeof window !== 'undefined'
const globalOptions: VXETablePluginExportPDFOptions = {}
const globalFonts: { [key: string]: any } = {}
let _vxetable: typeof VXETable

function getFooterCellValue ($table: Table, opts: ExportOptons, rows: any[], column: ColumnConfig) {
  const cellValue = XEUtils.toString(rows[$table.$getColumnIndex(column)])
  return cellValue
}

function exportPDF (params: InterceptorExportParams) {
  let colWidth = 0
  const msgKey = 'pdf'
  const { fontName, fontStyle = 'normal', beforeMethod } = globalOptions
  const { options, columns, datas } = params
  const showMsg = options.message !== false
  const $table: any = params.$table
  const { treeConfig, treeOpts } = $table
  const { type, filename, isHeader, isFooter, original, footerFilterMethod } = options
  const footList: { [key: string]: any }[] = []
  const headers: { [key: string]: any }[] = columns.map((column) => {
    const title = XEUtils.toString(original ? column.property : column.getTitle()) || ' '
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
      const item: { [key: string]: any } = {}
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
      const item: { [key: string]: any } = {}
      columns.forEach((column) => {
        item[column.id] = getFooterCellValue($table, options, rows, column)
      })
      footList.push(item)
    })
  }
  const exportMethod = () => {
    /* eslint-disable new-cap */
    const doc = new jsPDF({ putOnlyUsedFonts: true, orientation: 'landscape' })
    // 设置字体
    if (fontName && globalFonts[fontName]) {
      doc.addFont(fontName + '.ttf', fontName, fontStyle)
      doc.setFont(fontName, fontStyle)
    }
    // 导出之前
    if (beforeMethod && beforeMethod({ $pdf: doc, $table, options, columns, datas }) === false) {
      return
    }
    // 转换数据
    doc.table(1, 1, rowList.concat(footList), headers, { printHeaders: isHeader, autoSize: false })
    // 导出 pdf
    doc.save(`${filename}.${type}`)
    if (showMsg) {
      _vxetable.modal.close(msgKey)
      _vxetable.modal.message({ message: _vxetable.t('vxe.table.expSuccess'), status: 'success' })
    }
  }
  if (showMsg) {
    _vxetable.modal.message({ id: msgKey, message: _vxetable.t('vxe.table.expLoading'), status: 'loading', duration: -1 })
  }
  checkFont().then(() => {
    if (showMsg) {
      setTimeout(exportMethod, 1500)
    } else {
      exportMethod()
    }
  })
}

function checkFont () {
  const { fontName, fontUrl } = globalOptions
  if (fontName && fontUrl) {
    if (!globalFonts[fontName]) {
      globalFonts[fontName] = new Promise((resolve, reject) => {
        const fontScript = document.createElement('script')
        fontScript.src = fontUrl
        fontScript.type = 'text/javascript'
        fontScript.onload = resolve
        fontScript.onerror = reject
        document.body.appendChild(fontScript)
      })
      return globalFonts[fontName]
    }
  }
  return Promise.resolve()
}

function handleExportEvent (params: InterceptorExportParams) {
  if (params.options.type === 'pdf') {
    exportPDF(params)
    return false
  }
}

interface VXETablePluginExportPDFOptions {
  fontName?: 'SourceHanSans-Bold';
  fontStyle?: 'normal';
  fontUrl?: string;
  beforeMethod?: Function;
}

function setup (options: VXETablePluginExportPDFOptions) {
  const { fontName, fontUrl } = Object.assign(globalOptions, options)
  if (fontName) {
    if (!fontUrl) {
      throw new Error('The fontUrl cannot be empty.')
    }
    if (isWin && !window.jsPDF) {
      window.jsPDF = jsPDF
    }
  }
}

declare global {
  interface Window {
    jsPDF: any;
  }
}

/**
 * 基于 vxe-table 表格的增强插件，支持导出 pdf 格式
 */
export const VXETablePluginExportPDF = {
  setup,
  install (xtable: typeof VXETable, options?: VXETablePluginExportPDFOptions) {
    const { interceptor } = xtable
    _vxetable = xtable
    Object.assign(xtable.types, { pdf: 0 })
    interceptor.mixin({
      'event.export': handleExportEvent
    })
    if (options) {
      setup(options)
    }
  }
}

if (isWin && window.VXETable) {
  window.VXETable.use(VXETablePluginExportPDF)
}

export default VXETablePluginExportPDF
