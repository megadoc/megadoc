exports.cjs = {
  source: '${ROOT}/**/*.js',
  exclude: null,

  output: [{
    format: 'react',
    path: 'js'//
  }]
};

exports.markdown = {
  source: '${ROOT}/**/*.js',
  exclude: null,

  navigationEntry: {
    enabled: true,
    title: 'Articles'
  },

  route: 'markdown'
};

exports.yardApi = {
  source: '${ROOT}/**/*.js',
  exclude: null,

  showEndpointPath: true
};

