import { VXETableCore } from 'vxe-table'

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

/**
 * 基于 vxe-table 表格的扩展插件，支持导出 pdf 格式
 */
export declare const VXETablePluginExportPDF: {
  install (vxetable: VXETableCore, options?: VXETablePluginExportPDFOptions): void
}

export default VXETablePluginExportPDF
