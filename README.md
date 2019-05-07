##Module Qmedia
Module with CRUD for media.

##Required

####Plugins
- axios

####Modules
- quser
- qhelper


##Usage

####Routes

In file `src/config/apiRoutes/routes/index.js` add:
```js
media: require('@imagina/qmedia/_config/media').default,
```


####Pages

In file `src/config/apiRoutes/pages/index.js` add:
```js
import media from '@imagina/qmedia/_config/pages'
```

and on export default add:
```js
media : media
```

####Sidebar

In file `src/config/sidebar.js`  add:
```js
 {//Setup
    title: 'Setup',
    icon: 'fas fa-cog',
    children: [
      pages.media.index,// media setup
    ]
  },
```
if already have the -setup- statement, just add `pages.media.index,//setup` on his array: `children`

####Components

#####Media List 



Basic Usage:
```js
<media-list embebed />
```
| Vue Property  | Type | Required | Description |
| ------------- | ------------- | ------------- | ------------- |
| embebed  |Boolean  | false | Show File list changing actions buttons with 'Use this file' button

#####Media Form
Basic Usage:
```js
<media-form
   v-model="model"
   multiple 
   entity="Modules\Page\Entities\Page"
   entityId="2"
   label="Main Image"
   buttonLabel="Add Image"
   buttonIcon="fas fa-picture"
   zone='mainimage'
 />
```
| Vue Property  | Type | Required | Description |
| ------------- | ------------- | ------------- | ------------- |
| multiple  |Boolean  | false | Show files on different structure for gallery
| entity  |String  | true | Used for files request
| entityId  |String  | false | Used for files request
| zone |String  | false | Used for files request and for the v-model data, default: image
| label |String  | false | Used for Master Title, default: Image
| buttonLabel |String  | false | Used for Custom Button Title, default: 'Add File'
| buttonIcon |String  | false | Used for Custom Button Icon, default: 'add'