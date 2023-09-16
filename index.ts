import XEUtils from 'xe-utils'
import {
  VXETable,
  Table,
  InterceptorExportParams,
  ColumnConfig,
  TableExportConfig
} from 'vxe-table'
import jsPDF from 'jspdf'

const isWin = typeof window !== 'undefined'
const globalOptions: VXETablePluginExportPDFOptions = {}
const globalFonts: { [key: string]: any } = {}

function getCellText (cellValue: any) {
  return cellValue || ' '
}

function getFooterCellValue ($table: Table, opts: TableExportConfig, rows: any[], column: ColumnConfig) {
  const cellValue = XEUtils.toValueString(rows[$table.$getColumnIndex(column)])
  return getCellText(cellValue)
}

function getFooterData (opts: TableExportConfig, footerData: any[][]) {
  const { footerFilterMethod } = opts
  return footerFilterMethod ? footerData.filter((items, index) => footerFilterMethod({ items, $rowIndex: index })) : footerData
}

function exportPDF (params: InterceptorExportParams) {
  const { fonts, beforeMethod } = globalOptions
  const { $table, options, columns, datas } = params
  const { $vxe, treeConfig, treeOpts, columnOpts } = $table
  const { modal, t } = $vxe
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
    const { id, field, renderWidth } = column
    const headExportMethod = column.headerExportMethod || columnOpts.headerExportMethod
    const title = headExportMethod ? headExportMethod({ column, options, $table }) : (XEUtils.toValueString(original ? field : column.getTitle()))
    const width = renderWidth / ratio
    colWidth += width
    return {
      name: id,
      prompt: getCellText(title),
      width
    }
  })
  const offsetWidth = (colWidth - Math.floor(pdfWidth + dX * 2 * ratio)) / headers.length
  headers.forEach((column) => {
    column.width = column.width - offsetWidth
  })
  const rowList: { [key: string]: any }[] = datas.map((row) => {
    const item: { [key: string]: any } = {}
    columns.forEach((column) => {
      item[column.id] = getCellText(treeConfig && column.treeNode ? (' '.repeat(row._level * treeOpts.indent / 8) + row[column.id]) : row[column.id])
    })
    return item
  })
  if (isFooter) {
    const { footerData } = $table.getTableData()
    const footers = getFooterData(options, footerData)
    footers.forEach(rows => {
      const item: { [key: string]: any } = {}
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
      doc.text(XEUtils.toValueString(title), (pdfWidth - textWidth) / 2, dY / 2 + 2)
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
      modal.message({ content: t('vxe.table.expSuccess') as string, status: 'success' })
    }
  }
  if (showMsg && modal) {
    modal.message({ id: msgKey, content: t('vxe.table.expLoading') as string, status: 'loading', duration: -1 })
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

function handleExportEvent (params: InterceptorExportParams) {
  if (params.options.type === 'pdf') {
    exportPDF(params)
    return false
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

declare global {
  interface Window {
    jspdf: any;
    jsPDF: any;
  }
}

function pluginSetup (options: VXETablePluginExportPDFOptions) {
  const { fonts } = Object.assign(globalOptions, options)
  if (fonts) {
    if (isWin) {
      if (!window.jsPDF) {
        window.jsPDF = window.jspdf ? window.jspdf.jsPDF : jsPDF
      }
    }
  }
}

/**
 * 基于 vxe-table 表格的增强插件，支持导出 pdf 格式
 */
export const VXETablePluginExportPDF = {
  setup: pluginSetup,
  install (vxetable: typeof VXETable, options?: VXETablePluginExportPDFOptions) {
    // 检查版本
    if (!/^(2|3)\./.test(vxetable.version)) {
      console.error('[vxe-table-plugin-export-pdf] Version vxe-table 3.x is required')
    }

    vxetable.setup({
      export: {
        types: {
          pdf: 1
        }
      }
    })
    vxetable.interceptor.mixin({
      'event.export': handleExportEvent
    })
    if (options) {
      pluginSetup(options)
    }
  }
}

if (isWin && window.VXETable && window.VXETable.use) {
  window.VXETable.use(VXETablePluginExportPDF)
}

export default VXETablePluginExportPDF
