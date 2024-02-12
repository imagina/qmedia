export default {
  //Home Page
  selectMediaCKEditor: {
    permission: 'media.medias.index',
    activated: true,
    path: '/media/select',
    name: 'app.media.select',
    page: () => import('modules/qmedia/_pages/admin/selectCkEditor'),
    layout: () => import('layouts/blank.vue'),
    title: 'media.cms.sidebar.adminIndex',
    icon: 'fas fa-camera-retro',
    authenticated: true,
  },
}
