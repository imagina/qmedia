import crud from '@imagina/qhelper/_services/baseService'
import http from "axios/index";
import {remember} from "@imagina/qhelper/_plugins/remember"
import {helper} from "@imagina/qhelper/_plugins/helper";
import config from 'src/config/index'

export default {
  crud,
  updateOrCreate(configName, data){
    return new Promise((resolve, reject) => {
      //Validations
      if (!configName) return reject('Config name is required')
      if (!data) return reject('Data is required')
      let urlApi = config(configName)//Get url from config
      //Request
      http.post(urlApi, {attributes:data}).then(response => {
        resolve(response.data)//Successful response
      }).catch(error => {
        reject(error.response.data.errors)//Failed response
      })
    })
  }
}
