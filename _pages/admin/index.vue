<template>
  <div id="indexMediaPage">
    <!--New Media list-->
    <media-master v-if="true"/>

    <!--Old media list-->
    <div class="col-12" v-else>
      <media-list/>
    </div>
  </div>
</template>
<script>
/*Components*/
import mediaList from 'modules/qmedia/_components/list'
import mediaMaster from 'modules/qmedia/_components/media'

export default {
  props: {},
  components: {
    mediaList,
    mediaMaster
  },
  watch: {},
  mounted() {
  },
  data() {
    return {}
  },
  computed: {},
  methods: {}

}
</script>
<style lang="scss">
</style>
