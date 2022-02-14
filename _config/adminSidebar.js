const pages = config('pages') // Get Pages from config

//Media
export default [
  {
    title: 'media.cms.sidebar.adminGroup',
    icon: 'fas fa-photo-video',
    children: [
      pages.qmedia.index
    ]
  }
]
