import XEUtils from 'xe-utils'
import type { VXETableCore, VxeTableConstructor, VxeTablePropTypes, VxeTableDefines, VxeGlobalInterceptorHandles } from 'vxe-table'
import type jsPDF from 'jspdf'

let globalVxetable: VXETableCore
let globalJsPDF: any

declare module 'vxe-table' {
  export namespace VxeTablePropTypes {
    export interface ExportConfig {
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
  jsPDF?: any
  fontName?: string;
  fonts?: VXETablePluginExportPDFFonts[];
  beforeMethod?: Function;
}

const globalOptions: VXETablePluginExportPDFOptions = {}
const globalFonts: { [key: string]: any } = {}

function getCellText (cellValue: any) {
  return cellValue || ' '
}

function getFooterCellValue ($xeTable: VxeTableConstructor, opts: VxeTablePropTypes.ExportConfig, row: any, column: VxeTableDefines.ColumnInfo) {
  const _columnIndex = $xeTable.getVTColumnIndex(column)
  // 兼容老模式
  if (XEUtils.isArray(row)) {
    return getCellText(row[_columnIndex])
  }
  return getCellText(XEUtils.get(row, column.field))
}

function getFooterData (opts: VxeTablePropTypes.ExportConfig, footerData: any[][]) {
  const { footerFilterMethod } = opts
  return footerFilterMethod ? footerData.filter((items, index) => footerFilterMethod({ items, $rowIndex: index })) : footerData
}

function exportPDF (params: VxeGlobalInterceptorHandles.InterceptorExportParams) {
  const { modal, t } = globalVxetable
  const { fonts, beforeMethod } = globalOptions
  const { $table, options, columns, datas } = params
  const { props } = $table
  const { treeConfig } = props
  const { computeColumnOpts, computeTreeOpts } = $table.getComputeMaps()
  const treeOpts = computeTreeOpts.value
  const columnOpts = computeColumnOpts.value
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
    const headExportMethod = (column as any).headerExportMethod || (columnOpts as any).headerExportMethod
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
  if (fonts) {
    if (fontName) {
      fontConf = fonts.find(item => item.fontName === fontName)
    }
    if (!fontConf) {
      fontConf = fonts[0]
    }
  }
  const exportMethod = () => {
    /* eslint-disable new-cap */
    const doc: jsPDF = new (globalJsPDF || ((window as any).jspdf ? (window as any).jspdf.jsPDF : (window as any).jsPDF))({ orientation: 'landscape' })
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
 * 基于 vxe-table 表格的扩展插件，支持导出 pdf 格式
 */
export const VXETablePluginExportPDF = {
  config: pluginSetup,
  install (vxetable: VXETableCore, options?: VXETablePluginExportPDFOptions) {
    // 检查版本
    if (!/^(4)\./.test(vxetable.version) && !/v4/i.test((vxetable as any).v)) {
      console.error('[vxe-table-plugin-export-pdf 4.x] Version vxe-table 4.x is required')
    }

    globalVxetable = vxetable
    globalJsPDF = options ? options.jsPDF : null

    const setConfig = vxetable.setConfig || vxetable.config
    setConfig({
      table: {
        exportConfig: {
          _typeMaps: {
            pdf: 1
          }
        } as any
      },
      // 兼容老版本
      export: {
        types: {
          pdf: 1
        }
      } as any
    })
    vxetable.interceptor.mixin({
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
