<template>
  <div id="siteField" class="q-my-xs">

    <q-field
    
    >
      <q-input
        autocomplete="false"
        @input="emitValue()"
        v-model="vModel"
        :type="setting.type"
        v-if="['select', 'select-multi','file','color','checkbox'].indexOf(setting.type) < 0 "
        :float-label="label"
        :rows="setting.type=='textarea' ? 3 : ''"/>
  
      
      <div class="q-caption text-grey"
      v-if="['select', 'select-multi'].indexOf(setting.type) >= 0">
        {{label}}</div>
      <treeselect
        :multiple="setting.type === 'select-multi'"
        :append-to-body="true"
        :options="options"
        :value-consists-of="setting.valueCconsistsOf ? setting.valueCconsistsOf : 'LEAF_PRIORITY'"
        @input="emitValue()"
        v-model="vModel"
        v-if="['select', 'select-multi'].indexOf(setting.type) >= 0"
        :placeholder="label"
      />
      
      <q-color
        @input="emitValue()"
        v-model="vModel"
        format-model="hex"
        clearable modal
        :float-label="label"
        v-if="setting.type == 'color'"/>
  
      <media-form
        v-if="setting.type == 'file'"
        entity="Modules\Setting\Entities\Setting"
        :zone="setting.name"
        @input="emitValue()"
        v-model="vModel.medias_single"
        :entity-id="setting.id ? setting.id : ''"
        :label="label"
      />
  
      <q-editor
        v-if="setting.type == 'wysiwyg'"
        :float-label="label"
        v-model="vModel"
        @input="emitValue()"
      />
      
      <q-checkbox
        v-if="setting.type == 'checkbox'"
        @input="emitValue()"
        v-model="vModel"
        :label="label" class="q-my-sm"/>
    </q-field>

  </div>
</template>
<script>
  import {alert} from '@imagina/qhelper/_plugins/alert'
  
  /*Components*/
  import Treeselect from '@riophae/vue-treeselect';
  import '@riophae/vue-treeselect/dist/vue-treeselect.css';
  import mediaForm from '@imagina/qmedia/_components/form'
  
  export default {
    props: ['setting', 'label'],
    components: {
      mediaForm,
      Treeselect
    },
    computed: {
      options(){
        let name = this.setting.name.split('::')[1];
        let options = []
        switch (name){
          case 'template':
            options = this.$store.getters['site/availableThemesTreeSelect']
            break;
          case 'locales':
            options = this.$store.getters['site/availableLocalesTreeSelect']
            break;
          default:
            if(this.setting.options)
              options = this.setting.options;
            break;
        }
    
        return options
      }
    },
    watch: {
      '$attrs.value'(){
        this.vModel = JSON.parse(JSON.stringify(this.$attrs.value));
      }
    },
    created() {
      this.$nextTick(function () {
      
      })
    },
    data() {
      return {
        vModel: this.$attrs.value
      }
    },
    methods: {
      emitValue(){
          this.$emit('input',this.vModel)
      },
  
     
    }
    
  }
</script>
<style lang="stylus">
  @import "~variables";
</style>
