/* eslint comma-dangle: "off" */
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const path = require('path');

const PATHS = {
  schema: [
    path.join(__dirname, 'src', 'index.js'),
  ],
  source: [
    path.join(__dirname, 'src'),
  ],
  build: path.join(__dirname, 'dist'),
};

module.exports = {
  entry: {
    schema: PATHS.schema,
  },
  output: {
    path:     PATHS.build,
    filename: '[name].min.js',
  },
  module: {
    rules: [{
      test:    /\.jsx?$/,
      include: PATHS.source,
      loader:  'babel-loader',
    }],
  },
  resolve: {
    extensions: ['.js'],
  },
  devtool: 'source-map',
  plugins: [
    new CleanWebpackPlugin(PATHS.build, {
      root: process.cwd(),
    }),
    new webpack.optimize.UglifyJsPlugin({
      comments: false,
      compress: {
        warnings: false,
      },
      // Mangling specific options
      mangle: {
        screw_ie8: true,
        // keep_fnames: true
      },
    }),
  ],
};
