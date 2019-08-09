<template>
  <div id="mediaList" class="row">
    <!--== Table ==-->
    <div class="col-12 backend-page relative-position">
      <!--== Table ==-->
      <q-table
        :data="dataTable"
        :columns="columnsTable"
        :pagination.sync="pagination"
        selection="multiple"
        :selected.sync="rowsSelected"
        row-key="filename"
        @request="getData"
        class="box-table"
      >
        <!--Header-->
        <template slot="top" slot-scope="props">
          <div class="row table-top col-12">
            <!--Table slot left-->
            <div class="table-top-left col-12 col-md-5 col-lg-4 col-xl-3">
              <!---Search-->
              <q-search
                hide-underline
                clearable
                color="secondary"
                v-model="filter.search"
                @input="getData({pagination:pagination,search:filter.search})"
              />
            </div>
            <!--Table slot Right-->
            <div class="table-top-right col-12 col-md-7 col-lg-8 col-xl-9 text-right">
              <div class="row justify-end items-center full-width">
                <!--Button Move file -->
                <q-btn color="teal" icon="fas fa-arrows-alt"
                       @click="getFolders(); dialogMove=true"
                       :label="$tr('ui.label.move')"
                       v-if="rowsSelected.length"/>
                <!--Button delete file -->
                <q-btn color="red-14" icon="fas fa-trash" class="q-ml-xs"
                       @click="dialogDeleteGlobal.handler()"
                       :label="$tr('ui.label.delete')"
                       v-if="rowsSelected.length"/>
                <!--Button add folder -->
                <q-btn color="positive" icon="fas fa-folder-plus" class="q-ml-xs"
                       @click="dialogCreateFolder=true"
                       :label="$tr('qmedia.layout.newFolder')"
                       v-if="$auth.hasAccess('media.folders.create')"
                />
                <!--Button add file -->
                <q-btn color="blue" icon="add_photo_alternate" class="q-ml-xs"
                       @click="uploadFile = !uploadFile" :loading="loadingUploadFile"
                       :label="$tr('qmedia.layout.uploadFile')"
                       v-if="$auth.hasAccess('media.medias.create')">
                  <div slot="loading">
                    <q-spinner class="on-left"/>
                    <span class="q-hide q-md-show">{{$tr('ui.label.loading')}}...</span>
                  </div>
                </q-btn>
                <!---Uploader Files-->
                <q-uploader
                  :key="uploaderID"
                  :url="uploaderUrl"
                  multiple v-show="false"
                  method="POST"
                  extensions=".gif,.jpg,.jpeg,.png,.pdf"
                  auto-expand
                  :additional-fields="additionalFields"
                  @fail="$alert.error({message: `${this.$tr('ui.message.recordNoCreated')}`})"
                  @finish="finishUploadFiles(); loadingUploadFile = false"
                  hide-upload-button
                  ref="uploadComponent"
                  @add="()=>{$refs.uploadComponent.upload(); loadingUploadFile = true}"
                  :headers="headers"/>
                <!--Button refresh -->
                <q-btn color="info" icon="fas fa-sync" class="q-ml-xs"
                       @click="getData({pagination:pagination,search:filter.search},true)">
                  <q-tooltip>{{$tr('ui.label.refresh')}}</q-tooltip>
                </q-btn>
              </div>
            </div>
            <!--Breadcrumb-->
            <div class="table-top-filters col-12 q-pt-md">
              <q-breadcrumbs>
                <q-breadcrumbs-el v-for="(breadcrumb,index) in breadcrumbs" :key="index" :label="breadcrumb.name"
                                  @click.native="getDataByFolder(breadcrumb.id)" style="cursor: pointer"/>
              </q-breadcrumbs>
            </div>
          </div>
        </template>

        <!--= Small Thumb or Icon =-->
        <q-td slot="body-cell-small_thumb" style="width: 30%"
              slot-scope="props" :props="props">
          <q-btn v-if="props.row.is_folder" icon="far fa-folder" flat @click="getDataByFolder(props.row.id)"/>
          <div v-else-if="props.row.is_image">
            <div class="image" :style="'background-image: url('+props.value+')'" alt="">
            </div>
          </div>
          <div v-else>
            <q-icon name="far fa-file-alt"/>
          </div>
        </q-td>

        <!--= File or Folder Name =-->
        <q-td slot="body-cell-filename" style="width: 10%"
              slot-scope="props" :props="props">
          <span class="q-caption">
            {{props.value}}
          </span>
        </q-td>

        <!--= Actions =-->
        <q-td slot="body-cell-actions"
              slot-scope="props" :props="props">
          <div v-if="embebed && !props.row.is_folder">
            <q-btn color="blue" :label="$tr('ui.label.select')" size="sm"
                   @click="$emit('data', props.row)"/>
          </div>
          <div v-else-if="!embebed">
            <q-btn icon="fas fa-pen" color="positive" size="sm" class="q-mx-xs"
                   @click="props.row.is_folder ? editFolder(props.row.filename,true,props.row.id) : editFile(true,props.row)">
              <q-tooltip>{{$tr('ui.label.edit')}}</q-tooltip>
            </q-btn>
            <q-btn icon="far fa-trash-alt" color="negative" size="sm" class="q-mx-xs"
                   @click="dialogDeleteItem.handler(props.row.id,props.row.is_folder)">
              <q-tooltip>{{$tr('ui.label.delete')}}</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </q-table>
      <!--Loading-->
      <inner-loading :visible="loading"/>
    </div>
    <!--= Create Folder Dialog =-->
    <q-dialog
      v-model="dialogCreateFolder"
      prevent-close
      class="backend-page"
    >
      <!-- This or use "title" prop on <q-dialog> -->
      <span slot="title" class="text-primary">
        <q-icon name="fa fa-folder"></q-icon>
        {{$tr('qmedia.layout.newFolder')}}
      </span>

      <!-- This or use "message" prop on <q-dialog> -->
      <span slot="message"></span>

      <div slot="body" class="relative-position">
        <q-input :stack-label="$tr('qmedia.layout.form.folderName')"
                 v-model="folderName"/>
        <inner-loading :visible="loadingCreateFolder"/>
      </div>

      <template slot="buttons" slot-scope="props">
        <q-btn :label="$tr('ui.label.cancel')" color="negative" @click="props.cancel" icon="fas fa-times"/>
        <q-btn color="positive" :label="$tr('ui.label.save')" @click="newFolder(props.ok)" icon="fas fa-save"/>
      </template>
    </q-dialog>

    <!--= Edit Folder Dialog =-->
    <q-dialog
      v-model="dialogRenameFolder"
      prevent-close class="backend-page"
    >
      <!-- This or use "title" prop on <q-dialog> -->
      <span slot="title" class="text-primary">
        <q-icon name="fa fa-folder"></q-icon>
        {{$tr('qmedia.layout.renameFolder')}}
      </span>

      <!-- This or use "message" prop on <q-dialog> -->
      <span slot="message"></span>

      <div slot="body" class="relative-position">
        <q-field>
          <q-input :stack-label="$tr('qmedia.layout.form.folderName')" v-model="folderName"/>
        </q-field>
        <inner-loading :visible="loadingRenameFolder"/>
      </div>

      <template slot="buttons" slot-scope="props">
        <q-btn :label="$tr('ui.label.cancel')" color="negative" @click="props.cancel" icon="fas fa-times"/>
        <q-btn color="positive" :label="$tr('ui.label.confirm')" icon="fas fa-save"
               @click="editFolder('',false,false,props.ok)"/>
      </template>
    </q-dialog>

    <!--= Edit File Dialog =-->
    <q-modal
      v-model="dialogEditFile"
      id="mediaEditFileModal"
      class="backend-page"
      :content-css="{minWidth: '80vw', minHeight: '80vh'}"
    >
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-toolbar-title class="capitalize">
            {{$tr('qmedia.layout.editFile')}}
          </q-toolbar-title>
          <q-btn flat v-close-overlay icon="fas fa-times"/>
        </q-toolbar>

        <q-toolbar slot="footer" color="white">
          <q-toolbar-title></q-toolbar-title>
          <!--button save-->
          <q-btn color="positive" :label="$tr('ui.label.save')" @click="editFile()"/>
        </q-toolbar>

        <div class="layout-padding">
          <locales v-model="locale"/>

          <div class="row gutter-sm" v-if="locale.success">
            <div class="col-12">
              <q-field>
                <q-input :stack-label="$tr('qmedia.layout.form.altAttribute')"
                         v-model="locale.formTemplate.alt_attribute"/>
              </q-field>
            </div>
            <div class="col-12">
              <q-field>
                <q-input type="textarea" rows="3"
                         :stack-label="$tr('ui.label.description',{capitalize:true})"
                         v-model="locale.formTemplate.description"/>
              </q-field>
            </div>
            <div class="col-12">
              <q-field>
                <q-input :stack-label="$tr('qmedia.layout.form.keyWords')"
                         v-model="locale.formTemplate.keywords"
                         placeholder="one,two,tree"/>
              </q-field>
            </div>
            <div class="col-12">
              <q-chips-input :stack-label="$trp('ui.label.tag',{capitalize:true})" v-model="locale.formTemplate.tags"/>
            </div>
            <div class="col-12" v-if="fileForm.is_image">
              <div class="row">

                <div class="col-6">
                  <q-carousel
                    color="white"
                    arrows
                    height="250px"
                  >
                    <q-carousel-slide :img-src="fileForm.path ? fileForm.path : ''">
                    </q-carousel-slide>
                    <q-carousel-control
                      slot="control-button"
                      slot-scope="carousel"
                      position="bottom-right"
                      :offset="[18, 22]"
                    >
                      <q-btn
                        round dense push
                        color="primary"
                        :icon="carousel.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                        @click="carousel.toggleFullscreen()"
                      />
                    </q-carousel-control>
                  </q-carousel>
                </div>
                <div class="col-3">
                  <img class="img-fluid" :src="fileForm.path ? fileForm.path : ''" alt="">
                </div>
              </div>

            </div>
          </div>
          <inner-loading :visible="loadingEditFile"/>
        </div>

      </q-modal-layout>
    </q-modal>

    <!--= Move Elements Dialog =-->
    <q-dialog
      v-model="dialogMove"
      prevent-close
      class="backend-page"
    >
      <!-- This or use "title" prop on <q-dialog> -->
      <span slot="title" class="text-primary">
        <q-icon name="fa fa-folder"></q-icon>
        {{$tr('qmedia.layout.moveMedia')}}
      </span>

      <!-- This or use "message" prop on <q-dialog> -->
      <span slot="message"></span>

      <div slot="body" class="relative-position">
        <q-field>
          <q-select
            :stack-label="$tr('qmedia.layout.form.moveTo')"
            v-model="folderSelected"
            :options="selectFolders"
          />

        </q-field>
        <inner-loading :visible="loadingMove"/>
      </div>

      <template slot="buttons" slot-scope="props">
        <q-btn :label="$tr('ui.label.cancel')" color="negative" @click="props.cancel" icon="fas fa-times"/>
        <q-btn color="positive" :label="$tr('ui.label.confirm')" @click="moveElements(props.ok)" icon="fas fa-save"/>
      </template>
    </q-dialog>
  </div>
</template>
<script>
  /*Plugins*/
  import axios from 'axios';
  import config from 'src/config/index'
  import {uid} from 'quasar'
  import _cloneDeep from 'lodash.clonedeep'

  /*Services*/
  import mediaService from '@imagina/qmedia/_services/index'

  /*Components*/
  import locales from '@imagina/qsite/_components/locales'
  import innerLoading from 'src/components/master/innerLoading'

  export default {
    props: {
      embebed: {
        type: Boolean,
        default: false
      }
    },
    components: {
      locales,
      innerLoading
    },
    watch: {
      uploadFile(newValue) {
        if (newValue) this.$refs.uploadComponent.pick()
      }
    },
    mounted() {
      this.$nextTick(function () {
        this.breadcrumbs = this.defaultBreadCrum
        this.getData({pagination: this.pagination, search: this.filter.search}, this.embebed);
      })
    },
    data() {
      return {
        locale: {
          fields: {
            tags: []
          },
          fieldsTranslatable: {
            alt_attribute: '',
            description: '',
            keywords: '',
          }
        },
        folderSelected: null,
        selectFolders: [{
          label: 'Root',
          value: 0
        }],
        uploaderID: uid(),
        uploaderUrl: config('apiRoutes.qmedia.file'),
        folderName: '',
        idFolderToEdit: '',
        idFileToEdit: '',
        dialogEditFile: false,
        dialogCreateFolder: false,
        dialogRenameFolder: false,
        dialogMove: false,
        fileForm: {},
        rowsSelected: [],
        uploadFile: false,
        breadcrumbs: [],
        headers: {
          'Authorization': this.$store.state.quserAuth.userToken
        },
        filter: {
          search: '',
          folderId: 0
        },
        show: false,
        loading: false,
        loadingCreateFolder: false,
        loadingEditFile: false,
        loadingUploadFile: false,
        loadingRenameFolder: false,
        loadingMove: false,
        loadingDelete: false,
        dataTable: [],
        pagination: {
          page: 1,
          rowsPerPage: 15,
          rowsNumber: 1
        },
      }
    },
    computed: {
      /**
       * Additional fields for uploader http request
       * @returns {*[]}
       */
      additionalFields() {
        return [
          {
            name: 'parent_id',
            value: this.filter.folderId
          }
        ];
      },
      columnsTable() {
        return [
          {
            name: 'small_thumb', label: '',
            field: 'small_thumb', align: 'center'
          },
          {
            name: 'filename', label: this.$tr('ui.form.name'),
            field: 'filename', align: 'left'
          },
          {
            name: 'created_at', label: this.$tr('ui.form.createdAt'),
            field: 'created_at',
            format: val => val ? this.$trd(val) : '-',
            align: 'right', sortable: true
          },
          {
            name: 'actions', label: this.$tr('ui.form.actions'), align: 'center'
          },

        ]
      },
      dialogDeleteGlobal() {
        return {
          handler: () => {
            this.$q.dialog({
              title: this.$tr('ui.label.confirm'),
              ok: this.$tr('ui.label.delete'),
              message: this.$tr('ui.message.deleteRecord'),
              cancel: this.$tr('ui.label.cancel'),
              color: 'negative'
            }).then(() => {
              this.deleteElements()
            }).catch(() => {
            })
          }
        }
      },
      dialogDeleteItem() {
        return {
          handler: (id, isFolder) => {
            this.$q.dialog({
              title: this.$tr('ui.label.confirm'),
              ok: this.$tr('ui.label.delete'),
              message: this.$tr('ui.message.deleteRecord'),
              cancel: this.$tr('ui.label.cancel'),
            }).then(() => {
              this.deleteElement(id, isFolder)
            }).catch(() => {
            })
          }
        }
      },
      defaultBreadCrum() {
        return [{id: 0, name: this.$tr('ui.label.home')}]
      }
    },
    methods: {
      async getData({pagination, search}, refresh = false) {
        this.loading = true
        // clear storage cache
        if (refresh)
          this.$helper.clearCache('apiRoutes.qmedia.allMedia')

        let params = {
          params: {
            page: pagination.page,
            per_page: pagination.rowsPerPage,
            folder_id: this.filter.folderId,
            order_by: null,
            order: null,
            search: this.filter.search
          },
          refresh: refresh
        }

        // if folderId is not root path
        if (this.filter.folderId != 0) {
          let breacrumb = await mediaService.breadcrumb('apiRoutes.qmedia.breadcrumb', this.filter.folderId, {params: {}});
          breacrumb.data[0] = this.defaultBreadCrum[0]//Translate first field
          this.breadcrumbs = breacrumb.data
        } else
        // reseting breadcrumb
          this.breadcrumbs = this.defaultBreadCrum

        // index all media by params
        this.$crud.index('apiRoutes.qmedia.allMedia', params).then(response => {
          this.dataTable = response.data
          this.pagination.rowsPerPage = pagination.rowsPerPage;
          this.pagination.page = pagination.page;
          this.pagination.rowsNumber = response.meta.total;
          this.loading = false
        }).catch(error => {
          this.$alert.error({message: this.$tr('ui.message.errorRequest'), pos: 'bottom'})
          this.loading = false
        })
      },
      /**
       * changing data by folderId
       * @param folderId
       * @param refresh
       */
      getDataByFolder(folderId, refresh = false) {
        this.filter.folderId = folderId
        this.getData({pagination: this.pagination, search: this.filter.search}, refresh)
      },

      /**
       * creating new folder
       * @param okFn
       */
      newFolder(okFn) {
        this.loadingFolder = true
        let data = {
          name: this.folderName,
          parent_id: this.filter.folderId
        }

        mediaService.postRequest('apiRoutes.qmedia.folder', data).then(reponse => {
          okFn()
          this.loadingFolder = false
          this.$alert.success({message: `${this.$tr('ui.message.recordCreated')}`})
          this.getData({pagination: this.pagination, search: this.filter.search}, true);
        }).catch(error => {
          this.loadingFolder = false
          this.$alert.error({message: `${this.$tr('ui.message.recordNoCreated')}`})
        })
      },
      /**
       * move elements selected on q-table component
       * @param okFn
       */
      moveElements(okFn) {
        this.loadingMove = true
        let data = {
          destinationFolder: this.folderSelected,
          files: this.rowsSelected
        }

        mediaService.postRequest('apiRoutes.qmedia.move', data).then(reponse => {
          okFn()
          this.loadingMove = false
          this.rowsSelected = []
          this.$alert.success({message: this.$tr('ui.message.recordUpdated')})
          this.getData({pagination: this.pagination, search: this.filter.search}, true);
        }).catch(error => {
          this.loadingMove = false
          this.$alert.error({message: this.$tr('ui.message.recordNoUpdated')})
        })
      },

      /**
       * finish upload files event from q-uploader component
       */
      finishUploadFiles() {
        this.uploadFile = false;
        this.uploaderID = uid();
        this.$alert.success({message: `${this.$tr('ui.message.recordCreated')}`})
        this.getDataByFolder(this.filter.folderId, true)
      },
      getFolders() {
        mediaService.folderList('apiRoutes.qmedia.folder').then(response => {
          this.selectFolders = [{
            label: 'Root',
            value: 0
          }]
          for (let id in response) {
            this.selectFolders.push({
              label: response[id],
              value: id
            })
          }
        }).catch(error => {
          this.$alert.error({message: this.$tr('ui.message.errorRequest'), pos: 'bottom'})
        })
      },

      /**
       * delete element on media by id
       * @param id
       * @param isFolder
       */
      deleteElement(id, isFolder) {
        let configRoute = 'apiRoutes.qmedia.file'

        // if is Folder replace configRoute and successMessage
        if (isFolder) {
          configRoute = 'apiRoutes.qmedia.folder'
        }

        mediaService.crud.delete(configRoute, id).then(response => {
          this.$alert.success({message: `${this.$tr('ui.message.recordDeleted')}`})
          this.getData({pagination: this.pagination, search: this.filter.search}, true);
        }).catch(error => {
          this.$alert.error({message: `${this.$tr('ui.message.recordNoDeleted')}`})
        })
      },

      /**
       * deleting multiple elements on media by selected rows on q-table component
       */
      deleteElements() {
        this.loading = true
        let data = {
          files: this.rowsSelected
        }

        mediaService.postRequest('apiRoutes.qmedia.batchDestroy', data).then(response => {
          this.$alert.success({message: `${this.$tr('ui.message.recordDeleted')}`})
          this.loading = false
          this.rowsSelected = []
          this.getData({pagination: this.pagination, search: this.filter.search}, true);
        }).catch(error => {
          this.$alert.error({message: `${this.$tr('ui.message.recordNoDeleted')}`})
        })
      },
      /**
       * edit folder name
       * @param name
       * @param openDialog
       * @param id
       * @param okFn
       */
      editFolder(name, openDialog, id = false, okFn = false) {
        // if openDialog its true, just opened
        if (openDialog) {
          this.idFolderToEdit = id
          this.folderName = name;
          this.dialogRenameFolder = true;
        } else { // else: send folder data to the service
          this.loadingRenameFolder = true
          let data = {
            id: this.idFolderToEdit,
            name: this.folderName,
            parent_id: this.filter.folderId
          }

          mediaService.editItem('apiRoutes.qmedia.folder', this.idFolderToEdit, data, {params: {}}).then(response => {
            okFn()
            this.loadingRenameFolder = false
            this.rowsSelected = []
            this.$alert.success({message: this.$tr('ui.message.recordUpdated')})
            this.getData({pagination: this.pagination, search: this.filter.search}, true);
          }).catch(error => {
            this.loadingRenameFolder = false
            this.$alert.error({message: this.$tr('ui.message.recordNoUpdated')})
          })
        }
      },

      /**
       * this function is not finished, will be finish on next version
       * @param openDialog
       * @param row
       */
      editFile(openDialog = false, row = false) {
        if (openDialog) {
          this.locale.form = row;
          this.fileForm = row;
          this.dialogEditFile = true;
        } else {
          this.loadingEditFile = true
          let data = _cloneDeep(this.locale.form)
          data['id'] = this.fileForm.id

          mediaService.createItem('apiRoutes.qmedia.file', data.id, data, {params: {}}).then(response => {
            this.loadingEditFile = false
            this.rowsSelected = []
            this.fileForm = {}
            this.dialogEditFile = false;
            this.$alert.success({message: this.$tr('ui.message.recordUpdated')})
            this.getData({pagination: this.pagination, search: this.filter.search}, true);
          }).catch(error => {
            this.loadingEditFile = false
            this.$alert.error({message: this.$tr('ui.message.recordNoUpdated')})
          })
        }
      },
    }
  }
</script>
<style lang="stylus">
  @import "~variables";
  #mediaList
    .table-top
      .table-top-right
        .q-btn
          @media screen and (max-width: $breakpoint-sm)
            margin-top 10px
          @media screen and (max-width: $breakpoint-md)
            .q-btn-inner
              i
                margin 0px

              div
                display none

            .absolute-full
              svg
                margin 0px

    .image
      background-repeat no-repeat
      background-size 100% cover
      background-position center center
      height 50px
      overflow hidden

    table td
      word-wrap break-word !important
      overflow-wrap break-word !important
      white-space inherit !important

  #mediaEditFileModal
    .img-fluid
      width 50%

</style>
