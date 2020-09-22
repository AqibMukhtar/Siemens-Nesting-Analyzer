<template>
  <q-page class="flex flex-center q-ma-md">
    <div id="container" class="centre toggleOnHover">
      <q-linear-progress
          v-if="showUploadingStatus"
          :stripe="isUploading?true:false"
          rounded
          size="20px"
          :value="status"
          :color="isUploading?'primary':'secondary'"
          class="q-my-lg"
        >
          <div class="absolute-full flex flex-center">
            <q-badge color="white" :text-color="isUploading?'primary':'secondary'" :label="Math.round((status * 100)*10)/10 + '%'" />
          </div>
        </q-linear-progress>

      <q-file
        filled
        bottom-slots
        :value="files"
        @input="updateFiles"
        class="bg-grey-2 cursor-pointer"
        label="Upload Html"
        style="min-width: 300px"
        counter
        multiple
        :clearable="!isUploading"
        accept=".htm, .html"
      >
        <template v-slot:prepend>
          <q-icon name="attach_file" @click.stop/>
        </template>
        <template v-slot:file="{ index, file }">
          <q-chip
            class="full-width q-my-xs"
            square
            @remove="cancelFile(index)"
          >

            <q-avatar>
              <q-icon :name="uploadProgress[index].icon" />
            </q-avatar>

            <div class="ellipsis relative-position">{{ file.name }}</div>

            <q-tooltip>{{ file.name }}</q-tooltip>
          </q-chip>
        </template>

        <template v-slot:after v-if="canUpload">
          <q-btn
            color="primary"
            dense
            icon="cloud_upload"
            round
            @click="upload"
            :disable="!canUpload"
            :loading="isUploading"
            size="1.2rem"
            class="q-mx-sm justify-center q-my-auto"
          />
        </template>
      </q-file>

     <div class="errorMessage q-mt-lg">
        <h6 v-if="uploadErrorMessage">{{uploadErrorMessage}}</h6>

        <q-list v-if="invalidFiles.length>1" class="rounded-borders bordered">
          <h6>Some files couldn't be uploaded. May be you have already uploaded these files</h6>
          <q-item v-for="(file,order) in invalidFiles" :key="order" clickable v-ripple class="text-center bg-grey-4">
            <q-item-section class="centre d-block text-center">
              {{file}}
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  name: "UploadIndex",

  data() {
    return {
      files: null,
      uploadProgress: [],
      uploading: null,
      showUploadingStatus: false,
      status: 0,
      uploadErrorMessage: '',
      invalidFiles: [],
    };
  },

  computed: {
    isUploading() {
      return this.uploading !== null;
    },

    canUpload() {
      return this.files !== null;
    },
  },

  methods: {
    cancelFile(index) {
      this.uploadProgress[index] = {
        ...this.uploadProgress[index],
        error: true,
        color: "orange-2",
      };
      this.files= null;
    },

    updateFiles(files) {
      this.files = files;
      this.invalidFiles = [];
      this.uploadErrorMessage = '';
      this.showUploadingStatus = false;
      this.status = 0;

      this.uploadProgress = (files || []).map((file) => ({
        error: false,
        color: "green-2",
        percent: 0,
        icon:
          file.type.indexOf("video/") === 0
            ? "movie"
            : file.type.indexOf("image/") === 0
            ? "photo"
            : file.type.indexOf("audio/") === 0
            ? "audiotrack"
            : "insert_drive_file",
      }));
    },

    upload() {
      const files = this.files.map(
        (file) => new Object({ name: file.name, path: file.path })
      );

      if (this.files.length==0) {
        const clickedButton = window.openMessageDialog({
          type: "warning",
          title: "First Select File",
          message: "Select atleast one of the file to download",
        });
        return;
      }

      window.uploadHTMLS(files);      
      this.showUploadingStatus = true;
      this.uploading=true;
      
      // clearTimeout(this.uploading);

      // const allDone = this.uploadProgress.every(
      //   (progress) => progress.percent === 1
      // );

      // this.uploadProgress = this.uploadProgress.map((progress) => ({
      //   ...progress,
      //   error: false,
      //   color: "green-2",
      //   percent: allDone === true ? 0 : progress.percent,
      // }));

      // this.__updateUploadProgress();
    },

    __updateUploadProgress() {
      let done = true;

      this.uploadProgress = this.uploadProgress.map((progress) => {
        if (progress.percent === 1 || progress.error === true) {
          return progress;
        }

        const percent = Math.min(1, progress.percent + Math.random() / 10);
        const error = percent < 1 && Math.random() > 0.95;

        if (error === false && percent < 1 && done === true) {
          done = false;
        }

        return {
          ...progress,
          error,
          color: error === true ? "red-2" : "green-2",
          percent,
        };
      });

      this.uploading =
        done !== true ? setTimeout(this.__updateUploadProgress, 300) : null;
    },
  },

  mounted() {
    window.updateUploadingStatus = (statusUpdate) => {
      console.log(statusUpdate);
      const { totalHTMLs, succeed, failed, completed } = statusUpdate;

      this.status = succeed / totalHTMLs;

      if(completed) {
        const {individualHTMLStats} = statusUpdate;

        let invalids=0;
        for(let stat of individualHTMLStats){
          if(!stat.success) {
               invalids++;
               try{
                 window.logErrors(`[${new Date().toUTCString().replace(/:/g, '-')}] Error uploading file: ${stat.name} at path: ${stat.path} . ${stat.errorMessage}`);
               }
               catch(e){
                 console.log(stat.errorMessage);
               }
            }
        }

        if(invalids==1){
          this.uploadErrorMessage = `Error uploading file: ${individualHTMLStats[0].name}. May be you have already uploaded it`;
        }
        else if(invalids>1){
          for (const stat of individualHTMLStats) {
            if (stat.errorMessage) {
                this.invalidFiles.push(`${stat.name}`);
            }
          }
        }
        
        this.uploading = null;
        this.uploadProgress = [];
        this.files = null;
        if(this.status==0) this.showUploadingStatus = false;
      }
    };
  },

  beforeDestroy() {
    clearTimeout(this.uploading);
  },
};
</script>

<style scoped lang="scss">
.q-btn {
  vertical-align: baseline;
}

.errorMessage {
  color: $blue-grey-7;
}

label[data-v-456833dd]{
  align-items: center;
}

.q-field__control{
  align-items: center !important;
}

.q-field__append{
  align-self: baseline !important;
}
</style>
