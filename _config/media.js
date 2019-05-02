/*
* In javascript the variables are declared in camelcase but I like use snake case,
* if you want you can rename them as you want and remove the rule in .eslintrc line 35
*/
const base_url = env('BASE_URL', 'http://localhost:8000');
const api_url = base_url + '/api';


export default {
  allMedia: api_url + '/media/all-vue',
  breadcrumb: api_url + '/folder/breadcrumb',
  file: api_url + '/file',
  folder: api_url + '/folder',
  move: api_url + '/media/move',
  batchDestroy: api_url + '/batch-destroy',
  findFirst: api_url + '/media/find-first-by-zone-and-entity',
  find: api_url + '/media/get-by-zone-and-entity'
}
