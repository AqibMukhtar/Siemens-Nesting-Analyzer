<template>
  <q-page class="flex flex-center">
    <div id="container" class="centre">
      <form>
        <div id="browseHTML" class="centre">
          <label for="searchHTML" class="inputLabel">Browse HTML</label>
          <input type="file" id="searchHTML" class="inputFile" ref="searchHTML" v-on:change="handleHTMLSearch()">
        </div>
      </form>
      <div id="searchedHTML" >
        <p class="fileName">
          {{fileName}}
        </p>
      </div>
      <div id="submitBtn" class="centre">
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
      fileName: ''
    }
  },
  methods: {
    handleHTMLSearch () {
      this.searchedHTML = this.$refs.searchHTML.files[0]
      this.fileName = this.$refs.searchHTML.files[0].name
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
