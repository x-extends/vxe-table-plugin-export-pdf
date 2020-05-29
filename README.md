# vxe-table-plugin-export-pdf

[![gitee star](https://gitee.com/xuliangzhan_admin/vxe-table-plugin-export-pdf/badge/star.svg?theme=dark)](https://gitee.com/xuliangzhan_admin/vxe-table-plugin-export-pdf/stargazers)
[![npm version](https://img.shields.io/npm/v/vxe-table-plugin-export-pdf.svg?style=flat-square)](https://www.npmjs.org/package/vxe-table-plugin-export-pdf)
[![npm downloads](https://img.shields.io/npm/dm/vxe-table-plugin-export-pdf.svg?style=flat-square)](http://npm-stat.com/charts.html?package=vxe-table-plugin-export-pdf)
[![gzip size: JS](http://img.badgesize.io/https://unpkg.com/vxe-table-plugin-export-pdf/dist/index.min.js?compression=gzip&label=gzip%20size:%20JS)](https://unpkg.com/vxe-table-plugin-export-pdf/dist/index.min.js)
[![npm license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/xuliangzhan/vxe-table-plugin-export-pdf/blob/master/LICENSE)

基于 [vxe-table](https://github.com/xuliangzhan/vxe-table) 表格的增强插件，支持导出 pdf 格式

## Installing

```shell
npm install xe-utils vxe-table vxe-table-plugin-export-pdf jspdf
```

```javascript
// ...
import VXETablePluginExportPDF from 'vxe-table-plugin-export-pdf'
// ...

VXETable.use(VXETablePluginExportPDF)
```

## Options

| 参数 | 描述 | 默认值 |
|------|------|------|
| fontName | 字体名称 |  |
| fontStyle | 字体的样式 | normal |
| fontUrl | 字体库下载路径 |  |
| beforeMethod | Function({ $pdf, options, columns, datas }) 导出之前触发回调，可以自行设置字体等相关样式 |  |

## Font

| 字体名称 | 描述 |
|------|------|
| SourceHanSans-Bold | 思源雅黑-粗体 |

```javascript
// ...
import VXETablePluginExportPDF from 'vxe-table-plugin-export-pdf'
// ...

VXETablePluginExportPDF.setup({
  fontName: 'SourceHanSans-Bold', // 指定字体
  fontUrl: 'https://cdn.jsdelivr.net/npm/vxe-table-plugin-export-pdf/fonts/source-han-sans-bold.js' // 字体库下载路径，可以将包下载放到自己服务器中
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
  border
  ref="xTable"
  height="600"
  :data="tableData">
  <vxe-table-column type="index" width="60"></vxe-table-column>
  <vxe-table-column field="name" title="Name"></vxe-table-column>
  <vxe-table-column field="age" title="Age"></vxe-table-column>
  <vxe-table-column field="date" title="Date"></vxe-table-column>
</vxe-table>
```

```javascript
export default {
  data () {
    return {
      tableData: [
        {
          id: 100,
          name: 'test',
          age: 26,
          date: null
        }
      ]
    }
  },
  methods: {
    exportEvent() {
      this.$refs.xTable.exportData({
        filename: 'MyExport',
        type: 'pdf'
      })
    }
  }
}
```

## License

MIT License, 2019-present, Xu Liangzhan
