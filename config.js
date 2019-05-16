'use strict';

const activeEnv = process.env.ACTIVE_ENV || process.env.NODE_ENV || 'development';
require('dotenv').config({
  path: `.env.${activeEnv}`
});

module.exports = {
  title: `Data visualizations`,
  description: `Collection of good to use data visualizations`,
  author: `Ayush Sharma`,
  googleAnalyticsId: process.env.GOOGLE_ANALYTICS,
};
