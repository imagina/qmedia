<template>
  <div id="mediaBreadcrumbComponent">
    <!--Content-->
    <div id="breadcrumbContent" class="row items-center">
      <!--Icon-->
      <q-icon name="fas fa-chevron-circle-right" class="q-mr-sm" color="primary" size="xs"/>
      <!--Breadcrumb-->
      <q-breadcrumbs gutter="none">
        <!---Slot separator-->
        <template v-slot:separator>
          <q-icon size="1.5em" name="fa-light fa-chevron-right" color="primary"/>
        </template>
        <!---Items on breadcrumb-->
        <q-breadcrumbs-el v-for="(item,index) in breadcrumbs" :key="index"
                          @click="setFolder(item.id); $emit('selected',{...item, isFolder : true})"
                          :label="item.name" color="primary" class="cursor-pointer"/>
      </q-breadcrumbs>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    params: {
      default: () => {
        return {folderId: 0}
      }
    }
  },
  emits: ['selected'],
  components: {},
  watch: {
    params: {
      deep: true,
      handler: function (newValue, oldValue) {
        if (this.filter.folderId != newValue.folderId) this.setFolder()
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
      breadcrumbs: [],
      filter: {
        folderId: 0
      }
    }
  },
  computed: {},
  methods: {
    init() {
      this.setFolder()//Set folder
    },
    //Set folder
    setFolder(folderId = false) {
      //Set filters
      this.filter.folderId = this.$clone((folderId !== false) ? folderId : this.params.folderId)
      this.getData()//Get data
    },
    //Get data
    getData(refresh = false) {
      return new Promise((resolve, reject) => {
        this.loading = true
        //Requets params
        let requestParams = {
          refresh: refresh,
          params: {
            filter: {
              folderId: this.filter.folderId
            }
          }
        }
        //Request
        if (this.filter.folderId) {
          this.$crud.show('apiRoutes.qmedia.breadcrumb', this.filter.folderId, requestParams).then(response => {
            this.breadcrumbs = response.data
            this.breadcrumbs[0] = {id: 0, name: this.$tr('isite.cms.label.home')}
            this.loading = false
          }).catch(error => {
            this.$apiResponse.handleError(error, () => {
              this.loading = false
            })
          })
        } else {
          this.breadcrumbs = [{id: 0, name: this.$tr('isite.cms.label.home')}]
        }
      })
    }
  }
}
</script>
<style lang="scss">
#mediaBreadcrumbComponent {
  #breadcrumbContent {
    padding: 10px 15px;
    background: $grey-2;
    border-radius: 10px;

    .q-breadcrumbs__el {
      font-size: 14px;
    }
  }
}
</style>
