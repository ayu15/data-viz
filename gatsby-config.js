'use strict'

const siteConfig = require('./config.js')

module.exports = {
  siteMetadata: {
    title: siteConfig.title,
    description: siteConfig.description,
    author: siteConfig.author,
  },
  plugins: [
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'assets',
        path: `${__dirname}/static`,
      },
    },
    `gatsby-plugin-react-helmet`,
    {
      resolve: 'gatsby-plugin-google-analytics',
      options: {
        trackingId: siteConfig.googleAnalyticsId,
      },
    },
    `gatsby-plugin-sass`,
    `gatsby-plugin-typescript`,
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'Data visualizations',
        short_name: 'Data viz',
        start_url: '/',
        background_color: '#FFF',
        theme_color: '#F7A046',
        display: 'standalone',
        icon: 'static/photo2.png',
      },
    },
  ],
}
