<template>
  <div id="settingIndex"
       class="q-layout-page row justify-center layout-padding">
    
    <div class="text_title text-blue-9 col-xs-12 q-title text-right">
      <span>Site</span>
    </div>
    
    <div class="col-12">
      <div class="row gutter-sm">
        <div class="col-12 col-md-3">
          <q-list highlight link dense>
            <q-list-header>Available Modules</q-list-header>
          
            <q-item
              v-for="(module,index) in modules"
              :key="index"
              @click.native="getSingleModule(index)"
              :class="nameModuleSelected == index ? 'router-link-exact-active router-link-active' : ''">
              <q-item-main :label="index" />
              <q-item-side right >
                <q-chip color="primary" small>{{Object.keys(module).length}}</q-chip>
                
              </q-item-side>
            </q-item>
        
            
          </q-list>
        
          
        </div>
        <div class="col-12 col-md-9">
          <site-form v-if="moduleSelected" :module="moduleSelected" :key="moduleKey" :module-name="nameModuleSelected" @getData="getData"/>
          <pre>
  
          </pre>
          
        </div>
      </div>
    </div>
    <q-inner-loading :visible="loadingModules">
      <q-spinner-gears size="50px" color="primary"></q-spinner-gears>
    </q-inner-loading>
  
  </div>
</template>
<script>
  import {alert} from '@imagina/qhelper/_plugins/alert'
  import { uid } from 'quasar'
  
  /*Services*/
  import siteService from '@imagina/qsite/_services/index'
  
  /*Components*/
  import siteForm from '@imagina/qsite/_components/form'
  export default {
    props: {},
    components: {
      siteForm
    },
    watch: {},
    mounted() {
      this.$nextTick(function () {
        this.getData();
      })
    },
    data() {
      return {
        loadingModules: false,
        modules:null,
        moduleSelected: null,
        moduleKey: uid(),
        nameModuleSelected: 'Core'
      }
    },
    methods: {
      getData(refresh = false){
        this.loadingModules = true
        let params = {
          params:{
            filter:{
              allTranslations: true
            },
          },
          remember:false
        }
   
        siteService.crud.index('apiRoutes.site.settings',params).then(response => {
          this.modules = response.data;
          this.getSingleModule(this.nameModuleSelected)
          this.loadingModules = false
        })
        
      },
      
      getSingleModule(name){
        this.moduleKey = uid()
        this.moduleSelected = this.modules[name];
        this.nameModuleSelected = name;
        /*
        siteService.crud.show('apiRoutes.site.settings',name,{remember:false}).then(response => {
          this.moduleSelected = response.data;

        })
        */
      },
    
    }
    
  }
</script>
<style lang="stylus">
  @import "~variables";
</style>