<template>
  <div id="mediaForm" class="row full-width">
    <div v-if="label" class="col-12 q-heading q-caption q-my-sm label" >{{ this.label }}</div>
    <!--= image viewer =-->
    <div class="col-12">
      <!--= if is multiple =-->
      <q-scroll-area
        v-if="multiple"
        style="width: 100%; height: 150px;">
      <div class="row gutter-xs">
        
        <div
          v-for="(file,index) in files"
          :key="index"
          class="column col-xs-6 col-sm-4 col-md-3 col-lg-2"
          
        >
          <div class="image-multiple"
               :style="'background-image:url(' + file.medium_thumb + ')'">
            <q-btn round color="red" @click="deleteFile(index)" icon="fas fa-times" size="sm"/>
          </div>

          
      
        </div>
      </div>
      </q-scroll-area>
      <!--= if not multiple =-->
        <div v-else class="row gutter-xs">
        <div v-for="(file,index) in files"
             :key="index"
             class="col-12 col-md-6 relative-position">
          <img class="img-fluid" :src="file ? file.medium_thumb : ''" />
  
          <q-btn
            class="absolute-top-left"
            style="top: 0; left: 0;"
            round
            
            color="red"
            @click="deleteFile(index)"
            icon="fas fa-times"
            size="sm"/>
        </div>
        
      </div>
    
    </div>
  
    <!--= Add File Button =-->
    <q-btn
      :label="buttonLabel ? buttonLabel : 'Add File'"
      :icon="buttonIcon ? buttonIcon : 'add'"
      color="primary"
      class="q-my-xs"
      size="sm"
      @click="modalMedia = true"/>
  
  
    <!--= Media List Modal =-->
    <q-modal v-model="modalMedia" :content-css="{minWidth: '80vw', minHeight: '80vh'}">
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-btn
            flat
            round
            dense
            v-close-overlay
            icon="keyboard_arrow_left"
          />
          <q-toolbar-title>
            Media
          </q-toolbar-title>
        </q-toolbar>

        
        <div class="layout-padding">
          
          <media-list embebed @data="pushData" />
  
        </div>
      </q-modal-layout>
    </q-modal>
    
  </div>
</template>
<script>
  /*Plugins*/
  import {alert} from '@imagina/qhelper/_plugins/alert'
  
  /*Components*/
  import mediaList from '@imagina/qmedia/_components/list'

  /*Services*/
  import mediaService from '@imagina/qmedia/_services/index'
  
  export default {
    props: {
      zone: {
        type: String,
        default: 'image'
      },
      multiple: {
        type: Boolean,
        default: false
      },
      value: {
        type: Object,
        default: () =>{return {}}
      },
      entity: { type: String, required: true },
      entityId: { default: null },
      label: { type: String, default: ''},
      buttonLabel: { type: String, default: ''},
      buttonIcon: { type: String, default: ''}
    },
    components: {
      mediaList
    },
    watch: {
      entityId(){
        if(this.entityId) {
          this.getData()
        }
      },
      zone() {
        if (this.entityId) {
          this.getData()
        }
      }
    },
    mounted() {
      this.$nextTick(function () {
        // if has entity id, get the files associated
        if(this.entityId) {
   
          this.getData()
        }
      })
    },
    data() {
      return {
        modalMedia: false,
        ids: [],
        files: []
      }
    },
    methods: {
      getData(){
     
          let params = {
            params: {
              zone: this.zone,
              entity: this.entity,
              entity_id: this.entityId
            },
            remember: false
          }
          // if is multiple media, call diff routes and transform diff the response.data
          if (this.multiple) {
            mediaService.crud.index('apiRoutes.media.find', params).then(response => {
              if(response.data)
                this.files = response.data;
              this.pushData()
            })
          } else {
            mediaService.crud.index('apiRoutes.media.findFirst', params).then(response => {
          
              if(response.data)
                this.files = [response.data];
              this.pushData()
            })
          }
        
      },
  
      /**
       * push data to v-model
       * @param file
       */
      pushData(file = false){
        
        if(this.multiple){
          // if file is not false, its pusher on files list
          if(file)
            this.files.push(file)
          let vmodel = {}, ids = []
          this.files.forEach(file => {
            ids.push(file.id)
          })
          vmodel = JSON.parse(JSON.stringify(this.value))
          if(!vmodel[this.zone])
            vmodel[this.zone] = {}
            
          vmodel[this.zone].files = ids
          vmodel[this.zone].orders = ids.join();
          this.$emit('input',vmodel)
        }else{
          if(file)
            this.files = [file]
          let vmodel = JSON.parse(JSON.stringify(this.value))
          if(!vmodel[this.zone])
            vmodel[this.zone] = {}
          vmodel[this.zone] = file ? file.id : this.files[0] ? this.files[0].id : ''
          this.$emit('input',vmodel)
          this.modalMedia = false
        }
        
      },
      /**
       * delete files and push data to the v-model
       * @param index
       */
      deleteFile(index){
        this.files.splice(index, 1)
        this.pushData()
      },
    }
    
  }
</script>
<style lang="stylus">
  @import "~variables";
  #mediaForm
    .image-multiple
      background-repeat no-repeat
      background-size 100% auto
      background-position center center
      height 150px
      overflow hidden
    
    .label
      text-transform capitalize
  
</style>