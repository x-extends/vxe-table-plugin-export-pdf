# vxe-table-plugin-export-pdf

[![gitee star](https://gitee.com/x-extends/vxe-table-plugin-export-pdf/badge/star.svg?theme=dark)](https://gitee.com/x-extends/vxe-table-plugin-export-pdf/stargazers)
[![npm version](https://img.shields.io/npm/v/vxe-table-plugin-export-pdf.svg?style=flat-square)](https://www.npmjs.com/package/vxe-table-plugin-export-pdf)
[![npm downloads](https://img.shields.io/npm/dm/vxe-table-plugin-export-pdf.svg?style=flat-square)](http://npm-stat.com/charts.html?package=vxe-table-plugin-export-pdf)
[![npm license](https://img.shields.io/github/license/mashape/apistatus.svg)](LICENSE)

基于 [vxe-table](https://www.npmjs.com/package/vxe-table) 的表格插件，支持导出 pdf 格式，基于 [jspdf](https://github.com/MrRio/jsPDF) 实现

## Installing

```shell
npm install xe-utils vxe-table@next vxe-table-plugin-export-pdf@next jspdf
```

```javascript
// ...
import VXETable from 'vxe-table'
import VXETablePluginExportPDF from 'vxe-table-plugin-export-pdf'
// ...

VXETable.use(VXETablePluginExportPDF)
```

## Options

| 属性 | 类型 | 描述 | 默认值 |
|------|------|------|------|
| fontName | String | 设置默认的字体 |  |
| fonts | Array<{fontName, fontUrl}> | 字体映射配置 |  |
| beforeMethod | Function({ $pdf, options, columns, datas }) | 导出之前触发回调，可以自行设置字体等相关样式 |  |

## Font

这里使用开源的 [思源黑体](https://github.com/be5invis/source-han-sans-ttf/releases)  

| 字体名称 | 文件名 |
|------|------|
| SourceHanSans-ExtraLight | [source-han-sans-extralight.js](https://github.com/x-extends/vxe-table-plugin-export-pdf/tree/master/fonts) |
| SourceHanSans-Light | [source-han-sans-light.js](https://github.com/x-extends/vxe-table-plugin-export-pdf/tree/master/fonts) |
| SourceHanSans-Normal | [source-han-sans-normal.js](https://github.com/x-extends/vxe-table-plugin-export-pdf/tree/master/fonts) |
| SourceHanSans-Regular | [source-han-sans-regular.js](https://github.com/x-extends/vxe-table-plugin-export-pdf/tree/master/fonts) |
| SourceHanSans-Medium | [source-han-sans-medium.js](https://github.com/x-extends/vxe-table-plugin-export-pdf/tree/master/fonts) |
| SourceHanSans-Bold | [source-han-sans-bold.js](https://github.com/x-extends/vxe-table-plugin-export-pdf/tree/master/fonts) |
| SourceHanSans-Heavy | [source-han-sans-heavy.js](https://github.com/x-extends/vxe-table-plugin-export-pdf/tree/master/fonts) |

```javascript
// ...
import VXETablePluginExportPDF from 'vxe-table-plugin-export-pdf'
// ...

VXETablePluginExportPDF.setup({
  // Set default font
  fontName: 'SourceHanSans-Normal',
  // Font maps
  fonts: [
    {
      // Font name
      fontName: 'SourceHanSans-Normal',
      // Font library url
      fontUrl: 'https://cdn.jsdelivr.net/npm/vxe-table-plugin-export-pdf/fonts/source-han-sans-normal.js'
    }
  ]
})
```

## Demo

```html
<vxe-toolbar>
  <template v-slot:buttons>
    <vxe-button @click="exportEvent">MyExport.pdf</vxe-button>
  </template>
</vxe-toolbar>

<vxe-table
  ref="xTable"
  height="600"
  :data="tableData">
  <vxe-column type="seq" width="60"></vxe-column>
  <vxe-column field="name" title="Name"></vxe-column>
  <vxe-column field="age" title="Age"></vxe-column>
  <vxe-column field="date" title="Date"></vxe-column>
</vxe-table>
```

```javascript
export default {
  data () {
    return {
      tableData: [
        { id: 100, name: 'test', age: 26, date: null },
        { id: 101, name: 'test1', age: 30, date: null },
        { id: 102, name: 'test2', age: 34, date: null }
      ]
    }
  },
  methods: {
    exportEvent() {
      this.$refs.xTable.exportData({
        filename: 'MyExport',
        type: 'pdf',
        fontName: 'SourceHanSans-Normal' // Set font
      })
    }
  }
}
```

## License

[MIT](LICENSE) © 2019-present, Xu Liangzhan
