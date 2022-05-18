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
            type: "treeSelect",
            require: true,
            props: {
              label: `${this.$tr('isite.cms.label.entity')}*`,
              disableBranchNodes: true
            },
            loadOptions: {
              apiRoute: "apiRoutes.qsite.modulesInfo",
              requestParams: {filter: {asSelect: true}},
              select: {label: "name", id: "path"}
            }
          }
        },
        formRight: {
          mediasSingle: {
            value: {},
            type: 'media',
            props: {
              label: this.$tr('isite.cms.label.waterMark'),
              zone: 'watermark',
              entity: "Modules\\Media\\Entities\\Zone",
              entityId: null
            }
          },
          waterMarkPosition: {
            value: "center",
            type: "select",
            fakeFieldName: "options",
            props: {
              label: `${this.$tr('isite.cms.label.waterMark')} | ${this.$tr("isite.cms.label.position")}`,
              options: [
                {label: this.$tr('isite.cms.topLeft'), value: "top-left"},
                {label: this.$tr('isite.cms.top'), value: "top"},
                {label: this.$tr('isite.cms.topRight'), value: "top-right"},
                {label: this.$tr('isite.cms.left'), value: "left"},
                {label: this.$tr('isite.cms.center'), value: "center"},
                {label: this.$tr('isite.cms.right'), value: "right"},
                {label: this.$tr('isite.cms.bottomLeft'), value: "bottom-left"},
                {label: this.$tr('isite.cms.bottom'), value: "bottom"},
                {label: this.$tr('isite.cms.bottomRight'), value: "bottom-right"},
              ]
            }
          },
          waterMarkYAxis: {
            value: 0,
            type: "input",
            fakeFieldName: "options",
            props: {
              label: `${this.$tr('isite.cms.label.waterMark')} | ${this.$tr("isite.cms.label.axis")} Y`,
              type: "number"
            }
          },
          waterMarkXAxis: {
            value: 0,
            type: "input",
            fakeFieldName: "options",
            props: {
              label: `${this.$tr('isite.cms.label.waterMark')} | ${this.$tr("isite.cms.label.axis")} X`,
              type: "number"
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
