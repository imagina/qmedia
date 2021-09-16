<template>
  <div id="mediaMasterComponent" class="q-mb-lg">
    <!--Crud folders-->
    <crud :crud-data="import('@imagina/qmedia/_crud/folder')" type="onlyUpdate" ref="crudFolders"
          @created="refreshData" @updated="refreshData" :custom-data="customCrudData.folder"/>

    <!--Crud Files-->
    <crud :crud-data="import('@imagina/qmedia/_crud/files')" type="onlyUpdate" ref="crudFiles"
          @created="refreshData" @updated="refreshData" :custom-data="customCrudData.file"/>

    <!--Top Content-->
    <div class="box box-auto-height q-mb-md">
      <!--Page Actions-->
      <page-actions :extra-actions="pageActions" title="Media" @search="val => {filter.search = val}"/>
      <!--Bread crumb-->
      <breadcrumb-component ref="breadcrumbComponent" :params="filter" @selected="setFolder"/>
    </div>

    <!--Media content-->
    <div id="mediaContent" class="box">
      <!---Recent Files-->
      <file-list-component grid-card ref="recentFilesComponent" :params="filesParams.recentFiles"
                           @selected="setFolder" :key="$uid()" rows-per-page="6" :title="$trp('ui.label.recent')"
                           no-pagination class="q-px-md q-mb-lg"/>
      <!---Folders Files-->
      <file-list-component v-if="!listView" grid-chip ref="foldersFilesComponent" :params="filesParams.folderFiles"
                           @selected="setFolder" rows-per-page="24" :title="$trp('ui.label.folder')" counter order
                           class="q-px-md q-mb-lg" :key="$uid()"/>
      <!---Other Files-->
      <file-list-component v-if="!listView" grid-card ref="otherFilesComponent" :params="filesParams.otherFiles"
                           @selected="setFolder" rows-per-page="18" :title="$trp('ui.label.file')" counter order
                           class="q-px-md" :key="$uid()"/>
      <!---Table Files-->
      <file-list-component v-if="listView" ref="tableFilesComponent" :params="filesParams.tableFiles"
                           @selected="setFolder" rows-per-page="20" class="q-px-md" :key="$uid()"/>
    </div>
  </div>
</template>
<script>
//components
import breadcrumbComponent from '@imagina/qmedia/_components/blocks/breadcrumb'
import fileListComponent from '@imagina/qmedia/_components/blocks/fileList'

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
        },
        {
          label: this.$tr(`ui.message.${this.listView ? 'gribView' : 'listView'}`),
          props: {
            icon: this.listView ? 'fas fa-grip-horizontal' : 'fas fa-list-ul'
          },
          action: () => this.listView = !this.listView
        },
      ]
    },
    //Params to component files
    filesParams() {
      return {
        recentFiles: {
          ...this.filter,
          search: null,
          order: {
            field: 'created_at',
            way: 'desc'
          }
        },
        folderFiles: {
          ...this.filter,
          isFolder: true,
          order: {
            field: 'filename',
            way: 'asc'
          }
        },
        otherFiles: {
          ...this.filter,
          isFolder: false,
          order: {
            field: 'filename',
            way: 'asc'
          }
        },
        tableFiles: {
          ...this.filter,
          order: {
            field: 'created_at',
            way: 'desc'
          }
        }
      }
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
    setFolder(folderId = false) {
      this.filter = {folderId: folderId, search: null}
    },
    //Refresh Data
    refreshData() {
      setTimeout(() => {
        this.$refs.breadcrumbComponent.getData(true)
        this.$refs.recentFilesComponent.getData(true)
        //As list view
        if (this.listView) {
          this.$refs.tableFilesComponent.getData(true)
        } else {
          this.$refs.foldersFilesComponent.getData(true)
          this.$refs.otherFilesComponent.getData(true)
        }
      }, 100)
    }
  }
}
</script>
<style lang="stylus">
</style>
