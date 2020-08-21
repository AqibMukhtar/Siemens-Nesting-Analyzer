<template>
  <q-page class="flex flex-center">
    <div>
      <div v-if="showTable">
        <h4 data-shadow="Found Parts" class="head__part">Found Parts</h4>

        <q-linear-progress
          v-if="showDownloadingStatus"
          stripe
          rounded
          size="20px"
          :value="status"
          color="primary"
          class="q-ma-lg"
        >
          <div class="absolute-full flex flex-center">
            <q-badge color="white" text-color="primary" :label="status * 100 + '%'" />
          </div>
        </q-linear-progress>

        <q-table
          class="my-sticky-header-table my-sticky-column-table cursor-pointer"
          :table-style="{width:'95vw !important'}"
          bordered="true"
          :data="data"
          :columns="columns"
          row-key="html"
          hide-bottom
          virtual-scroll
          :pagination.sync="pagination"
          selection="multiple"
          :selected.sync="selected"
        >
          <q-td slot="body-cell-link" slot-scope="props" :props="props">
            <a :href="props.value" style="text-decoration:none">
              <q-icon name="save_alt" class="text-primary" style="font-size: 2.4em;" />
            </a>
          </q-td>
          <q-td slot="body-cell-drawingNumber" slot-scope="props" :props="props">
            <q-list dense class="rounded-borders">
              <q-item clickable v-for="prop in props.value" :key="prop" class="text-center">
                <q-item-section>{{prop}}</q-item-section>
              </q-item>
            </q-list>
          </q-td>
          <q-td slot="body-cell-foundCount" slot-scope="props" :props="props">
            <q-list dense class="rounded-borders">
              <q-item clickable v-for="prop in props.value" :key="prop" class="q-mr-md">
                <q-item-section>{{prop}}</q-item-section>
              </q-item>
            </q-list>
          </q-td>
          <q-td slot="body-cell-requiredCount" slot-scope="props" :props="props">
            <q-list dense class="rounded-borders">
              <q-item clickable v-for="prop in props.value" :key="prop" class="text-center">
                <q-item-section>{{prop}}</q-item-section>
              </q-item>
            </q-list>
          </q-td>
          <q-td slot="body-cell-satisfy" slot-scope="props" :props="props">
            <q-list dense class="rounded-borders">
              <q-item clickable v-for="prop in props.value" :key="prop" class="text-center">
                <q-item-section class="centre d-block text-center">
                  <q-icon
                    :name="prop?'check_circle':'close'"
                    :color="prop?'green':'red'"
                    size="md"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-td>
        </q-table>

        <div class="centre q-my-lg">
          <q-btn color="blue-8" icon="cloud_download" @click="download" />
        </div>

        <h4 data-shadow="Not Found" class="head__part">Not Found</h4>
        <div class="q-pa-md" style="margin:0 35vw 0 35vw">
          <q-list bordered separator>
            <q-item
              v-for="item in notFound"
              :key="item"
              class="bg-deep-purple-1"
              clickable
              v-ripple
            >
              <q-item-section>{{item}}</q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
      <form>
        <div id="browseHTML" class="bottom" v-if="!showTable">
          <label for="searchHTML" class="inputLabel">Browse HTML</label>
          <input
            type="file"
            id="searchHTML"
            class="inputFile"
            ref="searchHTML"
            @change="handleHTMLSearch()"
          />
        </div>
      </form>
      <div id="searchedHTML" v-if="!showTable">
        <p class="fileName">{{fileName}}</p>
      </div>

      <q-table
        v-if="showPreTable"
        class="my-sticky-header-table my-sticky-column-table cursor-pointer"
        :table-style="{width:'95vw !important'}"
        bordered="true"
        :data="preData"
        :columns="preColumns"
        row-key="drawingNumbers"
        hide-bottom
        virtual-scroll
        :pagination.sync="pagination"
      />

      <div id="submitBtn" class="centre q-mt-xl" v-if="!showTable && showPreTable">
        <btn class="inputLabel" @click="searchHTML()">Search</btn>
      </div>
    </div>
  </q-page>
</template>

<script>
import Vue from "vue";
import axios from "axios";
import VueAxios from "vue-axios";

Vue.use(VueAxios, axios);
export default {
  name: "SearchIndex",
  data() {
    return {
      selected: [],
      searchedHTML: "",
      fileName: "",
      showPreTable: false,
      showTable: false,
      showDownloadingStatus: false,
      status: 0,
      preColumns: [
        {
          name: "drawingNumbers",
          align: "center",
          label: "Drawing Numbers",
          field: "drawingNumbers",
        },
        {
          name: "occurences",
          align: "center",
          label: "Occurences",
          field: "occurences",
        },
      ],
      columns: [
        { name: "html", align: "center", label: "HTML", field: "html" },
        {
          name: "drawingNumber",
          align: "center",
          label: "Drawing Number",
          field: "drawingNumber",
        },
        {
          name: "foundCount",
          align: "center",
          label: "Found #",
          field: "foundCount",
        },
        {
          name: "requiredCount",
          align: "center",
          label: "Required #",
          field: "requiredCount",
        },
        {
          name: "satisfy",
          align: "center",
          label: "Satisfy",
          field: "satisfy",
        },

        // { name: 'link', align: 'center', label: 'Download', field: 'link' }
      ],
      data: [],
      preData: [],
      notFound: [],
      pagination: {
        rowsPerPage: 0,
      },
    };
  },
  computed: {},
  methods: {
    handleHTMLSearch() {
      this.searchedHTML = this.$refs.searchHTML.files[0];
      this.fileName = this.$refs.searchHTML.files[0].name;
      this.csvContent = window.analyzeCSV(this.searchedHTML.path);

      let { drawingNumbers, occurences } = this.csvContent;

      for (
        let index = 0;
        index < drawingNumbers.length && index < occurences.length;
        index++
      ) {
        this.preData.push({
          drawingNumbers: drawingNumbers[index],
          occurences: occurences[index],
        });
      }

      this.showPreTable = true;
      console.log(this.preData);
    },
    searchHTML() {
      const searchedData = window.uploadCSV(this.csvContent);
      console.log(searchedData);
      const { data, notFound } = searchedData;
      this.showPreTable = false;
      this.showTable = true;
      this.data = data;
      this.notFound = notFound;
    },

    download() {
      let htmlNames = [],
        downDir = "F:\\Docs";
      this.data.forEach((d) => htmlNames.push(d.html));

      window.downloadHTML(htmlNames, downDir);
      this.showDownloadingStatus = true;
    },

    getSelectedString() {
      return this.selected.length === 0
        ? ""
        : `${this.selected.length} record${
            this.selected.length > 1 ? "s" : ""
          } selected of ${this.data.length}`;
    },

    onSelection({ rows, added, evt }) {
      if (rows.length === 0 || this.$refs.table === 0) {
        return;
      }

      const row = rows[0];
      const filteredSortedRows = this.$refs.table.filteredSortedRows;
      const rowIndex = filteredSortedRows.indexOf(row);
      const lastIndex = this.lastIndex;

      this.lastIndex = rowIndex;
      document.getSelection().removeAllRanges();

      if (this.$q.platform.is.mobile === true) {
        evt = { ctrlKey: true };
      } else if (
        evt !== Object(evt) ||
        (evt.shiftKey !== true && evt.ctrlKey !== true)
      ) {
        this.selected = added === true ? rows : [];

        return;
      }

      const operateSelection =
        added === true
          ? (selRow) => {
              const selectedIndex = this.selected.indexOf(selRow);
              if (selectedIndex === -1) {
                this.selected = this.selected.concat(selRow);
              }
            }
          : (selRow) => {
              const selectedIndex = this.selected.indexOf(selRow);
              if (selectedIndex > -1) {
                this.selected = this.selected
                  .slice(0, selectedIndex)
                  .concat(this.selected.slice(selectedIndex + 1));
              }
            };

      if (lastIndex === null || evt.shiftKey !== true) {
        operateSelection(row);

        return;
      }

      const from = lastIndex < rowIndex ? lastIndex : rowIndex;
      const to = lastIndex < rowIndex ? rowIndex : lastIndex;
      for (let i = from; i <= to; i += 1) {
        operateSelection(filteredSortedRows[i]);
      }
    },
  },
  mounted() {
    window.updateDownloadingStatus = (statusUpdate) => {
      console.log(statusUpdate);
      const { rate } = statusUpdate;
      this.status = rate.success / rate.total;

      if (this.status == 1)
        setTimeout(() => (this.showDownloadingStatus = false), 3000);
    };
  },
};
</script>

<style lang="sass">
@import '../css/search.sass'

</style>
