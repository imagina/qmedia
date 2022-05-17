<template></template>
<script>
export default {
  data() {
    return {
      crudId: this.$uid()
    }
  },
  computed: {
    crudData() {
      return {
        crudId: this.crudId,
        entityName: config("main.qmedia.entityNames.zone"),
        apiRoute: 'apiRoutes.qmedia.zones',
        permission: 'media.zones',
        extraFormFields: 'media.crud-fields.zones',
        create: {
          title: this.$tr('media.cms.newZone'),
        },
        read: {
          columns: [
            {name: 'id', label: this.$tr('isite.cms.form.id'), field: 'id', style: 'width: 50px'},
            {
              name: 'module', label: this.$tr('isite.cms.label.module'), field: 'entityType', align: 'left',
              format: val => val ? val.split("\\")[1] : ""
            },
            {
              name: 'entity', label: this.$tr('isite.cms.label.entity'), field: 'entityType', align: 'left',
              format: val => val ? val.split("\\")[3] : ""
            },
            {name: 'zone', label: this.$tr('isite.cms.label.zone'), field: 'name', align: 'rigth'},
            {
              name: 'created_at', label: this.$tr('isite.cms.form.createdAt'), field: 'createdAt', align: 'left',
              format: val => val ? this.$trd(val) : '-',
            },
            {name: 'actions', label: this.$tr('isite.cms.form.actions'), align: 'left'},
          ],
        },
        update: {
          title: this.$tr('media.cms.updateZone'),
        },
        delete: true,
        formLeft: {
          id: {value: ''},
          userId: {value: this.$store.state.quserAuth.userId},
          name: {
            value: '',
            type: 'input',
            require: true,
            props: {
              label: `${this.$tr('isite.cms.label.zone')}*`,
              rules: [
                val => !!val || this.$tr('isite.cms.message.fieldRequired')
              ],
            },
          },
          entityType: {
            type: "select",
            require: true,
            props: {
              label: `${this.$tr('isite.cms.label.entity')}*`,
              options: [
                {label: "Iad - Ad", value: 'Modules\\Iad\\Entities\\Ad'}
              ]
            }
          },
          mediasSingle: {
            value: {},
            type: 'media',
            props: {
              label: this.$tr('isite.cms.label.waterMark'),
              zone: 'watermark',
              entity: "Modules\\Media\\Entities\\Zone",
              entityId: null
            }
          }
        }
      }
    },
    //Crud info
    crudInfo() {
      return this.$store.state.qcrudComponent.component[this.crudId] || {}
    }
  },
}
</script>
