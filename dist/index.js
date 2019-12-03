(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define("vxe-table-plugin-export-pdf", ["exports", "xe-utils", "jspdf"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("xe-utils"), require("jspdf"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.XEUtils, global.jsPDF);
    global.VXETablePluginExportPDF = mod.exports.default;
  }
})(this, function (_exports, _xeUtils, _jspdf) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports["default"] = _exports.VXETablePluginExportPDF = void 0;
  _xeUtils = _interopRequireDefault(_xeUtils);
  _jspdf = _interopRequireDefault(_jspdf);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

  function exportPDF(params) {
    var colWidth = 0;
    var $table = params.$table,
        options = params.options,
        columns = params.columns,
        datas = params.datas;
    var treeConfig = $table.treeConfig,
        tableFullData = $table.tableFullData;
    var type = options.type,
        filename = options.filename,
        isHeader = options.isHeader,
        isFooter = options.isFooter,
        original = options.original,
        data = options.data,
        message = options.message,
        footerFilterMethod = options.footerFilterMethod;
    var colHead = {};
    var footList = [];
    var headers = columns.map(function (column) {
      var title = _xeUtils["default"].toString(original ? column.property : column.getTitle()) || ' ';
      colWidth += column.renderWidth;

      if (isHeader) {
        colHead[column.id] = title;
      }

      return {
        name: column.id,
        prompt: title,
        width: column.renderWidth
      };
    });
    var rowList = [];
    var colRatio = colWidth / 100;
    headers.forEach(function (column) {
      column.width = Math.floor(column.width / colRatio * 4) - 1;
    });

    if (treeConfig) {
      _xeUtils["default"].eachTree(data ? datas : tableFullData, function (row, rowIndex, items, path, parent, nodes) {
        var item = {};
        columns.forEach(function (column, columnIndex) {
          var cellValue;
          var property = column.property;
          var isIndex = column.type === 'index';

          if (!original || isIndex) {
            cellValue = isIndex ? column.indexMethod ? column.indexMethod({
              row: row,
              rowIndex: rowIndex,
              column: column,
              columnIndex: columnIndex
            }) : rowIndex + 1 : row[column.id];
          } else {
            cellValue = _xeUtils["default"].get(row, property);
          }

          if (treeConfig && column.treeNode) {
            cellValue = ' '.repeat((nodes.length - 1) * (treeConfig.indent || 16) / 8) + cellValue;
          }

          item[column.id] = _xeUtils["default"].toString(cellValue) || ' ';
        });
        rowList.push(item);
      });
    } else {
      datas.forEach(function (row, rowIndex) {
        var item = {};
        columns.forEach(function (column, columnIndex) {
          var cellValue;
          var property = column.property;
          var isIndex = column.type === 'index';

          if (!original || isIndex) {
            cellValue = isIndex ? column.indexMethod ? column.indexMethod({
              row: row,
              rowIndex: rowIndex,
              column: column,
              columnIndex: columnIndex
            }) : rowIndex + 1 : row[column.id];
          } else {
            cellValue = _xeUtils["default"].get(row, property);
          }

          item[column.id] = _xeUtils["default"].toString(cellValue) || ' ';
        });
        rowList.push(item);
      });
    }

    if (isFooter) {
      var footerData = $table.footerData;
      var footers = footerFilterMethod ? footerData.filter(footerFilterMethod) : footerData;
      footers.forEach(function (rows) {
        var item = {};
        columns.forEach(function (column) {
          item[column.id] = _xeUtils["default"].toString(rows[$table.$getColumnIndex(column)]) || ' ';
        });
        footList.push(item);
      });
    } // 转换pdf


    var doc = new _jspdf["default"]({
      putOnlyUsedFonts: true,
      orientation: 'landscape'
    });
    doc.table(1, 1, (isHeader ? [colHead] : []).concat(rowList).concat(footList), headers, {
      printHeaders: false,
      autoSize: false
    });
    doc.save("".concat(filename, ".").concat(type));

    if (message !== false) {
      $table.$XModal.message({
        message: i18n('vxe.table.expSuccess'),
        status: 'success'
      });
    }
  }

  function handleExportEvent(params) {
    if (params.options.type === 'pdf') {
      exportPDF(params);
      return false;
    }
  }
  /**
   * 基于 vxe-table 表格的增强插件，支持导出 pdf 格式
   */


  var VXETablePluginExportPDF = {
    install: function install(xtable) {
      Object.assign(xtable.types, {
        pdf: 0
      });
      xtable.interceptor.mixin({
        'event.export': handleExportEvent
      });
      VXETablePluginExportPDF.t = xtable.t;
    }
  };
  _exports.VXETablePluginExportPDF = VXETablePluginExportPDF;

  function i18n(key) {
    if (VXETablePluginExportPDF.t) {
      return VXETablePluginExportPDF.t(key);
    }
  }

  if (typeof window !== 'undefined' && window.VXETable) {
    window.VXETable.use(VXETablePluginExportPDF);
  }

  var _default = VXETablePluginExportPDF;
  _exports["default"] = _default;
});