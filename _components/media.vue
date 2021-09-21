<template>
  <div id="mediaMasterComponent" class="q-mb-lg">
    <!--Crud folders-->
    <crud :crud-data="import('@imagina/qmedia/_crud/folder')" type="onlyUpdate" ref="crudFolders"
          @created="refreshData" @updated="refreshData" @deleted="refreshData"
          :custom-data="customCrudData.folder"/>

    <!--Crud Files-->
    <crud :crud-data="import('@imagina/qmedia/_crud/files')" type="onlyUpdate" ref="crudFiles"
          @created="refreshData" @updated="refreshData" @deleted="refreshData"
          :custom-data="customCrudData.file"/>

    <!--Page Actions-->
    <div class="box box-auto-height q-mb-md">
      <page-actions :extra-actions="pageActions" title="Media" @search="val => {filter.search = val}"/>
    </div>

    <!--Bread crumb-->
    <div class="box box-auto-height q-mb-md">
      <breadcrumb-component ref="breadcrumbComponent" :params="filter" @selected="setFolder"/>
    </div>

    <!---Recent Files-->
    <div class="box box-auto-height q-mb-md">
      <file-list-component v-bind="fileListParams.recentFiles" @selected="setFolder"/>
    </div>

    <!---Folders Files-->
    <div class="box box-auto-height q-mb-md">
      <file-list-component v-bind="fileListParams.folderFiles" @selected="setFolder"/>
    </div>

    <!---Other Files-->
    <div class="box box-auto-height q-mb-md">
      <file-list-component v-bind="fileListParams.otherFiles"/>
    </div>
  </div>
</template>
<script>
//components
import breadcrumbComponent from '@imagina/qmedia/_components/blocks/breadcrumb'
import fileListComponent from '@imagina/qsite/_components/master/fileList'

export default {
  beforeDestroy() {
    this.$root.$off('page.data.refresh')
  },
  props: {
    disk: {default: 'publicmedia'}
  },
  components: {
    breadcrumbComponent,
    fileListComponent
  },
  watch: {},
  mounted() {
    this.$nextTick(function () {
      this.init()
    })
  },
  data() {
    return {
      loading: false,
      data: [],
      listView: false,
      filter: {
        search: null,
        folderId: 0
      },
      filesComponent: null
    }
  },
  computed: {
    //page actions
    pageActions() {
      return [
        'search',
        {
          label: this.$tr('qmedia.layout.newFolder'),
          props: {
            icon: 'fas fa-folder-plus',
            label: this.$tr('qmedia.layout.newFolder'),
            round: false,
            rounded: true,
            padding: 'xs md',
            color: 'green'
          },
          action: () => this.$refs.crudFolders.create()
        },
        {
          label: this.$tr('qmedia.layout.newFile'),
          props: {
            icon: 'fas fa-file-upload',
            label: this.$tr('qmedia.layout.newFile'),
            round: false,
            rounded: true,
            padding: 'xs md',
            color: 'green'
          },
          action: () => this.$refs.crudFiles.create()
        }
      ]
    },
    //Item actions to file list
    itemFileListActions() {
      //Instance main actions
      let mainActions = [
        {
          label: this.$tr('ui.label.edit'),
          icon: 'fas fa-pen',
          action: (item) => {
            if (item.isFolder) this.$refs.crudFolders.update(item)
            else this.$refs.crudFiles.update(item)
          }
        },
        {
          label: this.$tr('ui.label.delete'),
          icon: 'fas fa-trash',
          action: (item) => {
            if (item.isFolder) this.$refs.crudFolders.delete(item)
            else this.$refs.crudFiles.delete(item)
          }
        }
      ]

      //Instance download action
      let downloadAction = {
        label: this.$tr('ui.label.download'),
        vIf: this.$auth.hasAccess('media.medias.download'),
        icon: 'fas fa-file-download',
        action: (item) => this.$helper.downloadFromURL(item.path)
      }

      //Response
      return {
        mainActions: mainActions,
        includeDownload: [downloadAction, ...mainActions]
      }
    },
    //Params to component files
    fileListParams() {
      return this.$clone({
        recentFiles: {
          ref: 'recentFilesComponent',
          key: 'recentFiles',
          icon: 'fas fa-hourglass-half',
          title: this.$trp('ui.label.recent'),
          itemActions: this.itemFileListActions.includeDownload,
          loadFiles: {
            apiRoute: 'apiRoutes.qmedia.files',
            requestParams: {
              take: 6,
              filter: {
                ...this.filter,
                search: null,
                order: {
                  field: 'created_at',
                  way: 'desc'
                }
              }
            }
          }
        },
        folderFiles: {
          ref: 'foldersFilesComponent',
          key: 'foldersContent',
          gridType: 'chip',
          icon: 'fas fa-folder-open',
          title: this.$trp('ui.label.folder'),
          allowCounter: true,
          allowOrder: true,
          itemActions: this.itemFileListActions.mainActions,
          allowPagination: true,
          loadFiles: {
            apiRoute: 'apiRoutes.qmedia.files',
            requestParams: {
              take: 24,
              filter: {
                ...this.filter,
                isFolder: true,
                order: {
                  field: 'filename',
                  way: 'asc'
                }
              }
            }
          }
        },
        otherFiles: {
          ref: 'otherFilesComponent',
          key: 'otherFiles',
          icon: 'fas fa-photo-video',
          title: this.$trp('ui.label.file'),
          allowCounter: true,
          allowOrder: true,
          itemActions: this.itemFileListActions.includeDownload,
          allowPagination: true,
          allowChangeView: true,
          loadFiles: {
            apiRoute: 'apiRoutes.qmedia.files',
            requestParams: {
              take: 24,
              filter: {
                ...this.filter,
                isFolder: false,
                order: {
                  field: 'filename',
                  way: 'asc'
                }
              }
            }
          }
        }
      })
    },
    //Custom crud params
    customCrudData() {
      return {
        folder: {
          formLeft: {
            disk: {value: this.disk},
            parentId: {
              value: this.filter.folderId ? this.filter.folderId : '0',
              type: 'treeSelect',
              props: {
                label: this.$tr('ui.form.parent'),
                clearable: false,
                options: [
                  {label: this.$tr('ui.message.noValue'), value: '0', id: '0'}
                ]
              },
              loadOptions: {
                apiRoute: 'apiRoutes.qmedia.files',
                requestParams: {filter: {isFolder: true}},
                select: {label: 'filename', id: 'id', parentId: 'folderId'}
              }
            },
          }
        },
        file: {
          formLeft: {
            disk: {value: this.disk},
            folderId: {
              value: this.filter.folderId ? this.filter.folderId : '0',
              type: 'treeSelect',
              props: {
                label: this.$tr('ui.label.folder'),
                clearable: false,
                options: [
                  {label: this.$tr('ui.message.noValue'), value: '0', id: '0'}
                ]
              },
              loadOptions: {
                apiRoute: 'apiRoutes.qmedia.files',
                requestParams: {filter: {isFolder: true}},
                select: {label: 'filename', id: 'id', parentId: 'folderId'}
              }
            }
          }
        }
      }
    }
  },
  methods: {
    init() {
      this.$root.$on('page.data.refresh', () => this.refreshData())
    },
    //Set folder
    setFolder(file) {
      if (file.isFolder) this.filter = {folderId: file.id, search: null}
    },
    //Refresh Data
    refreshData() {
      setTimeout(() => {
        this.$refs.breadcrumbComponent.getData(true)
        this.$refs.recentFilesComponent.getData(true)
        this.$refs.foldersFilesComponent.getData(true)
        this.$refs.otherFilesComponent.getData(true)
      }, 100)
    }
  }
}
</script>
<style lang="stylus">
//#mediaMasterComponent
</style>
