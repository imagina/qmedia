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
          <template v-if="gridChip || gridCard" v-slot:top>
            <div id="tableTopContent" :class="`relative-position ${order ? 'cursor-pointer' : ''}`"
                 @click="toggleOrder()">
              <!---Title-->
              <span>{{ title }}</span>
              <!--Counter-->
              <span v-if="counter" class="q-ml-sm">({{ table.pagination.rowsNumber }})</span>
              <!--Arrow icon to order-->
              <q-icon v-if="order && table.filter.order" class="q-ml-sm"
                      :name="`fas fa-arrow-${table.filter.order.way == 'asc' ? 'up' : 'down'}`"/>
              <!--Tooltip-->
              <q-tooltip v-if="order">{{ $tr('ui.label.order') }}</q-tooltip>
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
                <!--Edit button-->
                <q-btn color="positive" icon="fas fa-pen" size="sm" style="font-size: 8px; padding: 6px"
                       round unelevated class="q-ml-xs">
                  <q-tooltip :delay="300">{{ $tr('ui.label.edit') }}</q-tooltip>
                </q-btn>
                <!--Delete button-->
                <q-btn color="negative" icon="fas fa-trash-alt" size="sm" class="q-ml-xs"
                       round unelevated style="font-size: 8px; padding: 6px" @click="deleteFile(props.row)">
                  <q-tooltip :delay="300">{{ $tr('ui.label.delete') }}</q-tooltip>
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
              <div class="file-card cursor-pointer" @click="fileAction(props.row)">
                <!--Image Preview-->
                <div v-if="props.row.isImage" class="file-card_img img-as-bg"
                     :style="`background-image: url('${props.row.mediumThumb}')`">
                </div>
                <!--Icon-->
                <div v-else class="file-card_icon img-as-bg row items-center justify-center">
                  <q-icon :name="props.row.icon" color="blue-grey"/>
                </div>
                <div class="file-card__title ellipsis"> {{ props.row.filename }}</div>
                <!--Tooltip-->
                <q-tooltip anchor="center middle" self="center middle" :delay="500">
                  {{ props.row.filename }}
                </q-tooltip>
              </div>
            </div>
            <!--Chips-->
            <div class="q-pa-xs col-6 col-md-3 col-lg-2" v-else-if="gridChip">
              <div class="file-chip cursor-pointer" @click="fileAction(props.row)">
                <!--Image Preview-->
                <div v-if="props.row.isImage" class="file-chip__img img-as-bg"
                     :style="`background-image: url('${props.row.mediumThumb}')`">
                </div>
                <!--Icon-->
                <q-icon v-else :name="`fas fa-${props.row.isFolder ? 'folder' : 'file'}`" class="file-chip__icon"/>
                <div class="file-chip__title ellipsis">{{ props.row.filename }}</div>
                <!--Tooltip-->
                <q-tooltip anchor="center middle" self="center middle" :delay="500">
                  {{ props.row.filename }}
                </q-tooltip>
              </div>
            </div>
          </template>
        </q-table>
        <!--Image preview-->
        <avatar-image ref="avatarImage" no-preview/>
        <!---PDF preview-->
        <q-dialog v-model="modalPdf.show" maximized>
          <q-card id="cardContent" class="bg-grey-1 backend-page row">
            <!--Header-->
            <q-toolbar class="bg-primary text-white">
              <q-toolbar-title>Media</q-toolbar-title>
              <q-btn flat v-close-popup icon="fas fa-times"/>
            </q-toolbar>

            <!--Content-->
            <q-card-section class="relative-position col-12 q-pa-none">
              <iframe :src="modalPdf.src" width="100%" style="height: calc(100vh - 55px)"/>
            </q-card-section>
          </q-card>
        </q-dialog>
        <!--Loading-->
        <inner-loading :visible="loading"/>
      </div>
    </div>
    <!--Crud folders-->
    <crud :crud-data="import('@imagina/qmedia/_crud/folder')" type="onlyUpdate" ref="crudFolder"/>
  </div>
</template>
<script>
export default {
  props: {
    params: {
      default: () => {
        return {folderId: 0}
      }
    },
    gridCard: {type: Boolean, default: false},
    gridChip: {type: Boolean, default: false},
    title: {default: false},
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
        src: false
      }
    }
  },
  computed: {
    //Table columns
    tableColumns() {
      return [
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

      //Transform data
      items.forEach(item => {
        item.icon = item.isFolder ? 'fas fa-folder' : (item.mediaType == 'video' ? 'fas fa-video' : 'fas fa-file')
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
        this.modalPdf.src = file.path
        this.modalPdf.show = true
      }
    },
    //Toogle order
    toggleOrder() {
      this.table.filter.order.way = (this.table.filter.order.way == 'asc' ? 'desc' : 'asc')
      this.table.pagination.page = 1
      this.getData()
    },
    //Delete item
    deleteFile(file) {
      console.warn('Delete', file)
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
            height 25px
            width 25px
            background-repeat no-repeat
            background-position center
            background-size contain

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

        .file-card__title
          width 100%
          font-size 12px
          padding 5px
          background-color white
          color $grey-9
          text-transform lowercase

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
          text-transform lowercase
</style>

