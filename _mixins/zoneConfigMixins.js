export default {
  computed: {
    //Settings
    mediaSettings() {
      const types = {
        imagesType: this.$getSetting('media::allowedImageTypes'),
        filesType: this.$getSetting('media::allowedFileTypes'),
        videosType: this.$getSetting('media::allowedVideoTypes'),
        audiosType: this.$getSetting('media::allowedAudioTypes'),
      }
      //Response
      return {
        ...types,
        ratios: this.$getSetting('media::allowedRatios'),
        maxFileSize: this.$getSetting('media::maxFileSize'),
      }
    },
    //Return accept extensions
    acceptExtensions() {
      let response = []//Instance response
      //instance response
      let accept = this.$clone(this.accept && (this.accept != 'all') ?
        this.accept.split(',') : ['images', 'videos', 'audios', 'files'])

      //Get extensions settings
      let extensions = {
        images: this.mediaSettings.imagesType,
        videos: this.mediaSettings.videosType,
        audios: this.mediaSettings.audiosType,
        files: this.mediaSettings.filesType
      }

      //Parse extensions
      accept.forEach(extensionName => {
        if (extensions[extensionName]) response = [...response, ...extensions[extensionName]]
        else response = [...response, extensionName]
      })

      //response
      return {
        withoutDot: response.map(extension => {
          if (extension.includes('.')) extension = extension.replace(".", "")
          return extension
        }),
        withDot: response.map(extension => {
          if (!extension.includes('.')) extension = `.${extension}`
          return extension
        })
      }
    },
    //Zone config
    zoneConfig() {
      return {
        maxFileSizeMB: parseInt(this.maxFileSize || this.mediaSettings.maxFileSize || 10),
        ratio: this.parseRatio(this.ratio)
      }
    },
  },
  methods: {
    //parse ratio
    parseRatio(value) {
      if (!value || value == "free") return NaN
      return value.split(":")[0] / value.split(":")[1]
    }
  }
}
