export default {
  //Home Page
  index: {
    permission: 'media.medias.manage',
    activated: true,
    path: '/media/index',
    name: 'app.media.index',
    page: () => import('modules/qmedia/_pages/admin/index'),
    layout: () => import('layouts/master.vue'),
    title: 'media.cms.sidebar.adminIndex',
    icon: 'fa-light fa-photo-film',
    authenticated: true,
    subHeader: {
      refresh: true
    }
  },
  //Zones Page
  zones: {
    permission: 'media.zones.manage',
    activated: true,
    path: '/media/zones',
    name: 'app.media.zones',
    crud: import('modules/qmedia/_crud/zones'),
    page: () => import('modules/qcrud/_pages/admin/crudPage'),
    layout: () => import('layouts/master.vue'),
    title: 'media.cms.sidebar.adminZones',
    icon: 'fa-light fa-sliders-up',
    authenticated: true,
    subHeader: {
      refresh: true
    }
  },
}
