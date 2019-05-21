<template>
  <!--Button toogle with locales-->
  <q-btn-toggle
    class="no-shadow"
    v-model="locale.language"
    toggle-color="primary"
    color="grey-2"
    text-color="grey-8"
    :options="this.$store.getters['site/getSelectedLocalesSelect']"
    @input="updateFormTempleate()"
  />
</template>
<script>
  //plugins
  import _cloneDeep from 'lodash.clonedeep'

  export default {
    props: {
      value: {
        default: () => {
          return {}
        }
      }
    },
    components: {},
    watch: {
      //Watch form template from value, to update form by locale
      'value.formTemplate': {
        deep: true,
        handler: function (newValue) {
          this.setDataByLocale()//Set data in form by locale
        },
      },
      //Watch form from value, to init
      'value.form': {
        deep: true,
        handler: function (newValue) {
          this.init()//init all locale data
        },
      },
    },
    mounted() {
      this.$nextTick(function () {
        this.init()
      })
    },
    validations() {
      return this.objValidations()
    },
    data() {
      return {
        locale: {
          form: {},//Return data with format to request
          fields: {},//Fields not translatable
          success: false,//Status  component
          validations: {},//Fields to validate
          formTemplate: {},//Form with fields to render template
          formValidations: {},//Object with validations structure
          fieldsTranslatable: {},//Fields Translatable
          language: this.$store.state.site.defaultLocale,//Selected language in component
          languages: this.$store.state.site.selectedLocales,//Selected locales from admin
        }
      }
    },
    computed: {
      //Merge value and locale data
      interfaceSet() {
        const data = _cloneDeep(this.value)
        const locale = _cloneDeep(this.locale)
        this.locale = _cloneDeep(Object.assign(locale, data))
      },
      //Return clone from locale data
      interfaceGet() {
        return _cloneDeep(this.locale)
      },
      //Return clone from value data
      interfaceGetValue() {
        return _cloneDeep(this.value)
      },
      //Emmit a clone from locale data
      interfaceEmit() {
        //Check if there is fields in from template to change status from component
        const lengthFormTemplate = Object.keys(this.locale.formTemplate).length
        this.locale.success = lengthFormTemplate ? true : false
        //Emmit data
        this.$emit('input', _cloneDeep(this.locale))
      },
      //check if form template is same in value and local
      formTemplateIsSame() {
        const locale = this.interfaceGet//Get clone local data
        const value = this.interfaceGetValue//Get clone value data
        if (JSON.stringify(locale.formTemplate) == JSON.stringify(value.formTemplate))
          return true
        else return false
      },
      //check if form is same in value and local
      formIsSame() {
        const locale = this.interfaceGet//Get clone local data
        const value = this.interfaceGetValue//Get clone value data
        if (JSON.stringify(locale.form) == JSON.stringify(value.form))
          return true
        else return false
      }
    },
    methods: {
      //Init component
      init() {
        if (!this.formIsSame) {
          this.interfaceSet//Set data form value
          this.orderFields()//Order fields
          this.orderValidations()//Order validations
          this.updateFormTempleate()//Update data of form template according to locale
          this.interfaceEmit//Emit clone of locale data
        }
      },
      //Load fields on form and form template
      orderFields() {
        const locale = _cloneDeep(this.locale)//Clone locale
        const locales = this.$store.state.site.selectedLocales//Get selected locales from store

        //Merge fields and fields translatable to formTemplate
        this.locale.formTemplate = _cloneDeep(Object.assign({},
          locale.fields, locale.fieldsTranslatable
        ))

        //Create and sync fields translatable by locale
        let fieldsTranslatable = {}
        locales.forEach(language => {
          if (locale.form[language])//Sync fields translatable from form
            Object.keys(locale.form[language]).forEach(fieldName => {
              if (!fieldsTranslatable[language]) fieldsTranslatable[language] = {}
              fieldsTranslatable[language][fieldName] = locale.form[language][fieldName]
            })
          else//Set default fields translatable
            fieldsTranslatable[language] = _cloneDeep(locale.fieldsTranslatable)
        })

        //Create or sync fields with fields from form
        let fields = {}
        Object.keys(locale.fields).forEach(field => {
          fields[field] = locale.form[field] ? locale.form[field] : locale.fields[field]
        })

        //Merge all fields with fields by locale
        this.locale.form = _cloneDeep(Object.assign({},fields, fieldsTranslatable))
      },
      //Order fields validations
      orderValidations() {
        //Order validations by locale
        if (Object.keys(this.locale.validations).length) {
          this.locale.formValidations = _cloneDeep({
            formTemplate: this.locale.validations
          })
        }
      },
      //Set data from formTemplate in form by locale
      setDataByLocale() {
        if (!this.formTemplateIsSame) {
          this.syncFormTemplate()//Sync data formTemplate
          const locale = this.interfaceGet//Get clone local data
          const value = this.interfaceGetValue//Get clone value data

          //Set fields not translatables
          for (var item in locale.fields) {
            locale.form[item] = locale.formTemplate[item]
          }

          //Set fields translatables
          for (var item in locale.fieldsTranslatable) {
            locale.form[locale.language][item] = locale.formTemplate[item]
          }

          this.locale.form = _cloneDeep(locale.form)
          this.interfaceEmit//Emit data
        }
      },
      //Sync form template
      syncFormTemplate() {
        const locale = this.interfaceGet//Get clone local data
        const value = this.interfaceGetValue//Get clone value data
        this.locale.formTemplate = _cloneDeep(Object.assign({},locale.formTemplate, value.formTemplate))
      },
      //Change data of form template about locale
      updateFormTempleate() {
        const locale = this.interfaceGet

        //Change fields by locale of form template
        Object.keys(locale.fieldsTranslatable).forEach(fieldName => {
          locale.formTemplate[fieldName] = locale.form[locale.language][fieldName]
        })

        //Change fields of form template
        Object.keys(locale.fields).forEach(fieldName => {
          locale.formTemplate[fieldName] = _cloneDeep(locale.form[fieldName])
        })

        this.locale.formTemplate = _cloneDeep(locale.formTemplate)
        this.interfaceEmit//Emit data
      },
      //Validate all fields
      vTouch() {
        if (Object.keys(this.locale.validations).length) {
          const locale = _cloneDeep(this.locale)
          const currentLanguage = locale.language

          for (var locale of this.locale.languages) {
            this.locale.language = locale//Change language
            this.updateFormTempleate()//Update form about language
            this.$v.$touch() //Touch validations
            //Check if fields is invalid
            if (this.$v.$error) {
              this.$emit('validate')
              return false
            } else {
              this.$v.$reset//Reset Validations
              this.locale.language = currentLanguage//Set current language
            }
          }
        }
      },
      //Return obj to validate fields
      objValidations() {
        if (Object.keys(this.locale.validations).length)
          return {locale: _cloneDeep(this.locale.formValidations)}
        else
          return {}
      }
    }
  }
</script>
<style lang="stylus">
  @import "~variables";
</style>