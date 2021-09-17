<template>
  <div id="mediaMasterComponent" class="q-mb-lg">
    <!--Crud folders-->
    <crud :crud-data="import('@imagina/qmedia/_crud/folder')" type="onlyUpdate" ref="crudFolders"
          @created="refreshData" @updated="refreshData" :custom-data="customCrudData.folder"/>

    <!--Crud Files-->
    <crud :crud-data="import('@imagina/qmedia/_crud/files')" type="onlyUpdate" ref="crudFiles"
          @created="refreshData" @updated="refreshData" :custom-data="customCrudData.file"/>

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
      <file-list-component ref="recentFilesComponent" :params="filesParams.recentFiles" key="recentFiles"
                           grid-card no-pagination :title="$trp('ui.label.recent')" icon="fas fa-hourglass-half"
                           @selected="setFolder" rows-per-page="6"/>
    </div>

    <!---Folders Files-->
    <div class="box box-auto-height q-mb-md">
      <file-list-component ref="foldersFilesComponent" :params="filesParams.folderFiles" key="foldersContent"
                           grid-chip counter order :title="$trp('ui.label.folder')" icon="fas fa-folder-open"
                           rows-per-page="24" @selected="setFolder"/>
    </div>

    <!---Other Files-->
    <div class="box box-auto-height q-mb-md relative-position">
      <!--List-->
      <file-list-component ref="otherFilesComponent" :params="filesParams.otherFiles" key="otherFiles"
                           counter :grid-card="!listView" order :title="$trp('ui.label.file')" icon="fas fa-photo-video"
                           rows-per-page="24"/>
      <!--toogle view-->
      <q-btn :icon="listView ? 'fas fa-grip-horizontal' : 'fas fa-list-ul'" class="btn-toggle-view btn-small"
             @click="listView = !listView" round unelevated outline color="blue-grey">
        <q-tooltip>{{ this.$tr(`ui.message.${this.listView ? 'gribView' : 'listView'}`) }}</q-tooltip>
      </q-btn>
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
        }
      ]
    },
    //Params to component files
    filesParams() {
      return this.$clone({
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
    setFolder(folderId = false) {
      this.filter = {folderId: folderId, search: null}
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
#mediaMasterComponent
  .btn-toggle-view
    position absolute
    top 7px
    right 15px
</style>
