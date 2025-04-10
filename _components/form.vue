<template>
  <div id="mediaForm" class="row full-width">
    <!--Top Content-->
    <div class="col-12">
      <div class="row justify-between items-center">
        <!--Title-->
        <div class="text-blue-grey">
          <q-icon name="fas fa-photo-video" class="q-mr-sm" />
          <label>{{ label || $tr('isite.cms.label.file') }}</label>
        </div>
        <!--= Add File Button =-->
        <q-btn :label="buttonLabel ? buttonLabel : $tr('isite.cms.label.select')" no-caps @click="modalMedia = true"
               unelevated
               :icon="buttonIcon ? buttonIcon : 'fas fa-plus'" color="green" rounded class="btn-extra-small" />
      </div>
    </div>
    <!--Separator-->
    <div class="col-12 q-mt-sm q-mb-md">
      <q-separator />
    </div>
    <!--= Files viewer =-->
    <div class="col-12">
      <div style="min-height: 160px">
        <draggable
          @change="pushData(false)"
          class="row"
          v-model="files"
          group="filesDrag"
          item-key="id"
        >
          <template #item="{ element, index }">
            <div
              :key="index"
              class="file-block col-6 col-md-3 relative-position"
            >
              <!--Image-->
              <div
                class="file-block-content"
                v-if="element.is_image || element.isImage"
                @click="$refs.avatarImage.open(element.path)"
                :style="'background-image:url(' + getThumbnails(element,'smallThumb') + ')'"
              />
              <!--Icon-->
              <div
                class="file-block-content row items-center justify-center"
                v-else
              >
                <q-icon
                  color="grey-8"
                  size="40px"
                  :name="((element.media_type || element.mediaType) == 'video') ? 'fas fa-video' : 'far fa-file-alt'"
                />
              </div>
              <!--Action remove file-->
              <q-btn
                round
                color="red"
                @click="deleteFile(index)"
                icon="fas fa-trash-alt"
                size="sm" unelevated
                class="btn-remove-file"
              />
            </div>
          </template>
        </draggable>
      </div>
    </div>

    <!--Image preview-->
    <avatar-image ref="avatarImage" no-preview />

    <!--= Media List Modal =-->
    <q-dialog id="modalMedia" v-model="modalMedia" :content-css="{minWidth: '80vw', minHeight: '80vh'}">
      <q-card>
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title>{{ $tr('media.cms.selectMedia') }}</q-toolbar-title>
          <q-btn flat v-close-popup icon="fas fa-times" />
        </q-toolbar>
        <q-card-section class="q-pa-md">
          <media-list embebed @data="pushData" :disk="mediaDisk" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
/*Components*/
import mediaList from 'modules/qmedia/_components/list';
import draggable from 'vuedraggable';
/*Services*/
import mediaService from 'modules/qmedia/_services/index';

export default {
  props: {
    disk: { default: null },
    zone: {
      type: String,
      default: 'image'
    },
    multiple: {
      type: Boolean,
      default: false
    },
    modelValue: {
      //type: Object,
      default: () => {
        return {};
      }
    },
    entity: { type: String, required: true },
    entityId: { default: null },
    label: { type: String, default: '' },
    buttonLabel: { type: String, default: '' },
    buttonIcon: { type: String, default: '' }
  },
  emits: ['update:modelValue'],
  components: {
    mediaList,
    draggable
  },
  watch: {
    entityId() {
      if (this.entityId) {
        this.getData();
      }
    },
    zone() {
      if (this.entityId) {
        this.getData();
      }
    }
  },
  mounted() {
    this.$nextTick(function() {
      // if has entity id, get the files associated
      if (this.entityId) {

        this.getData();
      }
    });
  },
  data() {
    return {
      modalMedia: false,
      ids: [],
      files: []
    };
  },
  computed: {
    //default disk
    mediaDisk() {
      return this.disk || this.$getSetting('media::filesystem');
    }
  },
  methods: {
    getData() {
      let params = {
        refresh: true,
        params: {
          zone: this.zone,
          entity: this.entity,
          entity_id: this.entityId
        }
      };

      // if is multiple media, call diff routes and transform diff the response.data
      if (this.multiple) {
        this.$crud.index('apiRoutes.qmedia.find', params).then(response => {
          if (response.data && Array.isArray(response.data)) this.files = response.data;
          this.pushData();
        }).catch(error => {
        });
      } else {
        this.$crud.index('apiRoutes.qmedia.findFirst', params).then(response => {
          if (response.data) this.files = [response.data];
          this.pushData();
        }).catch(error => {
          this.$apiResponse.handleError(error, () => {
          });
        });
      }

    },
    /**
     * push data to v-model
     * @param file
     */
    pushData(file = false) {
      setTimeout(() => {
        let zone = this.$clone(this.zone);
        let filesData = {};

        if (this.multiple) {
          // if file is not false, its pusher on files list
          if (file) {
            this.files.push(file);
            this.$alert.success('image ' + file.filename + ' added');
          }

          //Default value to filesData
          if (Array.isArray(this.modelValue) && !this.modelValue.lenght) filesData = {};
          else filesData = JSON.parse(JSON.stringify(this.modelValue));

          //Validate if exist zone
          if (!filesData[zone] || Array.isArray(filesData[zone])) filesData[zone] = {};

          //Get files ID
          let ids = this.files.map(file => file.id);
          //Set files data
          filesData[zone].files = ids;
          filesData[zone].orders = ids.join();
        } else {
          if (file) this.files = [file];

          if (Array.isArray(this.modelValue) && !this.modelValue.lenght) filesData = {};
          else filesData = JSON.parse(JSON.stringify(this.modelValue));

          if (!filesData[zone]) filesData[zone] = {};
          filesData[zone] = file ? file.id : (this.files[0] ? this.files[0].id : '');
          this.modalMedia = false;
        }
        //Emit data
        this.$emit('update:modelValue', this.$clone(filesData));
      }, 300);
    },
    /**
     * delete files and push data to the v-model
     * @param index
     */
    deleteFile(index) {
      this.files.splice(index, 1);
      this.pushData();
    },
    getThumbnails(file, name) {
      if (file && file.thumbnails) {
        let itemFile = file.thumbnails.find(item => item.name == name);
        return itemFile ? itemFile.path : '';
      }
      return '';
    }
  }
};
</script>
<style lang="scss">
#mediaForm {
  border: dashed 1px $blue-grey;
  border-radius: 5px;
  padding: 8px 10px;

  .file-block {
    padding: 3px;

    .file-block-content {
      cursor: pointer;
      background-repeat: no-repeat;
      background-size: 100% auto;
      background-position: center center;
      height: 150px;
      overflow: hidden;
      border: 1px solid $grey-4;
      border-radius: 5px;
    }
  }

  .label {
    text-transform: capitalize;
  }

  .btn-remove-file {
    position: absolute;
    right: 0;
    top: 0;
  }
}

#modalMedia {
  .q-card {
    min-width: 80vw;

    .q-card__section {
      max-height: calc(100vh - 148px) !important;
      overflow-y: scroll;
    }
  }
}
</style>
