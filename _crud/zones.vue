<template></template>
<script>
export default {
  data() {
    return {
      crudId: this.$uid()
    };
  },
  computed: {
    //Get settings
    settings() {
      return {
        imagesType: this.$getSetting('media::allowedImageTypes'),
        filesType: this.$getSetting('media::allowedFileTypes'),
        videosType: this.$getSetting('media::allowedVideoTypes'),
        audiosType: this.$getSetting('media::allowedAudioTypes'),
        ratios: this.$getSetting('media::allowedRatios'),
        maxFileSize: this.$getSetting('media::maxFileSize')
      };
    },
    //Crud Data
    crudData() {
      return {
        crudId: this.crudId,
        entityName: config('main.qmedia.entityNames.zone'),
        apiRoute: 'apiRoutes.qmedia.zones',
        permission: 'media.zones',
        extraFormFields: 'media.crud-fields.zones',
        create: {
          title: this.$tr('media.cms.newZone')
        },
        read: {
          columns: [
            { name: 'id', label: this.$tr('isite.cms.form.id'), field: 'id', style: 'width: 50px' },
            { name: 'zone', label: this.$tr('isite.cms.label.zone'), field: 'name', align: 'rigth', action: 'edit' },
            {
              name: 'module', label: this.$tr('isite.cms.label.module'), field: 'entityType', align: 'left',
              format: val => val ? val.split('\\')[1] : ''
            },
            {
              name: 'entity', label: this.$tr('isite.cms.label.entity'), field: 'entityType', align: 'left',
              format: val => val ? val.split('\\')[3] : ''
            },
            {
              name: 'accept', label: this.$tr('isite.cms.label.accept'), field: 'options', align: 'rigth',
              format: val => val.accept || '-'
            },
            {
              name: 'ratio', label: this.$tr('isite.cms.label.ratio'), field: 'options', align: 'rigth',
              format: val => val.ratio || '-'
            },
            {
              name: 'maxFileSize', label: this.$tr('media.cms.maxFileSize'), field: 'options', align: 'rigth',
              format: val => val.maxFileSize || '-'
            },
            {
              name: 'maxFiles', label: this.$tr('media.cms.maxFiles'), field: 'options', align: 'rigth',
              format: val => val.maxFiles || '-'
            },
            {
              name: 'created_at', label: this.$tr('isite.cms.form.createdAt'), field: 'createdAt', align: 'left',
              format: val => val ? this.$trd(val) : '-'
            },
            {
              name: 'updatedAt', label: this.$tr('isite.cms.form.updatedAt'), field: 'updatedAt', align: 'left',
              format: val => val ? this.$trd(val) : '-'
            },
            { name: 'actions', label: this.$tr('isite.cms.form.actions'), align: 'left' }
          ]
        },
        update: {
          title: this.$tr('media.cms.updateZone')
        },
        delete: true,
        formLeft: {
          id: { value: '' },
          userId: { value: this.$store.state.quserAuth.userId },
          name: {
            value: '',
            type: 'input',
            require: true,
            props: {
              label: `${this.$tr('isite.cms.label.zone')}*`,
              rules: [
                val => !!val || this.$tr('isite.cms.message.fieldRequired')
              ]
            }
          },
          entityType: {
            type: 'treeSelect',
            require: true,
            props: {
              label: `${this.$tr('isite.cms.label.entity')}*`,
              disableBranchNodes: true,
              rules: [
                val => !!val || this.$tr('isite.cms.message.fieldRequired')
              ]
            },
            loadOptions: {
              apiRoute: 'apiRoutes.qsite.modulesInfo',
              requestParams: { filter: { asSelect: true } },
              select: { label: 'name', id: 'path' }
            }
          },
          accept: {
            value: 'all',
            type: 'select',
            fakeFieldName: 'options',
            props: {
              label: this.$trp('isite.cms.label.accept'),
              options: [
                {
                  label: `${this.$tr('isite.cms.label.all')}`,
                  value: 'all'
                },
                {
                  label: `${this.$trp('isite.cms.label.image')} (${this.settings.imagesType.join(',')})`,
                  value: 'images'
                },
                {
                  label: `${this.$trp('isite.cms.label.file')} (${this.settings.filesType.join(',')})`,
                  value: 'files'
                },
                {
                  label: `${this.$trp('isite.cms.label.video')} (${this.settings.videosType.join(',')})`,
                  value: 'videos'
                },
                {
                  label: `${this.$trp('isite.cms.label.audio')} (${this.settings.audiosType.join(',')})`,
                  value: 'audios'
                }
              ]
            }
          },
          ratio: {
            value: 'free',
            type: 'select',
            fakeFieldName: 'options',
            props: {
              label: this.$tr('isite.cms.label.ratio'),
              options: this.settings.ratios.map(ratio => {
                return { label: ratio, value: ratio };
              })
            }
          },
          maxFileSize: {
            value: this.settings.maxFileSize || 10,
            type: 'input',
            fakeFieldName: 'options',
            props: {
              label: this.$tr('media.cms.maxFileSize'),
              type: 'number'
            }
          },
          maxFiles: {
            value: 1,
            type: 'input',
            fakeFieldName: 'options',
            props: {
              label: this.$tr('media.cms.maxFiles'),
              type: 'number'
            }
          },
          directUpload: {
            value: '0',
            type: 'select',
            fakeFieldName: 'options',
            props: {
              label: this.$tr('media.cms.directUpload'),
              options: [
                { label: this.$tr('isite.cms.label.yes'), value: '1' },
                { label: this.$tr('isite.cms.label.no'), value: '0' }
              ]
            }
          }
        },
        formRight: {
          mediasSingle: {
            value: {},
            type: 'media',
            props: {
              label: this.$tr('isite.cms.label.watermark'),
              zone: 'watermark',
              entity: 'Modules\\Media\\Entities\\Zone',
              entityId: null
            }
          },
          watermarkPosition: {
            value: 'center',
            type: 'select',
            fakeFieldName: 'options',
            props: {
              label: `${this.$tr('isite.cms.label.watermark')} | ${this.$tr('isite.cms.label.position')}`,
              options: [
                { label: this.$tr('isite.cms.topLeft'), value: 'top-left' },
                { label: this.$tr('isite.cms.top'), value: 'top' },
                { label: this.$tr('isite.cms.topRight'), value: 'top-right' },
                { label: this.$tr('isite.cms.left'), value: 'left' },
                { label: this.$tr('isite.cms.center'), value: 'center' },
                { label: this.$tr('isite.cms.right'), value: 'right' },
                { label: this.$tr('isite.cms.bottomLeft'), value: 'bottom-left' },
                { label: this.$tr('isite.cms.bottom'), value: 'bottom' },
                { label: this.$tr('isite.cms.bottomRight'), value: 'bottom-right' }
              ]
            }
          },
          watermarkXAxis: {
            value: 0,
            type: 'input',
            fakeFieldName: 'options',
            props: {
              label: `${this.$tr('isite.cms.label.watermark')} | ${this.$tr('isite.cms.label.axis')} X`,
              type: 'number'
            }
          },
          watermarkYAxis: {
            value: 0,
            type: 'input',
            fakeFieldName: 'options',
            props: {
              label: `${this.$tr('isite.cms.label.watermark')} | ${this.$tr('isite.cms.label.axis')} Y`,
              type: 'number'
            }
          }
        }
      };
    },
    //Crud info
    crudInfo() {
      return this.$store.state.qcrudComponent.component[this.crudId] || {};
    }
  }
};
</script>
