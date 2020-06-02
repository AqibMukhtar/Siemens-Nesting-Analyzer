<template>
  <q-page class="flex flex-center">
    <div>
<div v-if="showTable">
    <h6 class="label">IDENTIFIED HTMLs</h6>
    <q-table
      class="my-sticky-header-table"
      :data="data"
      :columns="columns"
      row-key="name"
      hide-bottom
      separator="none"
      virtual-scroll
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
    />
  </div>
      <form>
        <div id="browseHTML" class="bottom" v-if="!showTable">
          <label for="searchHTML" class="inputLabel">Browse HTML</label>
          <input type="file" id="searchHTML" class="inputFile" ref="searchHTML" v-on:change="handleHTMLSearch()">
        </div>
      </form>
      <div id="submitBtn" class="bottom" v-if="showTable">
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
      searchedHTML: '',
      fileName: '',
      showTable: false,
      columns: [
        { name: 'PartNo', align: 'center', label: 'PartNo', field: 'PartNo' },
        { name: 'Count', align: 'center', label: 'Count', field: 'Count' }
      ],
      data: [
        {
          PartNo: '1000001',
          Count: 2
        },
        {
          PartNo: '2000002',
          Count: 1
        },
        {
          PartNo: '3000003',
          Count: 3
        },
        {
          PartNo: '1000001',
          Count: 2
        },
        {
          PartNo: '2000002',
          Count: 1
        },
        {
          PartNo: '3000003',
          Count: 3
        },
        {
          PartNo: '1000001',
          Count: 2
        },
        {
          PartNo: '2000002',
          Count: 1
        },
        {
          PartNo: '3000003',
          Count: 3
        },
        {
          PartNo: '1000001',
          Count: 2
        },
        {
          PartNo: '2000002',
          Count: 1
        },
        {
          PartNo: '3000003',
          Count: 3
        }
      ],
      pagination: {
        rowsPerPage: 0
      }
    }
  },
  methods: {
    handleHTMLSearch () {
      this.searchedHTML = this.$refs.searchHTML.files[0]
      this.fileName = this.$refs.searchHTML.files[0].name
      this.showTable = true
    },
    searchHTML () {
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
    }
  }
}
</script>
