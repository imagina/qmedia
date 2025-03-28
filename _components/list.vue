<template>
  <div id="mediaList" class="row">
    <!--== Table ==-->
    <div class="col-12 backend-page relative-position">
      <!--== Table ==-->
      <q-table
        :rows="dataTable"
        :columns="columnsTable"
        :pagination.sync="pagination"
        selection="multiple"
        :selected.sync="rowsSelected"
        row-key="filename"
        @request="getData"
        class="box-table"
      >
        <!--Header-->
        <template v-slot:top>
          <div class="row table-top col-12">
            <!--Table slot left-->
            <div class="table-top-left col-12 col-md-5 col-lg-4 col-xl-3">
              <!---Search-->
              <q-input clearable v-model="filter.search" dense outlined debounce="800" style="max-width: 250px"
                       :placeholder="`${$tr('isite.cms.label.search',{capitalize : true})}...`"
                       @update:modelValue="getData({pagination:pagination,search:filter.search})">
                <template v-slot:append>
                  <q-icon name="fas fa-search" />
                </template>
              </q-input>
            </div>
            <!--Table slot Right-->
            <div class="table-top-right col-12 col-md-7 col-lg-8 col-xl-9 text-right">
              <div class="row justify-end items-center full-width">
                <!--Button Move file -->
                <q-btn color="teal" icon="fas fa-arrows-alt" rounded unelevated
                       @click="getFolders(); dialogMove=true"
                       :label="$tr('isite.cms.label.move')"
                       v-if="rowsSelected.length" />
                <!--Button delete file -->
                <q-btn color="red-14" icon="fas fa-trash" class="q-ml-xs"
                       @click="dialogDeleteGlobal.handler()"
                       :label="$tr('isite.cms.label.delete')" rounded unelevated
                       v-if="rowsSelected.length" />
                <!--Button add folder -->
                <q-btn color="green" icon="fas fa-folder-plus" class="q-ml-xs"
                       @click="dialogCreateFolder=true" rounded unelevated
                       :label="$tr('media.cms.newFolder')"
                       v-if="$hasAccess('media.folders.create')"
                />
                <!--Button add file -->
                <q-btn color="blue" icon="fas fa-file-upload" class="q-ml-xs"
                       @click="uploadFile = !uploadFile" :loading="loadingUploadFile"
                       :label="$tr('media.cms.uploadFile')" rounded unelevated
                       v-if="$hasAccess('media.medias.create')">
                  <template v-slot:loading>
                    <q-spinner class="on-left" />
                    <span class="q-hide q-md-show">{{ $tr('isite.cms.label.loading') }}...</span>
                  </template>
                </q-btn>
                <!---Uploader Files-->
                <q-uploader
                  :key="uploaderID"
                  multiple v-show="false"
                  auto-expand
                  field-name="file"
                  :factory="files => factoryUploader(files)"
                  @fail="$alert.error({message: `${this.$tr('isite.cms.message.recordNoCreated')}`})"
                  @finish="finishUploadFiles(); loadingUploadFile = false"
                  hide-upload-button
                  ref="uploadComponent"
                  @added="()=>{$refs.uploadComponent.upload(); loadingUploadFile = true}" />
                <!--Button refresh -->
                <q-btn color="info" icon="fas fa-sync" class="q-ml-xs" rounded unelevated
                       @click="getData({pagination:pagination,search:filter.search},true)">
                  <q-tooltip>{{ $tr('isite.cms.label.refresh') }}</q-tooltip>
                </q-btn>
              </div>
            </div>
            <!--Breadcrumb-->
            <div class="table-top-filters col-12 q-pt-md">
              <q-breadcrumbs>
                <q-breadcrumbs-el v-for="(breadcrumb,index) in breadcrumbs" :key="index" :label="breadcrumb.name"
                                  color="primary" @click.native="getDataByFolder(breadcrumb)"
                                  style="cursor: pointer" />
              </q-breadcrumbs>
            </div>
          </div>
        </template>

        <!--= Small Thumb or Icon =-->
        <template v-slot:body-cell-small_thumb="props">
          <q-td style="width: 30%" :props="props">
            <q-btn v-if="props.row.isFolder" icon="far fa-folder" flat @click="getDataByFolder(props.row)" rounded
                   unelevated />
            <div v-else-if="props.row.isImage">
              <div class="image" :style="'background-image: url('+props.value+')'" alt="" style="min-width: 60px">
              </div>
            </div>
            <div v-else>
              <q-icon color="grey-8" name="far fa-file-alt" size="40px" />
            </div>
          </q-td>
        </template>

        <!--= File or Folder Name =-->
        <template v-slot:body-cell-filename="props">
          <q-td style="width: 10%" :props="props">
          <span class="q-caption">
            {{ props.value }}
          </span>
          </q-td>
        </template>

        <!--= Actions =-->
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <div v-if="embebed && !props.row.isFolder">
              <q-btn color="blue" :label="$tr('isite.cms.label.select')" size="sm"
                     @click="$emit('data', props.row)" rounded unelevated />
            </div>
            <div v-else-if="!embebed">
              <q-btn icon="fas fa-pen" color="green" size="sm" class="q-mx-xs" round unelevated
                     @click="props.row.isFolder ? editFolder(props.row.filename,true,props.row.id) : editFile(true,props.row)">
                <q-tooltip>{{ $tr('isite.cms.label.edit') }}</q-tooltip>
              </q-btn>
              <q-btn icon="far fa-trash-alt" color="red" size="sm" class="q-mx-xs" round unelevated
                     @click="dialogDeleteItem.handler(props.row.id,props.row.isFolder)">
                <q-tooltip>{{ $tr('isite.cms.label.delete') }}</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
      <!--Loading-->
      <inner-loading :visible="loading" />
    </div>

    <!--= Create Folder Dialog =-->
    <q-dialog v-model="dialogCreateFolder">
      <q-card class="backend-page">
        <!--Header-->
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title>
            <q-icon name="fa fa-folder" class="q-mr-sm" />
            <label>{{ $tr('media.cms.newFolder') }}</label>
          </q-toolbar-title>
          <q-btn flat v-close-popup icon="fas fa-times" />
        </q-toolbar>

        <!--Content-->
        <div class="relative-position q-pa-md">
          <q-form @submit="newFolder()"
                  @validation-error="$alert.error($tr('isite.cms.message.formInvalid'))">
            <q-input :label="$tr('media.cms.form.folderName')"
                     :rules="[val => !!val || $tr('isite.cms.message.fieldRequired')]"
                     v-model="folderName" outlined dense />

            <div class="text-right">
              <q-btn color="green" :label="$tr('isite.cms.label.save')" type="submit"
                     icon="fas fa-save" v-close-popup rounded unelevated />
            </div>

            <inner-loading :visible="loadingCreateFolder" />
          </q-form>
        </div>
      </q-card>
    </q-dialog>

    <!--= update Folder Dialog =-->
    <q-dialog v-model="dialogRenameFolder">
      <q-card class="backend-page">
        <!--Header-->
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title>
            <q-icon name="fa fa-folder" class="q-mr-sm" />
            <label>{{ $tr('media.cms.renameFolder') }}</label>
          </q-toolbar-title>
          <q-btn flat v-close-popup icon="fas fa-times" />
        </q-toolbar>

        <!--Content-->
        <div class="relative-position q-pa-md">
          <q-form @submit="editFolder('',false,false)"
                  @validation-error="$alert.error($tr('isite.cms.message.formInvalid'))">
            <q-input :label="$tr('media.cms.form.folderName')"
                     :rules="[val => !!val || $tr('isite.cms.message.fieldRequired')]"
                     v-model="folderName" outlined dense />

            <div class="text-right">
              <q-btn color="green" :label="$tr('isite.cms.label.save')" type="submit"
                     icon="fas fa-save" v-close-popup rounded unelevated />
            </div>

            <inner-loading :visible="loadingRenameFolder" />
          </q-form>
        </div>
      </q-card>
    </q-dialog>

    <!--= Edit File Dialog =-->
    <q-dialog v-model="dialogEditFile">
      <q-card class="backend-page">
        <!--Header-->
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title>
            <q-icon name="fa fa-folder" class="q-mr-sm" />
            <label>{{ $tr('media.cms.editFile') }}</label>
          </q-toolbar-title>
          <q-btn flat v-close-popup icon="fas fa-times" />
        </q-toolbar>

        <!--Content-->
        <div class="relative-position q-pa-md">
          <q-form @submit="editFile()" ref="formEditFile"
                  @validation-error="$alert.error($tr('isite.cms.message.formInvalid'))">

            <locales v-model="locale" class="q-mb-md" />

            <!--Form-->
            <div v-if="locale.success">
              <div class="text-center">
                <img class="img-fluid" style="max-width: 200px"
                     :src="fileForm.path ? fileForm.path : ''" alt="">
              </div>
              <q-input :label="$tr('media.cms.form.altAttribute')"
                       v-model="locale.formTemplate.alt_attribute" outlined dense />
              <q-input :label="$tr('isite.cms.label.description')"
                       v-model="locale.formTemplate.description" outlined dense />
              <q-input :label="$tr('media.cms.form.keyWords')"
                       v-model="locale.formTemplate.keywords" outlined dense />
              <q-select :label="$trp('isite.cms.label.tag',{capitalize:true})" bg-color="white"
                        v-model="locale.formTemplate.tags" use-input use-chips multiple
                        hide-dropdown-icon input-debounce="0" new-value-mode="add-unique"
                        style="width: 100%" outlined dense />
            </div>

            <div class="text-right">
              <q-btn color="green" :label="$tr('isite.cms.label.save')" type="submit"
                     icon="fas fa-save" v-close-popup rounded unelevated />
            </div>

            <inner-loading :visible="loadingRenameFolder" />
          </q-form>
        </div>
      </q-card>
    </q-dialog>

    <!--= Move Elements Dialog =-->
    <q-dialog v-model="dialogMove">
      <q-card class="backend-page">
        <!--Header-->
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title>
            <q-icon name="fa fa-folder" class="q-mr-sm" />
            <label>{{ $tr('media.cms.moveMedia') }}</label>
          </q-toolbar-title>
          <q-btn flat v-close-popup icon="fas fa-times" />
        </q-toolbar>

        <!--Content-->
        <div class="relative-position q-pa-md">
          <q-form @submit="moveElements()"
                  @validation-error="$alert.error($tr('isite.cms.message.formInvalid'))">

            <q-select :label="$tr('media.cms.form.moveTo')" v-model="folderSelected"
                      :options="selectFolders" outlined dense emit-value map-options />

            <div class="text-right">
              <q-btn color="green" :label="$tr('isite.cms.label.confirm')" type="submit"
                     icon="fas fa-save" v-close-popup rounded unelevated />
            </div>

            <inner-loading :visible="loadingRenameFolder" />
          </q-form>
        </div>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
/*Plugins*/
import axios from 'axios';
import { uid } from 'quasar';
import _cloneDeep from 'lodash.clonedeep';

/*Services*/
import mediaService from 'modules/qmedia/_services/index';

export default {
  props: {
    disk: { default: null },
    embebed: {
      type: Boolean,
      default: false
    }
  },
  emits: ['data'],
  components: {},
  watch: {
    uploadFile(newValue) {
      if (newValue) this.$refs.uploadComponent.pickFiles();
    }
  },
  mounted() {
    this.$nextTick(function() {
      this.breadcrumbs = this.defaultBreadCrum;
      this.getData({ pagination: this.pagination, search: this.filter.search }, this.embebed);
    });
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
          keywords: ''
        }
      },
      folderSelected: null,
      selectFolders: [{
        label: 'Home',
        value: 0
      }],
      uploaderID: uid(),
      uploaderUrl: this.$axios.defaults.baseURL.replace('/api', config('apiRoutes.qmedia.files')),
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
      headers: [{
        name: 'Authorization',
        value: this.$store.state.quserAuth.userToken
      }],
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
      }
    };
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
          field: 'thumbnails', align: 'center',
          format: val => {
            if (!val) return '';
            let itemFile = val.find(item => item.name == 'smallThumb');
            return itemFile ? itemFile.path : '';
          }
        },
        {
          name: 'filename', label: this.$tr('isite.cms.form.name'),
          field: 'filename', align: 'left'
        },
        {
          name: 'createdAt', label: this.$tr('isite.cms.form.createdAt'),
          field: 'createdAt',
          format: val => val ? this.$trd(val) : '-',
          align: 'right', sortable: true
        },
        {
          name: 'actions', label: this.$tr('isite.cms.form.actions'), align: 'center'
        }

      ];
    },
    dialogDeleteGlobal() {
      return {
        handler: () => {
          this.$q.dialog({
            title: this.$tr('isite.cms.label.confirm'),
            ok: this.$tr('isite.cms.label.delete'),
            message: this.$tr('isite.cms.message.deleteRecord'),
            cancel: this.$tr('isite.cms.label.cancel'),
            color: 'red'
          }).onOk(() => {
            this.deleteElements();
          }).onCancel(() => {
          });
        }
      };
    },
    dialogDeleteItem() {
      return {
        handler: (id, isFolder) => {
          this.$q.dialog({
            title: this.$tr('isite.cms.label.confirm'),
            ok: this.$tr('isite.cms.label.delete'),
            message: this.$tr('isite.cms.message.deleteRecord'),
            cancel: this.$tr('isite.cms.label.cancel')
          }).onOk(() => {
            this.deleteElement(id, isFolder);
          }).onCancel(() => {
          });
        }
      };
    },
    defaultBreadCrum() {
      return [{ id: 0, name: this.$tr('isite.cms.label.home') }];
    },
    //default disk
    mediaDisk() {
      return this.disk || this.$getSetting('media::filesystem');
    }
  },
  methods: {
    async getData({ pagination, search }, refresh = false) {
      this.loading = true;
      // clear storage cache
      if (refresh) {
        this.$cache.remove('apiRoutes.qmedia.files');
      }

      let params = {
        params: {
          page: pagination.page,
          take: pagination.rowsPerPage,
          filter: {
            ...this.filter,
            disk: this.mediaDisk
          }
        },
        refresh: refresh
      };

      // if folderId is not root path
      if (this.filter.folderId != 0) {
        let breacrumb = await this.$crud.show('apiRoutes.qmedia.breadcrumb', this.filter.folderName, params);
        this.breadcrumbs = breacrumb.data;
      } else
        // reseting breadcrumb
      {
        this.breadcrumbs = this.defaultBreadCrum;
      }

      // index all media by params
      this.$crud.index('apiRoutes.qmedia.files', params).then(response => {
        this.dataTable = response.data;
        this.pagination.rowsPerPage = pagination.rowsPerPage;
        this.pagination.page = pagination.page;
        this.pagination.rowsNumber = response.meta.page.total;
        this.loading = false;
      }).catch(error => {
        this.$apiResponse.handleError(error, () => {
          this.$alert.error({ message: this.$tr('isite.cms.message.errorRequest'), pos: 'bottom' });
          this.loading = false;
        });
      });
    },
    /**
     * changing data by folderId
     * @param folderId
     * @param refresh
     */
    getDataByFolder(folder, refresh = false) {
      this.filter.search = '';
      this.filter.folderId = folder.id;
      this.filter.folderName = folder.filename || folder.name;
      this.getData({ pagination: this.pagination, search: this.filter.search }, refresh);
    },

    /**
     * creating new folder
     * @param okFn
     */
    newFolder() {
      this.loadingFolder = true;
      let data = {
        name: this.folderName,
        parent_id: this.filter.folderId
      };

      mediaService.crud.create('apiRoutes.qmedia.folders', data).then(reponse => {
        this.loadingFolder = false;
        this.$alert.success({ message: `${this.$tr('isite.cms.message.recordCreated')}` });
        this.getData({ pagination: this.pagination, search: this.filter.search }, true);
      }).catch(error => {
        this.loadingFolder = false;
        this.$alert.error({ message: `${this.$tr('isite.cms.message.recordNoCreated')}` });
      });
    },
    /**
     * move elements selected on q-table component
     * @param okFn
     */
    moveElements() {
      this.loadingMove = true;
      let data = {

        destinationFolder: this.folderSelected,
        files: this.rowsSelected

      };

      mediaService.crud.create('apiRoutes.qmedia.batchMove', data).then(reponse => {
        this.loadingMove = false;
        this.rowsSelected = [];
        this.$alert.success({ message: this.$tr('isite.cms.message.recordUpdated') });
        this.getData({ pagination: this.pagination, search: this.filter.search }, true);
      }).catch(error => {
        this.loadingMove = false;
        this.$alert.error({ message: this.$tr('isite.cms.message.recordNoUpdated') });
      });
    },

    /**
     * finish upload files event from q-uploader component
     */
    finishUploadFiles() {
      this.uploadFile = false;
      this.uploaderID = uid();
      this.$alert.success({ message: `${this.$tr('isite.cms.message.recordCreated')}` });
      this.getDataByFolder({ id: this.filter.folderId, name: this.filter.folderName }, true);
    },
    getFolders() {
      let params = {
        params: {
          filter: {
            isFolder: true
          }
        }
      };

      mediaService.crud.index('apiRoutes.qmedia.files', params).then(response => {
        this.selectFolders = [{
          label: 'Home',
          value: 0
        }];
        response.data.forEach((folder) => {
          this.selectFolders.push({
            label: folder.filename,
            value: folder.id
          });
        });
      }).catch(error => {
        this.$apiResponse.handleError(error, () => {
          this.$alert.error({ message: this.$tr('isite.cms.message.errorRequest'), pos: 'bottom' });
        });
      });
    },

    /**
     * delete element on media by id
     * @param id
     * @param isFolder
     */
    deleteElement(id, isFolder) {
      let configRoute = 'apiRoutes.qmedia.files';

      // if is Folder replace configRoute and successMessage
      if (isFolder) {
        configRoute = 'apiRoutes.qmedia.folders';
      }

      mediaService.crud.delete(configRoute, id).then(response => {
        this.$alert.success({ message: `${this.$tr('isite.cms.message.recordDeleted')}` });
        this.getData({ pagination: this.pagination, search: this.filter.search }, true);
      }).catch(error => {
        this.$alert.error({ message: `${this.$tr('isite.cms.message.recordNoDeleted')}` });
      });
    },

    /**
     * deleting multiple elements on media by selected rows on q-table component
     */
    deleteElements() {
      this.loading = true;
      let data = {
        files: this.rowsSelected
      };

      mediaService.crud.create('apiRoutes.qmedia.batchDestroy', data).then(response => {
        this.$alert.success({ message: `${this.$tr('isite.cms.message.recordDeleted')}` });
        this.loading = false;
        this.rowsSelected = [];
        this.getData({ pagination: this.pagination, search: this.filter.search }, true);
      }).catch(error => {
        this.$alert.error({ message: `${this.$tr('isite.cms.message.recordNoDeleted')}` });
      });
    },
    /**
     * edit folder name
     * @param name
     * @param openDialog
     * @param id
     * @param okFn
     */
    editFolder(name, openDialog, id = false) {
      // if openDialog its true, just opened
      if (openDialog) {
        this.idFolderToEdit = id;
        this.folderName = name;
        this.dialogRenameFolder = true;
      } else { // else: send folder data to the service
        this.loadingRenameFolder = true;
        let data = {
          id: this.idFolderToEdit,
          name: this.folderName,
          parent_id: this.filter.folderId
        };

        mediaService.crud.update('apiRoutes.qmedia.folders', this.idFolderToEdit, data).then(response => {
          this.loadingRenameFolder = false;
          this.rowsSelected = [];
          this.$alert.success({ message: this.$tr('isite.cms.message.recordUpdated') });
          this.getData({ pagination: this.pagination, search: this.filter.search }, true);
        }).catch(error => {
          this.loadingRenameFolder = false;
          this.$alert.error({ message: this.$tr('isite.cms.message.recordNoUpdated') });
        });
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
        this.loadingEditFile = true;
        let data = _cloneDeep(this.locale.form);
        data['id'] = this.fileForm.id;

        mediaService.createItem('apiRoutes.qmedia.files', data.id, data, { params: {} }).then(response => {
          this.loadingEditFile = false;
          this.rowsSelected = [];
          this.fileForm = {};
          this.dialogEditFile = false;
          this.$alert.success({ message: this.$tr('isite.cms.message.recordUpdated') });
          this.getData({ pagination: this.pagination, search: this.filter.search }, true);
        }).catch(error => {
          this.loadingEditFile = false;
          this.$alert.error({ message: this.$tr('isite.cms.message.recordNoUpdated') });
        });
      }
    },

    //Factory uploader
    factoryUploader(files) {
      return {
        url: `${this.$axios.defaults.baseURL}${config('apiRoutes.qmedia.files')}`,
        method: 'POST',
        extensions: '.gif,.jpg,.jpeg,.png,.pdf',
        formFields: [
          { name: 'parent_id', value: this.filter.folderId },
          { name: 'Content-Type', value: files[0].type },
          { name: 'disk', value: this.mediaDisk }
        ],
        headers: [
          { name: 'Authorization', value: this.$store.state.quserAuth.userToken }
        ]
      };
    }
  }
};
</script>
<style lang="scss">
#mediaList {
  .table-top {
    .table-top-right {
      .q-btn {
        @media screen and (max-width: $breakpoint-sm) {
          margin-top: 10px;
        }
        @media screen and (max-width: $breakpoint-md) {
          .q-btn-inner {
            i {
              margin: 0px;
            }

            div {
              display: none;
            }
          }
          .absolute-full {
            svg {
              margin: 0px;
            }
          }
        }
      }
    }
  }

  .image {
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center center;
    height: 70px;
    width: auto;
    overflow: hidden;
  }

  table td {
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
    white-space: inherit !important;
  }
}

#mediaEditFileModal {
  .img-fluid {
    width: 50%;
  }
}
</style>
