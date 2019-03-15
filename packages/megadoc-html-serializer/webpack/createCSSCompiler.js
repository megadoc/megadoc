const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ROOT = path.resolve(__dirname, '..');
const rootDirectories = [
  path.join(ROOT, 'node_modules'),
  path.resolve(__dirname, '..', '..', '..', 'node_modules'),
  '/node_modules'
]

module.exports = ({ files, outputDir, outputFileName, styleOverrides }) => ({
  output: {
    path: outputDir,
    filename: outputFileName,
    jsonpFunction: 'webpackJsonp_CSS'
  },

  devtool: null,
  entry: files,

  resolve: {
    extensions: [ '', '.less', '.css' ],
    modulesDirectories: [ 'node_modules' ],
    root: rootDirectories,
    fallback: path.join(ROOT, 'ui/css')
  },

  resolveLoader: {
    root: rootDirectories,
    modulesDirectories: [ 'node_modules' ],
  },

  module: {
    loaders: [
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader?limit=100000'
      },

      {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract(
          'style', 'css?importLoaders=1!less?' + JSON.stringify({
            modifyVars: styleOverrides
          })
        )
      },
    ]
  },

  plugins: [
    new webpack.NoErrorsPlugin(),
    new ExtractTextPlugin(outputFileName),
  ]
});