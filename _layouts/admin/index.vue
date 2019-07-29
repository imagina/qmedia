<template>
  <div id="indexMedia"
       class="q-layout-page row layout-padding">

    <!--TITLE-->
    <h1 class="q-headline text-primary">
      <q-icon :name="$route.meta.icon"></q-icon>
      {{$tr($route.meta.title)}}
    </h1>

    <div class="col-12">
      <media-list/>
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
      mediaList
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
  @import "~variables";
</style>
