<template>
  <q-page class="flex flex-center">
    <div>
<div v-if="showTable">
    <q-table
      title="Found Parts"
      class="my-sticky-header-table"
      :table-style="{width:'1200px !important'}"
      bordered="true"
      :data = "data"
      :columns = "columns"
      row-key = "html"
      hide-bottom
      separator = "none"
      virtual-scroll
      :pagination.sync = "pagination"
      selection = "multiple"
      :selected.sync = "selected"
    >
    <q-td slot="body-cell-link" slot-scope="props" :props="props">
        <a :href="props.value" style="text-decoration:none" >
          <q-icon name="save_alt" class="text-primary" style="font-size: 2.4em;" />
        </a>
    </q-td>
    </q-table>

      <h4>Not Found</h4>
    <div class="q-pa-md" style="max-width: 350px">
    <q-list bordered separator class="text-center">
      <q-item v-for="item in notFound" :key="item" class="" clickable v-ripple>
        <q-item-section>{{item}}</q-item-section>
      </q-item>
    </q-list>
  </div>

  </div>
      <form>
        <div id="browseHTML" class="bottom" v-if="!showTable">
          <label for="searchHTML" class="inputLabel">Browse HTML</label>
          <input type="file" id="searchHTML" class="inputFile" ref="searchHTML" @change="handleHTMLSearch()">
        </div>
      </form>
      <div id="searchedHTML" v-if="!showTable" >
        <p class="fileName">
          {{fileName}}
        </p>
      </div>
      <div id="submitBtn" class="centre" v-if="!showTable">
        <btn class="inputLabel" @click="searchHTML()">Search</btn>
      </div>
    </div>
  </q-page>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'

Vue.use(VueAxios, axios)
export default {
  name: 'SearchIndex',
  data () {
    return {
      selected: [],
      searchedHTML: '',
      fileName: '',
      showTable: false,
      columns: [
        { name: 'html', align: 'center', label: 'HTML', field: 'html' },
        { name: 'drawingNumber', align: 'center', label: 'Drawing Number', field: 'drawingNumber' },
        { name: 'foundCount', align: 'center', label: 'Found #', field: 'foundCount' },
        { name: 'requiredCount', align: 'center', label: 'Required #', field: 'requiredCount' },
        { name: 'link', align: 'center', label: 'Download', field: 'link' }
      ],
      data: [
        {
          html: '1000001',
          drawingNumber: '201257888',
          foundCount: 2,
          requiredCount: 2,
          link: 'https://quasarframeework.com'
        },
        {
          html: '2000002',
          drawingNumber: '201257888',
          foundCount: 2,
          requiredCount: 1,
          link: 'https://quasarframeework.com'
        },
        {
          html: '3000003',
          drawingNumber: '201257888',
          foundCount: 2,
          requiredCount: 3,
          link: 'https://quasarframeework.com'
        },
        {
          html: '4000004',
          drawingNumber: '201257888',
          foundCount: 2,
          requiredCount: 2,
          link: 'https://quasarframeework.com'
        },
        {
          html: '5000005',
          drawingNumber: '201257888',
          foundCount: 2,
          requiredCount: 1,
          link: 'https://quasarframeework.com'
        },
        {
          html: '6000006',
          drawingNumber: '201257888',
          foundCount: 2,
          requiredCount: 3,
          link: 'https://quasarframeework.com'
        },
        {
          html: '7000007',
          drawingNumber: '201257888',
          foundCount: 2,
          requiredCount: 2,
          link: 'https://quasarframeework.com'
        },
        {
          html: '8000008',
          drawingNumber: '201257888',
          foundCount: 2,
          requiredCount: 1,
          link: 'https://quasarframeework.com'
        },
        {
          html: '9000009',
          drawingNumber: '201257888',
          foundCount: 2,
          requiredCount: 3,
          link: 'https://quasarframeework.com'
        }
      ],
      notFound: [120345, 120345, 120345],
      pagination: {
        rowsPerPage: 0
      }
    }
  },
  methods: {
    handleHTMLSearch () {
      this.searchedHTML = this.$refs.searchHTML.files[0]
      this.fileName = this.$refs.searchHTML.files[0].name
    },
    searchHTML () {
      this.showTable = true
      const formData = new FormData()
      formData.append('file', this.searchedHTML)
      axios.post('', // url of where we want to POST searchedHTML will come here
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      ).then(function () {
        console.log('SUCCESS!!')
      })
        .catch(function () {
          console.log('FAILURE!!')
        })
    },

    getSelectedString () {
      return this.selected.length === 0 ? '' : `${this.selected.length} record${this.selected.length > 1 ? 's' : ''} selected of ${this.data.length}`
    },

    onSelection ({ rows, added, evt }) {
      if (rows.length === 0 || this.$refs.table === 0) {
        return
      }

      const row = rows[0]
      const filteredSortedRows = this.$refs.table.filteredSortedRows
      const rowIndex = filteredSortedRows.indexOf(row)
      const lastIndex = this.lastIndex

      this.lastIndex = rowIndex
      document.getSelection().removeAllRanges()

      if (this.$q.platform.is.mobile === true) {
        evt = { ctrlKey: true }
      } else if (evt !== Object(evt) || (evt.shiftKey !== true && evt.ctrlKey !== true)) {
        this.selected = added === true ? rows : []

        return
      }

      const operateSelection = added === true
        ? selRow => {
          const selectedIndex = this.selected.indexOf(selRow)
          if (selectedIndex === -1) {
            this.selected = this.selected.concat(selRow)
          }
        }
        : selRow => {
          const selectedIndex = this.selected.indexOf(selRow)
          if (selectedIndex > -1) {
            this.selected = this.selected.slice(0, selectedIndex).concat(this.selected.slice(selectedIndex + 1))
          }
        }

      if (lastIndex === null || evt.shiftKey !== true) {
        operateSelection(row)

        return
      }

      const from = lastIndex < rowIndex ? lastIndex : rowIndex
      const to = lastIndex < rowIndex ? rowIndex : lastIndex
      for (let i = from; i <= to; i += 1) {
        operateSelection(filteredSortedRows[i])
      }
    }
  }
}
</script>

<style scoped>
</style>
