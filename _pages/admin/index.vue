<template>
  <div id="indexMedia">
    <media-master/>


    <div class="col-12" v-if="true">
      <media-list/>
    </div>
  </div>
</template>
<script>
  /*Components*/
  import mediaList from '@imagina/qmedia/_components/list'
  import mediaMaster from '@imagina/qmedia/_components/media'

  import mediaForm from '@imagina/qmedia/_components/form'

  export default {
    props: {},
    components: {
      mediaList,
      mediaMaster
    },
    watch: {},
    computed: {},
    mounted() {
    },
    data() {
      return {}
    },
    methods: {}

  }
</script>
<style lang="stylus">
</style>
