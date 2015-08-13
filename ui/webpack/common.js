var path = require("path");
var extend = require("lodash").extend;

var nodeEnv = process.env.NODE_ENV;
var baseConfig = {
  devtool: nodeEnv === 'production' ? null : 'eval',

  resolve: {
    // We will make webpack look in our own node_modules/ first so that any
    // look-up from plugins to libraries we support, like react and lodash,
    // won't resolve to that plugin's version of the library in its
    // node_modules/ folder.
    // root: path.resolve(__dirname, '..', 'node_modules'),

    fallback: [
      path.resolve(__dirname, '..', 'app', 'shared')
    ],

    modulesDirectories: [
      'css',
      'shared',
      'node_modules'
    ],

    alias: {
      'qtip': path.join(__dirname, '..', 'app', 'vendor', 'jquery.qtip.js')
    }
  },

  resolveLoader: {
    // root: path.resolve(__dirname, '..', 'node_modules')
  },

  module: {
    loaders: [
      {
        test: /(app|qjunk)\/(.*)\.js$/,
        loader: [
          'babel-loader',
          'wrap-loader?js',
          'react-hot'
        ].join('!')
      },

      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader?limit=100000'
      },

      {
        test: /\.less$/,
        loader: 'style-loader!css-loader?importLoaders=1!less-loader'
      },

      {
        test: /\.css$/,
        loader: 'style-loader!css-loader?importLoaders=1'
      }
    ]
  },

  wrap: {
    js: {
      before: '(function(){\n',
      after: '}());'
    }
  }
};

module.exports = function(overrides) {
  return extend({}, baseConfig, overrides);
};
