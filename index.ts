import XEUtils from 'xe-utils'
import { VXETableCore, VxeTableConstructor, VxeTablePropTypes, VxeTableDefines, VxeGlobalInterceptorHandles } from 'vxe-table'
import jsPDF from 'jspdf'

let vxetable: VXETableCore

declare module 'vxe-table' {
  namespace VxeTablePropTypes {
    interface ExportConfig {
      fontName?: string;
    }
  }
}

interface VXETablePluginExportPDFFonts {
  fontName: string;
  fontStyle?: 'normal';
  fontUrl: string;
}

interface VXETablePluginExportPDFOptions {
  fontName?: string;
  fonts?: VXETablePluginExportPDFFonts[];
  beforeMethod?: Function;
}

const globalOptions: VXETablePluginExportPDFOptions = {}
const globalFonts: { [key: string]: any } = {}

function getCellText (cellValue: any) {
  return cellValue || ' '
}

function getFooterCellValue ($table: VxeTableConstructor, opts: VxeTablePropTypes.ExportConfig, rows: any[], column: VxeTableDefines.ColumnInfo) {
  const cellValue = XEUtils.toValueString(rows[$table.getVTColumnIndex(column)])
  return getCellText(cellValue)
}

function getFooterData (opts: VxeTablePropTypes.ExportConfig, footerData: any[][]) {
  const { footerFilterMethod } = opts
  return footerFilterMethod ? footerData.filter((items, index) => footerFilterMethod({ items, $rowIndex: index })) : footerData
}

function exportPDF (params: VxeGlobalInterceptorHandles.InterceptorExportParams) {
  const { modal, t } = vxetable
  const { fonts, beforeMethod } = globalOptions
  const { $table, options, columns, datas } = params
  const { props } = $table
  const { treeConfig } = props
  const { computeTreeOpts } = $table.getComputeMaps()
  const treeOpts = computeTreeOpts.value
  const dX = 7
  const dY = 15.8
  const ratio = 3.78
  const pdfWidth = 210
  let colWidth = 0
  const msgKey = 'pdf'
  const showMsg = options.message !== false
  const { type, filename, isHeader, isFooter, original } = options
  const footList: { [key: string]: any }[] = []
  const headers: any[] = columns.map((column) => {
    const title = XEUtils.toValueString(original ? column.field : column.getTitle())
    const width = column.renderWidth / ratio
    colWidth += width
    return {
      name: column.id,
      prompt: getCellText(title),
      width
    }
  })
  const offsetWidth = (colWidth - Math.floor(pdfWidth + dX * 2 * ratio)) / headers.length
  headers.forEach((column) => {
    column.width = column.width - offsetWidth
  })
  const rowList: any[] = datas.map((row) => {
    const item: any = {}
    columns.forEach((column) => {
      item[column.id] = getCellText(treeConfig && column.treeNode ? (' '.repeat(row._level * treeOpts.indent / 8) + row[column.id]) : row[column.id])
    })
    return item
  })
  if (isFooter) {
    const { footerData } = $table.getTableData()
    const footers = getFooterData(options, footerData)
    footers.forEach(rows => {
      const item: any = {}
      columns.forEach((column) => {
        item[column.id] = getFooterCellValue($table, options, rows, column)
      })
      footList.push(item)
    })
  }
  let fontConf: VXETablePluginExportPDFFonts | null | undefined
  const fontName = options.fontName || globalOptions.fontName
  if (fonts && fontName) {
    fontConf = fonts.find(item => item.fontName === fontName)
  }
  const exportMethod = () => {
    /* eslint-disable new-cap */
    const doc = new jsPDF({ orientation: 'landscape' })
    // 设置字体
    doc.setFontSize(10)
    doc.internal.pageSize.width = pdfWidth
    if (fontConf) {
      const { fontName, fontStyle = 'normal' } = fontConf
      if (globalFonts[fontName]) {
        doc.addFont(fontName + '.ttf', fontName, fontStyle)
        doc.setFont(fontName, fontStyle)
      }
    }
    if (beforeMethod && beforeMethod({ $pdf: doc, $table, options, columns, datas }) === false) {
      return
    }
    if (options.sheetName) {
      const title = XEUtils.toValueString(options.sheetName)
      const textWidth = doc.getTextWidth(title)
      doc.text(title, (pdfWidth - textWidth) / 2, dY / 2 + 2)
    }
    // 转换数据
    doc.table(dX, dY, rowList.concat(footList), headers, {
      printHeaders: isHeader,
      autoSize: false,
      fontSize: 6
    })
    // 导出 pdf
    doc.save(`${filename}.${type}`)
    if (showMsg && modal) {
      modal.close(msgKey)
      modal.message({ content: t('vxe.table.expSuccess'), status: 'success' })
    }
  }
  if (showMsg && modal) {
    modal.message({ id: msgKey, content: t('vxe.table.expLoading'), status: 'loading', duration: -1 })
  }
  checkFont(fontConf).then(() => {
    if (showMsg) {
      setTimeout(exportMethod, 1500)
    } else {
      exportMethod()
    }
  })
}

function checkFont (fontConf?: VXETablePluginExportPDFFonts | null | undefined) {
  if (fontConf) {
    const { fontName, fontUrl } = fontConf
    if (fontUrl && !globalFonts[fontName]) {
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

function handleExportEvent (params: VxeGlobalInterceptorHandles.InterceptorExportParams) {
  if (params.options.type === 'pdf') {
    exportPDF(params)
    return false
  }
}

function pluginSetup (options: VXETablePluginExportPDFOptions) {
  Object.assign(globalOptions, options)
}

/**
 * 基于 vxe-table 表格的增强插件，支持导出 pdf 格式
 */
export const VXETablePluginExportPDF = {
  setup: pluginSetup,
  install (vxetablecore: VXETableCore, options?: VXETablePluginExportPDFOptions) {
    const { setup, interceptor } = vxetablecore

    vxetable = vxetablecore

    setup({
      export: {
        types: {
          pdf: 1
        }
      }
    })
    interceptor.mixin({
      'event.export': handleExportEvent
    })
    if (options) {
      pluginSetup(options)
    }
  }
}

if (typeof window !== 'undefined' && window.VXETable && window.VXETable.use) {
  window.VXETable.use(VXETablePluginExportPDF)
}

export default VXETablePluginExportPDF
