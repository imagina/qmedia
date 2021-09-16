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
        apiRoute: 'apiRoutes.qmedia.folders',
        permission: 'media.folders',
        create: {
          title: this.$tr('qmedia.layout.newFolder'),
        },
        read: {},
        update: {
          title: this.$tr('qmedia.layout.updateFolder')
        },
        delete: true,
        formLeft: {
          id: {value: ''},
          userId: {value: this.$store.state.quserAuth.userId},
          isFolder: {value: 1},
          filename: {
            value: null,
            type: 'input',
            props: {
              label: this.$tr('ui.form.name'),
              rules: [
                val => !val || this.$helper.validateAlphaNumeric(val) || this.$tr('ui.message.mustContainAlphanumeric')
              ]
            }
          },
          parentId: {
            value: '0',
            type: 'treeSelect',
            props: {
              label: this.$tr('ui.form.parent'),
              clearable: false,
              options: [
                {label: this.$tr('ui.message.noValue'), value: '0', id: '0'}
              ]
            },
            loadOptions: {
              apiRoute: 'apiRoutes.qmedia.files',
              requestParams: {filter: {isFolder: true}},
              select: {label: 'filename', id: 'id', parentId: 'folderId'}
            }
          }
        },
        formRight: {},
      }
    },
    //Crud info
    crudInfo() {
      return this.$store.state.qcrudComponent.component[this.crudId] || {}
    }
  },
}
</script>
