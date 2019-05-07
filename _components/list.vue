<template>
  <div id="mediaList" class="row">
    <!--== Button Group ==-->
    <div class="col-12 text-right">
      <!--== Button Group ==-->
      <q-btn-group push>
        <q-btn push color="positive" label="New Folder" @click="dialogCreateFolder=true" />
        <q-btn push color="blue" label="Upload File" @click="uploadFile = !uploadFile" />
        <q-btn push color="amber" label="Move" @click="getFolders();dialogMove=true" :disable="!rowsSelected.length"/>
        <q-btn push color="red-14" label="Delete" @click="dialogDeleteGlobal.handler()" :disable="!rowsSelected.length"/>
      </q-btn-group>
    </div>
    <!--== Uploader Files ==-->
    <div class="col-12 text-right">
      <q-collapsible icon="explore" header-style="display:none" v-model="uploadFile">
        <div>
          <!--== Uploader Files ==-->
          <q-uploader
            :key="uploaderID"
            :url="uploaderUrl"
            multiple
            method="POST"
            extensions=".gif,.jpg,.jpeg,.png,.pdf"
            auto-expand
            :additional-fields="additionalFields"
            @fail="alert.error('File failed','bottom',false,2500)"
            @finish="finishUploadFiles"
            :headers="headers" />
        </div>
      </q-collapsible>
    </div>
    <!--== Breadcrumb ==-->
    <q-breadcrumbs>
      <q-breadcrumbs-el v-for="(breadcrumb,index) in breadcrumbs" :key="index" :label="breadcrumb.name" @click.native="getDataByFolder(breadcrumb.id)" style="cursor: pointer"/>
    </q-breadcrumbs>
 
    <!--== Table ==-->
    <div class="col-12">
      <!--== Table ==-->
      <q-table
        :loading="loading"
        :data="dataTable"
        :columns="columns"
        :pagination.sync="pagination"
        selection="multiple"
        :selected.sync="rowsSelected"
        row-key="filename"
        color="secondary"
        @request="getData"
      >
        <!--= Search =-->
        <template slot="top-left" slot-scope="props">
        
          <q-search
            hide-underline
            clearable
            color="secondary"
            v-model="filter.search"
            @input="getData({pagination:pagination,search:filter.search})"
          />
        </template>
        <!--= Full Page =-->
        <template slot="top-right" slot-scope="props">
          <div class="row justify-end items-center full-width">
            <q-btn
              flat round dense
              :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
              @click="props.toggleFullscreen"
            />
          </div>
        </template>
        <!--= Small Thumb or Icon =-->
        <q-td slot="body-cell-small_thumb"
              slot-scope="props" :props="props">
          <q-icon  v-if="props.row.is_folder" name="far fa-folder" size="20px" />
          <div v-else>
            <div class="image" :style="'background-image: url('+props.value+')'" alt="">
            </div>
          </div>
        </q-td>
  
        <!--= File or Folder Name =-->
        <q-td slot="body-cell-filename"
              slot-scope="props" :props="props">
          <q-btn v-if="props.row.is_folder" class="q-caption" flat @click="getDataByFolder(props.row.id)">
            {{props.value}}
          </q-btn>
          <span v-else class="q-caption" >
            {{props.value}}
          </span>
        </q-td>
  
        <!--= Actions =-->
        <q-td slot="body-cell-actions"
              slot-scope="props" :props="props">
          <div v-if="embebed && !props.row.is_folder">
            <q-btn color="primary" label="Use this file" @click="$emit('data', props.row)"/>
          </div>
          <div v-else-if="!embebed">
            <q-btn v-if="props.row.is_folder" icon="fas fa-pen" color="positive" round size="sm" class="q-mx-xs" @click="props.row.is_folder ? editFolder(props.row.filename,true,props.row.id) : editFile(true,props.row)"/>
            <q-btn icon="far fa-trash-alt" color="negative" size="sm" class="q-mx-xs" round @click="dialogDeleteItem.handler(props.row.id,props.row.is_folder)"/>
          </div>
          
        </q-td>
    
      </q-table>
    </div>
    <!--= Create Folder Dialog =-->
    <q-dialog
      v-model="dialogCreateFolder"
      stack-buttons
      prevent-close
    >
      <!-- This or use "title" prop on <q-dialog> -->
      <span slot="title">New Folder</span>
    
      <!-- This or use "message" prop on <q-dialog> -->
      <span slot="message"></span>
    
      <div slot="body" class="relative-position">
        <q-field
          icon="fa fa-folder"
          label="Folder Name"
          :label-width="3"
        >
          <q-input v-model="folderName" />
        </q-field>
        <q-inner-loading :visible="loadingCreateFolder">
          <q-spinner-gears size="50px" color="primary"></q-spinner-gears>
        </q-inner-loading>
      </div>
    
      <template slot="buttons" slot-scope="props">
        <q-btn color="primary" label="Confirm" @click="newFolder(props.ok)" />
        <q-btn flat label="Cancel" @click="props.cancel" />
      </template>
    </q-dialog>
  
    <!--= Edit Folder Dialog =-->
    <q-dialog
      v-model="dialogRenameFolder"
      stack-buttons
      prevent-close
    >
      <!-- This or use "title" prop on <q-dialog> -->
      <span slot="title">Rename Folder</span>
    
      <!-- This or use "message" prop on <q-dialog> -->
      <span slot="message"></span>
    
      <div slot="body" class="relative-position">
        <q-field
          icon="fa fa-folder"
          label="Folder Name"
          :label-width="3"
        >
          <q-input v-model="folderName" />
        </q-field>
        <q-inner-loading :visible="loadingRenameFolder">
          <q-spinner-gears size="50px" color="primary"></q-spinner-gears>
        </q-inner-loading>
      </div>
    
      <template slot="buttons" slot-scope="props">
        <q-btn color="primary" label="Confirm" @click="editFolder('',false,false,props.ok)" />
        <q-btn flat label="Cancel" @click="props.cancel" />
      </template>
    </q-dialog>
  
    <!--= Edit File Dialog =-->
    <q-dialog
      v-model="dialogEditFile"
      stack-buttons
      prevent-close
    >
      <!-- This or use "title" prop on <q-dialog> -->
      <span slot="title">Rename Folder</span>
    
      <!-- This or use "message" prop on <q-dialog> -->
      <span slot="message"></span>
    
      <div slot="body" class="relative-position">
        <q-field
          icon="fa fa-folder"
          label="Folder Name"
          :label-width="3"
        >
          <q-input v-model="fileForm" />
        </q-field>
        <q-inner-loading :visible="loadingEditFile">
          <q-spinner-gears size="50px" color="primary"></q-spinner-gears>
        </q-inner-loading>
      </div>
    
      <template slot="buttons" slot-scope="props">
        <q-btn color="primary" label="Confirm" @click="editFolder('',false,false,props.ok)" />
        <q-btn flat label="Cancel" @click="props.cancel" />
      </template>
    </q-dialog>
  
    <!--= Move Elements Dialog =-->
    <q-dialog
      v-model="dialogMove"
      stack-buttons
      prevent-close
    >
      <!-- This or use "title" prop on <q-dialog> -->
      <span slot="title">Move Media</span>
    
      <!-- This or use "message" prop on <q-dialog> -->
      <span slot="message"></span>
    
      <div slot="body" class="relative-position">
        <q-field
          icon="fa fa-folder"
          label="To"
          :label-width="3"
        >
          <q-select
            v-model="folderSelected"
            :options="selectFolders"
          />
      
        </q-field>
        <q-inner-loading :visible="loadingMove">
          <q-spinner-gears size="50px" color="primary"></q-spinner-gears>
        </q-inner-loading>
      </div>
    
      <template slot="buttons" slot-scope="props">
        <q-btn color="primary" label="Confirm" @click="moveElements(props.ok)" />
        <q-btn flat label="Cancel" @click="props.cancel" />
      </template>
    </q-dialog>
  </div>
</template>

<script>
  /*Plugins*/
  import {alert} from '@imagina/qhelper/_plugins/alert'
  import axios from 'axios';
  import config from 'src/config/index'
  import {uid} from 'quasar'
  
  /*Services*/
  import mediaService from '@imagina/qmedia/_services/index'
  
  export default {
    props: {
      embebed: {
        type: Boolean,
        default: false
      },
    },
    components: {},
    watch: {},
    computed: {
      /**
       * Additional fields for uploader http request
       * @returns {*[]}
       */
      additionalFields(){
        return [
          {
            name:'parent_id',
            value: this.filter.folderId
          }
        ];
      }
    },
    mounted() {
      this.$nextTick(function () {
        this.getData({pagination:this.pagination,search:this.filter.search},this.embebed);
      })
    },
    data() {
      return {
        folderSelected: null,
        selectFolders: [{
          label: 'Root',
          value: 0
        }],
        uploaderID: uid(),
        uploaderUrl: config('apiRoutes.media.file'),
        folderName:'',
        idFolderToEdit:'',
        idFileToEdit:'',
        dialogEditFile: false,
        dialogCreateFolder: false,
        dialogRenameFolder: false,
        dialogMove: false,
        fileForm: {
        
        },
        dialogDeleteGlobal:{
          handler: () => {
            this.$q.dialog({
              title:'Confirm',
              ok: 'Delete',
              message: '¿Estás seguro que quieres eliminar este registro?',
              cancel: 'Cancel'
            }).then(() => {
              this.deleteElements()
            }).catch(() => {
            })
          }
        },
        dialogDeleteItem:{
          handler: (id,isFolder) => {
            this.$q.dialog({
              title:'Confirm',
              ok: 'Delete',
              message: '¿Estás seguro que quieres eliminar este registro?',
              cancel: 'Cancel'
            }).then(() => {
              this.deleteElement(id,isFolder)
            }).catch(() => {
            })
          }
        },
        rowsSelected: [],
        uploadFile: false,
        breadcrumbs:[
          {
            id: 0,
            name: "Home"
          }
        ],
        headers:{
          'Authorization':this.$store.state.auth.userToken
        },
        filter:{
          search:'',
          folderId: 0
        },
        show: false,
        loading: false,
        loadingCreateFolder: false,
        loadingEditFile: false,
        loadingRenameFolder: false,
        loadingMove: false,
        loadingDelete: false,
        dataTable: [],
        columns: [
          {
            name: 'small_thumb', label:'', field: 'small_thumb',
            align: 'center'
          },
          {
            name: 'filename', label: 'Name',
            field:'filename',
            align: 'center'
          },
          {
            name: 'created_at', label: 'Created at', field: 'created_at',
            format: val => val ? this.$d(this.$moment(val, 'YYYY-MM-DD HH:mm').toDate(), 'short', this.$q.i18n.lang) : '-',
            align: 'left', sortable: true
          },
          {
            name: 'actions', label: 'actions', align: 'center'
          },
        
        ],
        pagination: {
          page: 1,
          rowsPerPage: 15,
          rowsNumber: 1
        },
        
      }
    },
    methods: {
      async getData({pagination, search},refresh = false) {
        this.loading = true
        // clear storage cache
        if(refresh)
          this.$helper.clearCache('apiRoutes.media.allMedia')
        
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
        if (this.filter.folderId != 0){
          let breacrumb = await mediaService.breadcrumb('apiRoutes.media.breadcrumb', this.filter.folderId, {params: {}});
          this.breadcrumbs = breacrumb.data
        }else
          // reseting breadcrumb
          this.breadcrumbs = [
            {
              id: 0,
              name: "Home"
            }
          ]
        
        // index all media by params
        mediaService.crud.index('apiRoutes.media.allMedia',params).then(response => {
          this.dataTable = response.data
          this.pagination.rowsPerPage = response.meta.per_page;
          this.pagination.page = response.meta.current_page;
          this.pagination.rowsNumber = response.meta.total;
          this.loading = false
        })
        
      },
      /**
       * changing data by folderId
       * @param folderId
       * @param refresh
       */
      getDataByFolder(folderId,refresh = false){
        this.filter.folderId = folderId
        this.getData({pagination:this.pagination, search:this.filter.search},refresh)
      },
  
      /**
       * creating new folder
       * @param okFn
       */
      newFolder(okFn){
        this.loadingFolder = true
        let data = {
          name: this.folderName,
          parent_id: this.filter.folderId
        }
        
        mediaService.postRequest('apiRoutes.media.folder', data).then(reponse => {
          okFn()
          this.loadingFolder = false
          alert.success('Folder uploader','top')
          this.getData({pagination:this.pagination,search:this.filter.search},true);
        }).catch(error => {
          this.loadingFolder = false
          alert.error(error.name[0], 'bottom', false, 2500)
        })
        
      },
      /**
       * move elements selected on q-table component
       * @param okFn
       */
      moveElements(okFn){
        
        this.loadingMove = true
        let data = {
          destinationFolder: this.folderSelected,
          files: this.rowsSelected
        }
        
        mediaService.postRequest('apiRoutes.media.move', data).then(reponse => {
          okFn()
          this.loadingMove = false
          this.rowsSelected = []
          alert.success('Elements moved','top')
          this.getData({pagination:this.pagination,search:this.filter.search},true);
        }).catch(error => {
          this.loadingMove = false
          alert.error(error.name[0], 'bottom', false, 2500)
        })
        
      },
  
      /**
       * finish upload files event from q-uploader component
       */
      finishUploadFiles(){
        this.uploadFile = false;
        this.uploaderID = uid();
        alert.success('Files uploaded','top')
        this.getDataByFolder(this.filter.folderId,true)
      },
      getFolders(){
        mediaService.folderList('apiRoutes.media.folder').then(response => {
          this.selectFolders = [{
            label: 'Root',
            value: 0
          }]
          for (let id in response)  {
            this.selectFolders.push({
              label: response[id],
              value: id
            })
          }
          
        })
      },
  
      /**
       * this function is not finished, will be finish on next version
       * @param id
       * @param isFolder
       */
      editElement(id,isFolder){
        console.warn("edit")
      },
  
      /**
       * delete element on media by id
       * @param id
       * @param isFolder
       */
      deleteElement(id,isFolder){
        let successMessage = 'File deleted',
            configRoute = 'apiRoutes.media.file'
        
        // if is Folder replace configRoute and successMessage
        if(isFolder){
          successMessage = 'Folder deleted'
          configRoute = 'apiRoutes.media.folder'
        }
        
        mediaService.crud.delete(configRoute,id).then(response => {
          alert.success(successMessage,'top')
          this.getData({pagination:this.pagination,search:this.filter.search},true);
        }).catch(error => {
          alert.error(error.name[0], 'bottom', false, 2500)
        })
    
    
      },
  
      /**
       * deleting multiple elements on media by selected rows on q-table component
       */
      deleteElements(){
        this.loading = true
        let data = {
          files: this.rowsSelected
        }
        
        mediaService.postRequest('apiRoutes.media.batchDestroy',data).then(response => {
          this.loading = false
          this.rowsSelected = []
          alert.success('Elements deleted','top')
          this.getData({pagination:this.pagination,search:this.filter.search},true);
        })
      },
      /**
       * edit folder name
       * @param name
       * @param openDialog
       * @param id
       * @param okFn
       */
      editFolder(name,openDialog,id = false,okFn = false){
        
        // if openDialog its true, just opened
        if(openDialog){
          this.idFolderToEdit = id
          this.folderName = name;
          this.dialogRenameFolder = true;
        }else{ // else: send folder data to the service
          this.loadingRenameFolder = true
          let data = {
            id: this.idFolderToEdit,
            name: this.folderName,
            parent_id: this.filter.folderId
          }
          
          mediaService.editItem('apiRoutes.media.folder', this.idFolderToEdit, data, {params:{}}).then(response => {
            okFn()
            this.loadingRenameFolder = false
            this.rowsSelected = []
            alert.success('Folder renamed','top')
            this.getData({pagination:this.pagination,search:this.filter.search},true);
          })
        }
      },
  
      /**
       * this function is not finished, will be finish on next version
       * @param openDialog
       * @param row
       */
      editFile(openDialog = false, row = false){
        /*
        if(openDialog){
          this.fileForm = row;
          this.dialogEditFile = true;
        }
        */
      }
    }
    
  }
</script>
<style lang="stylus">
  @import "~variables";
  #mediaList
    .image
      background-repeat no-repeat
      background-size 100% cover
      background-position center center
      height 50px
      overflow hidden

</style>