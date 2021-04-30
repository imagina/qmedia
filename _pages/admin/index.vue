<template>
  <div id="indexMedia">
    <dynamic-field :field="mediaField.newMedia" class="q-mb-xl"/>

    <dynamic-field :field="mediaField.oldMedia" class="q-mb-xl"/>

    <!--New Media list-->
    <media-master/>

    <!--Old media list-->
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
  mounted() {
  },
  data() {
    return {}
  },
  computed: {
    mediaField() {
      return {
        oldMedia: {
          name: 'mediasSingle',
          value: {},
          type: 'media',
          props: {
            label: this.$tr('ui.form.firstImage'),
            zone: 'mainimage',
            entity: "Modules\\Iblog\\Entities\\Category",
            entityId: null,
            multiple: true
          }
        },
        newMedia: {
          name: 'mediasSingle',
          value: {},
          type: 'selectMedia',
          props: {
            label: this.$tr('ui.form.firstImage'),
            zone: 'mainimage',
            entity: "Modules\\Iblog\\Entities\\Category",
            entityId: null,
            multiple: true
          }
        }
      }
    }
  },
  methods: {}

}
</script>
<style lang="stylus">
#indexMedia
  box-shadow $custom-shadow-box
</style>
