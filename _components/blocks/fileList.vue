<template>
  <div id="mediaTableFilesComponent">
    <!--Content-->
    <div id="mediaTableFilesContent">
      <!--Files-->
      <div id="tableFilesContent" class="row q-col-gutter-sm relative-position">
        <!--Table-->
        <q-table :data="tableData" :columns="tableColumns" :pagination.sync="table.pagination"
                 :hide-pagination="(noPagination || (table.pagination.lastPage == 1)) ? true : false"
                 :grid="(gridCard || gridChip) ? true : false"
                 :rows-per-page-options="table.rowsPerPageOptions" @request="getDataTable">
          <!---Top content-->
          <template v-slot:top>
            <div id="tableTopContent" @click="(order && table.filter.order) ? toggleOrder() : false"
                 :class="`text-blue-grey row items-center relative-position ${order ? 'cursor-pointer' : ''}`">
              <!---Title-->
              <q-icon v-if="icon" :name="icon" class="q-mr-sm"/>
              <!---Title-->
              <b>{{ title }}</b>
              <!--Counter-->
              <span v-if="counter" class="q-ml-sm">({{ table.pagination.rowsNumber }})</span>
              <!--Arrow icon to order-->
              <q-icon v-if="order && table.filter.order" class="q-ml-sm"
                      :name="`fas fa-arrow-${table.filter.order.way == 'asc' ? 'up' : 'down'}`"/>
              <!--Tooltip-->
              <q-tooltip v-if="order">{{ $tr('ui.label.order') }}</q-tooltip>
            </div>
            <!--Separator-->
            <div class="full-width">
              <q-separator class="q-my-sm"/>
            </div>
          </template>
          <!--Custom columns-->
          <template v-slot:body-cell="props">
            <!--File Name-->
            <q-td v-if="props.col.name == 'filename'" :props="props" class="td-filename">
              <div @click="fileAction(props.row)" class="item-file row items-center cursor-pointer">
                <!--Icon-->
                <q-icon v-if="!props.row.isImage" :name="`fas fa-${props.row.isFolder ? 'folder' : 'file'}`"/>
                <!--Image-->
                <div class="file-image" v-else :style="`background-image: url('${props.row.mediumThumb}')`"></div>
                <!--Filename-->
                {{ props.value }}
              </div>
            </q-td>
            <!-- actions columns -->
            <q-td v-else-if="props.col.name == 'actions'" :props="props">
              <div class="full-width" style="width : max-content">
                <q-btn v-for="(action, keyAction) in fileActions" :key="keyAction" :color="action.color"
                       :icon="action.icon" size="sm" style="font-size: 8px; padding: 6px"
                       round unelevated class="q-ml-xs" @click="action.action(props.row)">
                  <q-tooltip :delay="300">{{ action.label }}</q-tooltip>
                </q-btn>
              </div>
            </q-td>
            <!--Default columns-->
            <q-td v-else :props="props" :title="props.value">
              {{ props.value }}
            </q-td>
          </template>
          <!--Custom Grid-->
          <template v-slot:item="props">
            <!---Card-->
            <div class="q-pa-xs col-6 col-md-3 col-lg-2" v-if="gridCard">
              <div class="file-card cursor-pointer">
                <!--Image Preview-->
                <div v-if="props.row.isImage" class="file-card_img img-as-bg" @click="fileAction(props.row)"
                     :style="`background-image: url('${props.row.mediumThumb}')`">
                  <!--Tooltip-->
                  <q-tooltip anchor="center middle" self="center middle" :delay="500">
                    {{ props.row.filename }}
                  </q-tooltip>
                </div>
                <!--Icon-->
                <div v-else class="file-card_icon img-as-bg row items-center justify-center"
                     @click="fileAction(props.row)">
                  <q-icon :name="props.row.icon" color="blue-grey"/>
                  <!--Tooltip-->
                  <q-tooltip anchor="center middle" self="center middle" :delay="500">
                    {{ props.row.filename }}
                  </q-tooltip>
                </div>
                <!--Bottom content-->
                <div class="file-card__bottom">
                  <!--Name-->
                  <div class="file-card__bottom_title ellipsis">
                    {{ props.row.filename }}
                  </div>
                  <!--Actions-->
                  <q-btn class="file-card__bottom_actions" icon="fas fa-ellipsis-v" unelevated round size="xs"
                         color="blue-grey" flat>
                    <!---Menu actions-->
                    <q-menu anchor="bottom left" self="bottom end">
                      <q-list style="min-width: 100px">
                        <q-item clickable v-close-popup v-for="(item, itemKey) in fileActions" :key="itemKey"
                                @click.native="item.action(props.row)">
                          <q-item-section>
                            <div class="row items-center">
                              <q-icon :name="item.icon" class="q-mr-sm" color="blue-grey" size="18px"/>
                              {{ item.label }}
                            </div>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>
              </div>
            </div>
            <!--Chips-->
            <div class="q-pa-xs col-6 col-md-3 col-lg-2" v-else-if="gridChip">
              <div class="file-chip cursor-pointer">
                <!--Image Preview-->
                <div v-if="props.row.isImage" class="file-chip__img img-as-bg" @click="fileAction(props.row)"
                     :style="`background-image: url('${props.row.mediumThumb}')`">
                </div>
                <!--Icon-->
                <q-icon v-else :name="`fas fa-${props.row.isFolder ? 'folder' : 'file'}`" class="file-chip__icon"
                        @click="fileAction(props.row)"/>
                <!--Title-->
                <div class="file-chip__title ellipsis" @click="fileAction(props.row)">
                  {{ props.row.filename }}
                  <!--Tooltip-->
                  <q-tooltip anchor="center middle" self="center middle" :delay="500">
                    {{ props.row.filename }}
                  </q-tooltip>
                </div>
                <!--Actions-->
                <q-btn class="file-chip__actions" icon="fas fa-ellipsis-v" unelevated round size="xs"
                       color="blue-grey" flat>
                  <!---Menu actions-->
                  <q-menu anchor="bottom left" self="bottom end">
                    <q-list style="min-width: 100px">
                      <q-item clickable v-close-popup v-for="(item, itemKey) in fileActions" :key="itemKey"
                              @click.native="item.action(props.row)">
                        <q-item-section>
                          <div class="row items-center">
                            <q-icon :name="item.icon" class="q-mr-sm" color="blue-grey" size="18px"/>
                            {{ item.label }}
                          </div>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
            </div>
          </template>
        </q-table>
        <!--Image preview-->
        <avatar-image ref="avatarImage" no-preview/>
        <!---PDF preview-->
        <master-modal v-model="modalPdf.show" :title="`PDF | ${modalPdf.fileName}`" width="100%">
          <iframe :src="modalPdf.src" width="100%" style="height: calc(100vh - 272px)"/>
        </master-modal>
        <!---audio/video-->
        <master-modal v-model="modalAudioVideo.show"
                      :title="$helper.toCapitalize(modalAudioVideo.type) + ' | ' + modalAudioVideo.fileName">
          <!--Audio-->
          <audio controls v-if="modalAudioVideo.type == 'audio'" style="width: 100%">
            <source :src="modalAudioVideo.src" type="audio/mpeg">
            Your browser does not support the audio element.
          </audio>
          <!--Video-->
          <video width="100%" controls v-if="modalAudioVideo.type == 'video'">
            <source :src="modalAudioVideo.src" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </master-modal>
        <!--Loading-->
        <inner-loading :visible="loading"/>
      </div>
    </div>
    <!--Crud folders-->
    <crud :crud-data="import('@imagina/qmedia/_crud/folder')" type="noIndex" ref="crudFolder"
          @deleted="$root.$emit('page.data.refresh')" @updated="$root.$emit('page.data.refresh')"/>
    <!--Crud files-->
    <crud :crud-data="import('@imagina/qmedia/_crud/files')" type="noIndex" ref="crudFile"
          @deleted="$root.$emit('page.data.refresh')" @updated="$root.$emit('page.data.refresh')"/>
  </div>
</template>
<script>
export default {
  name: 'fileListComponent',
  props: {
    params: {
      default: () => {
        return {folderId: 0}
      }
    },
    gridCard: {type: Boolean, default: false},
    gridChip: {type: Boolean, default: false},
    title: {default: false},
    icon: {default: false},
    rowsPerPage: {default: 20},
    noPagination: {type: Boolean, default: false},
    counter: {type: Boolean, default: false},
    order: {type: Boolean, default: false},
  },
  components: {},
  watch: {
    params: {
      deep: true,
      handler: function (newValue, oldValue) {
        Object.keys(newValue).forEach(keyField => {
          if (this.table.filter[keyField] != newValue[keyField]) {
            this.table.pagination.page = 1
            this.table.filter = this.$clone({...this.table.filters, ...newValue})
            this.getData()
          }
        })
      }
    },
    rowPerPage() {
      this.table.pagination.rowsPerPage = this.$clone(this.rowsPerPage)
      this.getData()
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
      files: [],
      table: {
        data: [],
        pagination: {
          page: 1,
          rowsPerPage: 20,
          lastPage: 1,
          rowsNumber: 0
        },
        rowsPerPageOptions: [5, 10, 20, 50, 100, 300, 500],
        filter: {
          folderId: 0,
          order: {
            field: 'created_at',
            way: 'desc'
          }
        }
      },
      modalPdf: {
        show: false,
        src: false,
        fileName: '',
      },
      modalAudioVideo: {
        show: false,
        src: false,
        type: '',
        fileName: ''
      }
    }
  },
  computed: {
    //File Actions
    fileActions() {
      let response = [
        {
          label: this.$tr('ui.label.edit'),
          icon: 'fas fa-pen',
          color: 'green',
          action: (item) => {
            if (item.isFolder) this.$refs.crudFolder.update(item)
            else this.$refs.crudFile.update(item)
          }
        },
        {
          label: this.$tr('ui.label.delete'),
          icon: 'fas fa-trash',
          color: 'red',
          action: (item) => {
            if (item.isFolder) this.$refs.crudFolder.delete(item)
            else this.$refs.crudFile.delete(item)
          }
        }
      ]

      //Add download action
      if (this.$auth.hasAccess('media.medias.download') && !this.params.isFolder)
        response.unshift({
          label: this.$tr('ui.label.download'),
          icon: 'fas fa-file-download',
          color: 'info',
          action: (item) => this.$helper.downloadFromURL(item.path)
        })

      //Response
      return response
    },
    //Table columns
    tableColumns() {
      return [
        {
          name: 'id', label: 'Id', field: 'id', align: 'left',
          sortable: true
        },
        {
          name: 'filename', label: this.$tr('ui.form.name'), field: 'filename', align: 'left',
          sortable: true
        },
        {
          name: 'type', label: this.$tr('ui.form.type'), align: 'left', field: 'id',
          format: (val, row) => row ? (row.isFolder ? this.$tr('ui.label.folder') :
              (row.isImage ? this.$tr('ui.label.image') : this.$tr('ui.label.file'))) : ''
        },
        {
          name: 'created_at', label: this.$tr('ui.form.createdAt'), field: 'createdAt',
          sortable: true, format: val => val ? this.$trd(val, {type: 'long'}) : '-'
        },
        {
          name: 'filesize', label: this.$tr('ui.label.size'), field: 'filesize',
          format: val => val ? this.$helper.formatBytes(val) : '-'
        },
        {name: 'actions', label: this.$trp('ui.label.action')},
      ]
    },
    //Table data
    tableData() {
      //Get data table
      let items = this.table.data

      //Icons by extensions
      let iconByExtension = {
        mp3: 'fas fa-file-audio',
        mp4: 'fas fa-file-video',
        pdf: 'fas fa-file-pdf',
        xlsx: 'fas fa-file-excel',
        xls: 'fas fa-file-excel',
        docx: 'fas fa-file-word',
        doc: 'fas fa-file-word',
        pptx: 'fas fa-file-powerpoint',
        ppt: 'fas fa-file-powerpoint',
      }

      //Transform data
      items.forEach(item => {
        item.icon = item.isFolder ? 'fas fa-folder' : (iconByExtension[item.extension] || 'fas fa-file')
      })

      //Response
      return items
    }
  },
  methods: {
    init() {
      this.table.filter = this.$clone({...this.table.filter, ...this.params})
      this.table.pagination.rowsPerPage = this.$clone(this.rowsPerPage)
      this.getData()
    },
    //Get data
    getData(refresh = false) {
      //Call data table
      this.getDataTable({
        pagination: this.$clone(this.table.pagination),
        filter: this.$clone(this.table.filter)
      }, refresh)
    },
    //Get data table
    getDataTable({pagination, filter}, refresh = false) {
      return new Promise((resolve, reject) => {
        this.loading = true
        //Update table filters
        this.table.filter = this.$clone({...this.table.filter, ...(filter || {})})
        //Request params
        let requestParams = {
          refresh: refresh,
          params: {
            page: this.$clone(pagination.page),
            take: this.$clone(pagination.rowsPerPage),
            filter: this.$clone(this.table.filter)
          }
        }
        //Set order by
        if (pagination.sortBy) {
          requestParams.params.filter.order = {
            field: pagination.sortBy,
            way: pagination.descending ? 'desc' : 'asc'
          }
        }
        //Request
        this.$crud.index('apiRoutes.qmedia.files', requestParams).then(response => {
          this.table.data = response.data
          //Set pagination
          this.table.pagination.page = this.$clone(response.meta.page.currentPage)
          this.table.pagination.rowsNumber = this.$clone(response.meta.page.total)
          this.table.pagination.lastPage = this.$clone(response.meta.page.lastPage)
          this.table.pagination.sortBy = this.$clone(pagination.sortBy)
          this.table.pagination.descending = this.$clone(pagination.descending)
          this.loading = false
        }).catch(error => {
          this.loading = false
        })
      })
    },
    //Do Item action
    fileAction(file) {
      //Action if is folder
      if (file.isFolder) {
        this.table.filter.folderId = this.$clone(file.id)
        this.getData()
        this.$emit('selected', file.id)
      }
      //Action if is image
      if (file.isImage) {
        this.$refs.avatarImage.open(file.mediumThumb)
      }
      //Action if is PDF
      if (file.extension == 'pdf') {
        this.modalPdf = {
          show: true,
          src: file.path,
          fileName: file.filename
        }
      }
      //Action if is mp3
      if (file.extension == 'mp3') {
        this.modalAudioVideo = {
          show: true,
          src: file.path,
          type: 'audio',
          fileName: file.filename
        }
      }
      //Action if is mp4
      if (file.extension == 'mp4') {
        this.modalAudioVideo = {
          show: true,
          src: file.path,
          type: 'video',
          fileName: file.filename
        }
      }
    },
    //Toggle order
    toggleOrder() {
      this.table.filter.order.way = (this.table.filter.order.way == 'asc' ? 'desc' : 'asc')
      this.table.pagination.page = 1
      this.getData()
    }
  }
}
</script>
<style lang="stylus">
#mediaTableFilesComponent
  #tableFilesContent
    .q-table__container
      width 100%
      box-shadow none
      color $grey-9

      .q-table__top
        padding 0

        #tableTopContent
          font-size 1rem
          text-transform capitalize
          width max-content

      thead
        th
          font-size 16px

      .td-filename //Table styles

        .item-file
          width max-content

          .q-icon
            font-size 25px
            margin-right 15px

          .file-image
            margin-right 15px
            height 36px
            width 36px
            background-repeat no-repeat
            background-position center
            background-size cover

      .file-card //Card styles
        color $grey-9
        background-color $grey-4
        border 1px solid $grey-3
        border-radius 5px
        overflow hidden

        .file-card_img, .file-card_icon
          height 150px
          width 100%

        .file-card_icon
          .q-icon
            font-size 50px

        .file-card__bottom
          width 100%
          background-color white
          position relative

          .file-card__bottom_title
            font-size 12px
            padding 5px 13px 5px 5px
            color $grey-9
            text-transform lowercase
            width calc(100% - 15px)

          .file-card__bottom_actions
            position absolute
            right 2px
            top 2px

      .file-chip
        border 1px solid $grey-5
        padding 5px
        border-radius 5px
        color $grey-8
        position: relative;

        .file-chip__img
          position absolute
          left 5px
          top 6.5px
          height 18px
          width 18px

        .file-chip__icon
          position absolute
          left 5px
          top 6.5px
          font-size 18px
          margin-right 5px

        .file-chip__title
          padding-left 23px
          padding-right 20px
          text-transform lowercase

        .file-chip__actions
          position absolute
          right 2px
          top 4px
</style>

