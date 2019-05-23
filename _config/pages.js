//Layout container
import master from 'src/layouts/master'

//Middleware
import auth from '@imagina/quser/_router/middlewares/auth'
import access from '@imagina/quser/_router/middlewares/access'

export default {
  //Home Page
  index: {
    permission: 'media.medias.index',
    activated: true,
    path: '/media/index',
    name: 'app.media.index',
    layout: require('@imagina/qmedia/_layouts/index').default,
    containerLayout: master,
    title: 'Media',
    icon: 'fas fa-camera-retro',
    middleware: [auth,access]
  },
}