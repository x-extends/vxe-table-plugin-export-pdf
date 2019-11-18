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
import Vue from 'vue'
import VXETable from 'vxe-table'
import VXETablePluginExportPDF from 'vxe-table-plugin-export-pdf'

Vue.use(VXETable)
VXETable.use(VXETablePluginExportPDF)
```

## Demo

```html
<vxe-toolbar>
  <template v-slot:buttons>
    <vxe-button @click="exportEvent">export.pdf</vxe-button>
  </template>
</vxe-toolbar>

<vxe-table
  border
  ref="xTable"
  height="600"
  :data="tableData">
  <vxe-table-column type="index" width="60"></vxe-table-column>
  <vxe-table-column prop="name" label="Name"></vxe-table-column>
  <vxe-table-column prop="age" label="Age"></vxe-table-column>
  <vxe-table-column prop="date" label="Date"></vxe-table-column>
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
        filename: 'export',
        type: 'pdf'
      })
    }
  }
}
```

## License

MIT License, 2019-present, Xu Liangzhan
