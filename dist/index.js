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
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _xeUtils, _jspdf) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports["default"] = _exports.VXETablePluginExportPDF = void 0;
  _xeUtils = _interopRequireDefault(_xeUtils);
  _jspdf = _interopRequireDefault(_jspdf);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

  /* eslint-disable no-unused-vars */

  /* eslint-enable no-unused-vars */
  var isWin = typeof window !== 'undefined';
  var globalOptions = {};
  var globalFonts = {};

  var _vxetable;

  function getFooterCellValue($table, opts, rows, column) {
    var cellValue = _xeUtils["default"].toString(rows[$table.$getColumnIndex(column)]);

    return cellValue;
  }

  function exportPDF(params) {
    var colWidth = 0;
    var msgKey = 'pdf';
    var fontName = globalOptions.fontName,
        fontUrl = globalOptions.fontUrl;
    var options = params.options,
        columns = params.columns,
        datas = params.datas;
    var showMsg = options.message !== false;
    var $table = params.$table;
    var treeConfig = $table.treeConfig,
        treeOpts = $table.treeOpts;
    var type = options.type,
        filename = options.filename,
        isHeader = options.isHeader,
        isFooter = options.isFooter,
        original = options.original,
        footerFilterMethod = options.footerFilterMethod;
    var footList = [];
    var headers = columns.map(function (column) {
      var title = _xeUtils["default"].toString(original ? column.property : column.getTitle()) || ' ';
      colWidth += column.renderWidth;
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
      rowList = datas.map(function (row) {
        var item = {};
        columns.forEach(function (column) {
          item[column.id] = column.treeNode ? ' '.repeat(row._level * treeOpts.indent / 8) + row[column.id] : row[column.id];
        });
        return item;
      });
    } else {
      rowList = datas;
    }

    if (isFooter) {
      var _$table$getTableData = $table.getTableData(),
          footerData = _$table$getTableData.footerData;

      var footers = footerFilterMethod ? footerData.filter(footerFilterMethod) : footerData;
      footers.forEach(function (rows) {
        var item = {};
        columns.forEach(function (column) {
          item[column.id] = getFooterCellValue($table, options, rows, column);
        });
        footList.push(item);
      });
    }

    var exportMethod = function exportMethod() {
      /* eslint-disable new-cap */
      var doc = new _jspdf["default"]({
        putOnlyUsedFonts: true,
        orientation: 'landscape'
      });

      if (fontName && fontUrl) {
        doc.addFont(fontName + '.ttf', fontName, 'normal');
        doc.setFont(fontName, 'normal');
      }

      doc.table(1, 1, rowList.concat(footList), headers, {
        printHeaders: isHeader,
        autoSize: false
      });
      doc.save("".concat(filename, ".").concat(type));

      if (showMsg) {
        _vxetable.modal.close(msgKey);

        _vxetable.modal.message({
          message: _vxetable.t('vxe.table.expSuccess'),
          status: 'success'
        });
      }
    };

    if (showMsg) {
      _vxetable.modal.message({
        id: msgKey,
        message: _vxetable.t('vxe.table.expLoading'),
        status: 'loading',
        duration: -1
      });
    } // 转换pdf


    checkFont().then(function () {
      if (showMsg) {
        setTimeout(exportMethod, 1000);
      } else {
        exportMethod();
      }
    });
  }

  function checkFont() {
    var fontName = globalOptions.fontName,
        fontUrl = globalOptions.fontUrl;

    if (fontName && fontUrl) {
      if (!globalFonts[fontName]) {
        globalFonts[fontName] = new Promise(function (resolve, reject) {
          var fontScript = document.createElement('script');
          fontScript.src = fontUrl;
          fontScript.type = 'text/javascript';
          fontScript.onload = resolve;
          fontScript.onerror = reject;
          document.body.appendChild(fontScript);
        });
        return globalFonts[fontName];
      }
    }

    return new Promise(function (resolve) {
      return setTimeout(resolve, 1000);
    });
  }

  function handleExportEvent(params) {
    if (params.options.type === 'pdf') {
      exportPDF(params);
      return false;
    }
  }

  function setup(options) {
    var _Object$assign = Object.assign(globalOptions, options),
        fontName = _Object$assign.fontName,
        fontUrl = _Object$assign.fontUrl;

    if (fontName) {
      if (!fontUrl) {
        throw new Error('The fontUrl cannot be empty.');
      }

      if (isWin && !window.jsPDF) {
        window.jsPDF = _jspdf["default"];
      }
    }
  }
  /**
   * 基于 vxe-table 表格的增强插件，支持导出 pdf 格式
   */


  var VXETablePluginExportPDF = {
    setup: setup,
    install: function install(xtable, options) {
      var interceptor = xtable.interceptor;
      _vxetable = xtable;
      Object.assign(xtable.types, {
        pdf: 0
      });
      interceptor.mixin({
        'event.export': handleExportEvent
      });

      if (options) {
        setup(options);
      }
    }
  };
  _exports.VXETablePluginExportPDF = VXETablePluginExportPDF;

  if (isWin && window.VXETable) {
    window.VXETable.use(VXETablePluginExportPDF);
  }

  var _default = VXETablePluginExportPDF;
  _exports["default"] = _default;
});