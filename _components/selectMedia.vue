<template>
  <div id="selectMediaComponent" class="full-width relative-position">
    <!--File List-->
    <file-list v-if="initiated" v-model="filesData" v-bind="fileListParams" @emptyFileAction="pickSelectFile()"
               @loaded="loadedFiles = true" />
    <!--direct upload media-->
    <media
      :allow-select="config.toSelect"
      only-upload
      ref="mediaComponent"
      :accept="config.accept"
      @uploading="loading = true"
      @uploaded="handlerSelectedFiles"
      :disk="mediaDisk"
      :max-file-size="config.maxFileSize"
      :ratio="config.ratio"
    />
    <!--Select media-->
    <master-modal v-model="modalMedia.show" v-bind="modalMediaParams" @hide="loading = false">
      <media
        :allow-select="config.toSelect"
        :accept="config.accept"
        :disk="mediaDisk"
        @selected="files => modalMedia.selectedFiles = $clone(files)"
        :max-file-size="config.maxFileSize"
        :ratio="config.ratio"
      />
    </master-modal>
    <!--inner loading-->
    <inner-loading :visible="loadingData || loading" />
  </div>
</template>
<script>
//components
import fileList from 'modules/qsite/_components/master/fileList';
import media from 'modules/qmedia/_components/media';

export default {
  props: {
    modelValue: { default: {} },
    disk: { default: null },
    zone: { type: String, default: 'mainimage' },
    entity: { type: String, required: true },
    entityId: { default: null },
    multiple: { type: Boolean, default: false },
    gridColClass: { default: false },
    label: { default: '' },
    maxFiles: { deafult: false },
    directUpload: { type: Boolean, default: false },
    accept: { default: false },
    readonly: { type: Boolean, default: false }
  },
  emits: ['update:modelValue', 'files'],
  components: { fileList, media },
  watch: {
    filesData: {
      deep: true,
      handler: function(newValue, oldValue) {
        this.emitResponseValue();
      }
    }
  },
  mounted() {
    this.$nextTick(function() {
      this.init();
    });
  },
  data() {
    return {
      initiated: false,
      loading: false,
      loadingData: false,
      loadedFiles: false,
      filesData: [],
      zoneConfig: {},
      modalMedia: {
        show: false,
        selectedFiles: []
      }
    };
  },
  computed: {
    //Select media config
    config() {
      //Instance max files quantity to select
      let maxFiles = this.zoneConfig.maxFiles || (this.maxFiles ? this.maxFiles : (this.multiple ? 12 : 1));
      //Return quantites of files
      return {
        maxFiles: maxFiles,
        selected: this.filesData.length,
        toSelect: (maxFiles == 1) ? 1 : (maxFiles - this.filesData.length),
        accept: this.zoneConfig.accept || this.accept,
        maxFileSize: parseInt(this.zoneConfig.maxFileSize || 0),
        ratio: this.zoneConfig.ratio || 'free',
        directUpload: (this.zoneConfig.directUpload == undefined) ? this.directUpload :
          (parseInt(this.zoneConfig.directUpload) ? true : false)
      };
    },
    //Params to file List
    fileListParams() {
      return {
        title: `${this.$clone(this.label)} (${this.config.selected}/${this.config.maxFiles})`,
        gridColClass: this.gridColClass || ((this.config.maxFiles >= 2) ? 'col-6 col-md-4' : 'col-12'),
        loadFiles: {
          apiRoute: 'apiRoutes.qmedia.files',
          requestParams: {
            take: this.config.maxFiles,
            filter: {
              folderId: null,
              zone: this.zone,
              entity: this.entity,
              entityId: this.entityId,
              disk: this.mediaDisk
            }
          }
        },
        draggable: true,
        actions: [
          {
            label: ((this.config.maxFiles == 1) && (this.config.selected == 1)) ?
              this.$tr('isite.cms.label.change') : this.$tr('isite.cms.label.select'),
            icon: 'fas fa-file-upload',
            padding: 'xs sm',
            color: 'green',
            rounded: true,
            outline: true,
            action: () => this.pickSelectFile()
          }
        ],
        itemActions: [
          {
            label: this.$tr('isite.cms.label.download'),
            format: (item) => {
              if (['s3','publicmedia'].includes(item.disk) && this.$hasAccess('media.medias.download'))
                return { vIf: true };
              else return { vIf: false };
            },
            icon: 'fas fa-file-download',
            action: (item) => this.$helper.downloadFromURL(item.path)
          },
          {
            label: this.$tr('isite.cms.label.delete'),
            icon: 'fas fa-trash',
            action: (item) => {
              let fileIndex = this.filesData.findIndex(file => item.id == file.id);
              if (fileIndex >= 0) this.filesData.splice(fileIndex, 1);
            }
          }
        ],
        quantity: this.config.maxFiles,
        readonly: this.readonly
      };
    },
    //modal media params
    modalMediaParams() {
      let counterSelect = `(${this.modalMedia.selectedFiles.length}/${this.config.toSelect})`;
      return {
        title: `${this.$tr('isite.cms.label.select')} ${this.$trp('isite.cms.label.file')} ${counterSelect}`,
        width: '95vw',
        actions: [
          {
            props: {
              label: this.$tr('isite.cms.label.save'),
              color: 'green'
            },
            action: () => {
              this.handlerSelectedFiles(this.modalMedia.selectedFiles);
              this.modalMedia.show = false;
            }
          }
        ]
      };
    },
    //default disk
    mediaDisk() {
      return this.disk || this.$getSetting('media::filesystem');
    }
  },
  methods: {
    async init() {
      this.initiated = false;
      await this.getZone();
      this.initiated = true;
    },
    //Get zone from DB
    getZone() {
      return new Promise(resolve => {
        this.loadingData = true;
        //Request params
        let requestParams = {
          refresh: true,
          params: {
            filter: { field: 'name', entityType: this.entity }
          }
        };
        //Request
        this.$crud.show('apiRoutes.qmedia.zones', this.zone, requestParams).then(response => {
          this.zoneConfig = response.data?.options || {};
          this.loadingData = false;
          resolve(response.data);
        }).catch(error => {
          this.$apiResponse.handleError(error, () => {
            resolve(false);
            this.loadingData = false;
          });
        });
      });
    },
    //pick select File
    pickSelectFile() {
      //Validate limit files
      if ((this.config.maxFiles >= 2) && !this.config.toSelect) {
        this.$alert.warning({
          mode: 'modal',
          title: this.$tr('media.cms.messages.limitFiles'),
          message: this.$tr('media.cms.messages.messageLimitFiles', { quantity: this.config.maxFiles })
        });
      }
      //Upload files
      else {
        //Open direct upload
        if (this.config.directUpload) this.$refs.mediaComponent.directUpload();
        //open modal to select files
        else {
          this.modalMedia.selectedFiles = [];
          this.modalMedia.show = true;
        }
      }
    },
    //Emit response value
    emitResponseValue() {
      let files = this.$clone(this.filesData);
      let responseValue = this.$clone(this.modelValue);

      //Validate response value
      if ((typeof responseValue != 'object') || Array.isArray(responseValue) || (responseValue == null))
        responseValue = {};

      if (this.config.maxFiles >= 2) {
        //instance default response
        let responseMultiple = { files: {}, orders: '' };
        //order response
        if (files.length) {
          responseMultiple.files = files.map(item => item.id);
          responseMultiple.orders = files.map(item => item.id).join(',');
        }
        //Set to response value
        responseValue[this.zone] = responseMultiple;
      } else {
        //instance default response
        let responseSingle = '';
        //order response
        if (files.length) responseSingle = files[0].id;
        //set to response value
        responseValue[this.zone] = responseSingle;
      }

      //Emit response
      if (this.loadedFiles) {
        this.$emit('update:modelValue', responseValue);
        this.$emit('files', files);
      }
    },
    //Handler selected files
    handlerSelectedFiles(files) {
      //Merge selected files
      let selectedFiles = this.$clone([...files, ...this.filesData]);
      this.filesData = this.$clone(selectedFiles.slice(0, this.config.maxFiles));
      //loading
      this.loading = false;
    }
  }
};
</script>
<style lang="scss">
#selectMediaComponent {
  border: 1px solid $grey-4;
  border-radius: $custom-radius-items;
}
</style>
