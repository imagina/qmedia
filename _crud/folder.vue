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
          title: this.$tr('media.cms.newFolder'),
        },
        read: {},
        update: {
          title: this.$tr('media.cms.updateFolder')
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
              label: this.$tr('isite.cms.form.name') + '*',
              rules: [
                //val => !val || this.$helper.validateSlugFormat(val) || this.$tr('isite.cms.message.mustContainAlphanumeric')
                val => !!val || this.$tr('isite.cms.message.fieldRequired')
              ]
            }
          },
          parentId: {
            value: '0',
            type: 'treeSelect',
            props: {
              label: this.$tr('isite.cms.form.parent'),
              clearable: false,
              options: [
                {label: this.$tr('isite.cms.message.noValue'), value: '0', id: '0'}
              ]
            },
            loadOptions: {
              apiRoute: 'apiRoutes.qmedia.files',
              requestParams: {filter: {isFolder: true}},
              select: {label: 'filename', id: 'id', parentId: 'folderId'}
            }
          }
        },
        getDataForm(data, type) {
          return new Promise(resolve => {
            //replace name value
            data.name = data.filename
            //Response
            resolve(data)
          })
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
