<template>
  <div id="mediaMasterComponent" class="q-mb-lg">
    <!--Media content-->
    <div id="mediaContent" class="bg-white q-py-md">
      <!---Actions-->
      <div id="mediaActions" class="row q-mb-md q-px-md">
        <!--Search-->
        <div class="col-12 col-md-4 col-xl-3">
          <dynamic-field :field="{value : null, type : 'search'}" v-model="filter.search"/>
        </div>
        <!--Actions-->
        <div class="col-12 col-md-8 col-xl-9">
          <div class="row q-gutter-xs justify-end full-width">
            <!--Toggle view as grid-->
            <q-btn round unelevated size="12px" style="font-size: 8px; padding: 6px"
                   color="light-blue" @click="listView = !listView"
                   :icon="listView ? 'fas fa-grip-horizontal' : 'fas fa-list-ul'">
              <q-tooltip>{{ $tr(`ui.message.${listView ? 'gribView' : 'listView'}`) }}</q-tooltip>
            </q-btn>
            <!--New File-->
            <q-btn round unelevated size="12px" style="font-size: 8px; padding: 6px"
                   color="green" icon="fas fa-plus">
              <!---Menu actions-->
              <q-menu anchor="bottom right" self="top right">
                <q-list style="min-width: 100px">
                  <q-item clickable v-close-popup v-for="(item, itemKey) in createActions" :key="itemKey"
                          @click.native="item.action()">
                    <q-item-section>
                      <div class="row items-center">
                        <q-icon :name="item.icon" class="q-mr-sm" color="blue-grey" size="18px"/>
                        {{ item.label }}
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
              <!--Tooltip-->
              <q-tooltip>{{ $tr('qmedia.layout.newFile') }}</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>
      <!--Bread crumb-->
      <breadcrumb-component ref="breadcrumbComponent" :params="filter" @selected="setFolder" class="q-mb-md"/>
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
    <!--Crud folders-->
    <crud :crud-data="import('@imagina/qmedia/_crud/folder')" type="onlyUpdate" ref="crudFolders"
          @created="refreshData" @updated="refreshData" :custom-data="customCrudData.folder"/>
    <!--Crud Files-->
    <crud :crud-data="import('@imagina/qmedia/_crud/files')" type="onlyUpdate" ref="crudFiles"
          @created="refreshData" @updated="refreshData" :custom-data="customCrudData.file"/>
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
    //Actions to create file
    createActions() {
      return [
        {
          label: this.$tr('qmedia.layout.newFolder'),
          icon: 'fas fa-folder-plus',
          action: () => this.$refs.crudFolders.create()
        },
        {
          label: this.$tr('qmedia.layout.newFile'),
          icon: 'note_add',
          action: () => this.$refs.crudFiles.create()
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
