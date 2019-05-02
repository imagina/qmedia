<template>
  <div id="indexMedia"
       class="q-layout-page row layout-padding">
    
    <div class="text_title text-blue-9 col-xs-12 q-title text-right">
      <span>Multimedia</span>
    </div>
    
    <div class="q-py-md q-title col-xs-12 text-negative">
      • List/Search
    </div>
     <div class="col-12">
       <media-form
         v-model="form.medias_multi"
         entity="Modules\Page\Entities\Page"
         entityId="2"
         label="Main Image"
       />

       <media-list />

     </div>
   
  </div>
</template>
<script>
 
  
  /*Components*/
  import mediaList from '@imagina/qmedia/_components/list'

  import mediaForm from '@imagina/qmedia/_components/form'
  
  export default {
    props: {},
    components: {
      mediaList,
      mediaForm
    },
    watch: {},
    computed: {},
    mounted() {},
    data() {
      return {
      
      }
    },
    methods: {}
    
  }
</script>
<style lang="stylus">
  @import "~variables";
</style>