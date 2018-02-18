module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'Coiny',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Bitcoin fee estimates and market info.' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:site', content: '@coinyfees' },
      { name: 'twitter:creator', content: '@astrolince' },
      { property: 'og:url', content: 'https://coiny.sh/' },
      { property: 'og:title', content: 'Coiny' },
      { property: 'og:description', content: 'Bitcoin fee estimates and market info.' },
      { property: 'og:image', content: 'https://coiny.sh/apple-touch-icon.png' },
      { name: 'apple-mobile-web-app-title', content: 'Coiny' },
      { name: 'application-name', content: 'Coiny' },
      { name: 'msapplication-TileColor', content: '#2d3436' },
      { name: 'theme-color', content: '#2d3436' }
    ],
    link: [
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
      { rel: 'manifest', href: '/site.webmanifest' },
      { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#16a085' }
    ]
  },
  /*
  ** Global CSS
  */
  css: [
    // SCSS file in the project
    '@/assets/css/main.scss'
  ],
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#16a085' },
  /*
   ** Build configuration
   */
  build: {
    postcss: {
      plugins: {
        'postcss-custom-properties': false
      }
    },
    /*
     ** Run ESLINT on save
     */
    extend (config, ctx) {
      if (ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}
