<template>
  <div id="selectMediaComponent">
    Select Media Component...
    <uploader v-bind="uploaderProps"/>
  </div>
</template>
<script>
//Components
import uploader from '@imagina/qsite/_components/master/uploader'

export default {
  props: {},
  components: {uploader},
  watch: {},
  mounted() {
    this.$nextTick(function () {
      this.init()
    })
  },
  data() {
    return {
      loading: false,
      data: []
    }
  },
  computed: {
    //Uploader props
    uploaderProps() {
      return {
        maxFiles: 3
      }
    }
  },
  methods: {
    init() {
    },
  }
}
</script>
<style lang="stylus">
</style>
