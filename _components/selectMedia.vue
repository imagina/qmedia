<template>
  <div id="selectMediaComponent" class="full-width">
    <!--File List-->
    <file-list v-model="filesData" v-bind="fileListParams"/>
    <!--Select media-->
    <master-modal v-model="modalMedia.show" v-bind="modalMediaParams">
      <media :allow-select="maxFiles - filesData.length" @selected="files => modalMedia.selectedFiles = $clone(files)"/>
    </master-modal>
  </div>
</template>
<script>
//components
import fileList from '@imagina/qsite/_components/master/fileList'
import media from '@imagina/qmedia/_components/media'

export default {
  props: {
    disk: {default: 'publicmedia'},
    zone: {type: String, default: 'mainimage'},
    entity: {type: String, required: true},
    entityId: {default: null},
    multiple: {type: Boolean, default: false},
    gridColClass: {default: false},
    label: {default: ''}
  },
  components: {fileList, media},
  watch: {
    filesData: {
      deep: true,
      handler: function (newValue, oldValue) {
        this.emitResponseValue()
      }
    }
  },
  mounted() {
    this.$nextTick(function () {
      this.init()
    })
  },
  data() {
    return {
      loading: false,
      filesData: [],
      modalMedia: {
        show: false,
        selectedFiles: []
      }
    }
  },
  computed: {
    //Validate max Files
    maxFiles() {
      return this.multiple ? 12 : 1
    },
    //Params to file List
    fileListParams() {
      return {
        title: `${this.$clone(this.label)} (${this.filesData.length}/${this.maxFiles})`,
        gridColClass: this.gridColClass || (this.multiple ? 'col-6 col-md-4' : 'col-12'),
        loadFiles: {
          apiRoute: 'apiRoutes.qmedia.files',
          requestParams: {
            filter: {
              folderId: null,
              zone: this.zone,
              entity: this.entity,
              entityId: this.entityId
            }
          }
        },
        actions: [
          {
            label: this.$tr('ui.label.select'),
            icon: 'fas fa-file-upload',
            padding: 'xs sm',
            color: 'green',
            rounded: true,
            outline: true,
            action: () => {
              this.modalMedia.selectedFiles = []
              this.modalMedia.show = true
            },
            disable: this.filesData.length >= this.maxFiles ? true : false
          }
        ],
        itemActions: [
          {
            label: this.$tr('ui.label.delete'),
            icon: 'fas fa-trash',
            action: (item) => {
              let fileIndex = this.filesData.findIndex(file => item.id == file.id)
              if (fileIndex >= 0) this.filesData.splice(fileIndex, 1)
            }
          }
        ]
      }
    },
    //modal media params
    modalMediaParams() {
      let counterSelect = `(${this.modalMedia.selectedFiles.length}/${this.maxFiles - this.filesData.length})`
      return {
        title: `${this.$tr('ui.label.select')} ${this.$trp('ui.label.file')} ${counterSelect}`,
        width: '95vw',
        actions: [
          {
            props: {
              label: this.$tr('ui.label.save'),
              color: 'green'
            },
            action: () => {
              this.filesData = this.$clone([...this.modalMedia.selectedFiles, ...this.filesData])
              this.modalMedia.show = false
            }
          }
        ]
      }
    }
  },
  methods: {
    init() {
    },
    //Emit response value
    emitResponseValue() {
      let files = this.$clone(this.filesData)
      let responseValue = {}

      if (this.multiple) {
        //instance default response
        let responseMultiple = {files: {}, orders: ''}
        //order response
        if (files.length) {
          responseMultiple.files = files.map(item => item.id)
          responseMultiple.orders = files.map(item => item.id).join(',')
        }
        //Set to response value
        responseValue[this.zone] = responseMultiple
      } else {
        //instance default response
        let responseSingle = ''
        //order response
        if (files.length) responseSingle = files[0].id
        //set to response value
        responseValue[this.zone] = responseSingle
      }

      //Emit response
      this.$emit('input', responseValue)
    }
  }
}
</script>
<style lang="stylus">
#selectMediaComponent
  border 1px solid $grey-4
  border-radius $custom-radius-items
</style>
