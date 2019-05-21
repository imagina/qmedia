/*
export const someGetter = (state) => {}
*/
import {helper} from '@imagina/qhelper/_plugins/helper'


export const getSettings = (state) => {
  return state.settings;
};

export const getAvalaibleLocales = (state) => {
  return state.availableLocales;
};

export const getAvalaibleThemes = (state) => {
  return state.availableThemes;
};

export const getDefaultLocale = (state) => {
  return state.defaultLocale;
};

export const availableLocalesSelect = (state) => {
  return helper.array.select(state.availableLocales, 'iso');
};

export const availableLocalesTreeSelect = (state) => {
  let items = []
  state.availableLocales.forEach((locale,index) => {
      items.push({
        id: locale.iso,
        label: locale.name
      })
  })
  return items
};

export const availableThemesSelect = (state) => {
  return helper.array.select(state.availableThemes, 'name');
};

export const availableThemesTreeSelect = (state) => {
  let items = []
  state.availableThemes.forEach(theme => {
    items.push({
      id:theme.name,
      label: theme.name
    })
  })
  return items
};

export const getSettingValueByName = (state) => (filter) => {
  let setting = state.settings.find(setting => setting.name === filter );
  return setting.value;
};

export const getSelectedLocalesSelect = (state) => {
  //Get labels formselected locales
  let languages = state.availableLocales.filter(item => state.selectedLocales.indexOf(item.iso) >= 0)
  //Return array select form selected languages
  return helper.array.select(languages, 'iso');
};