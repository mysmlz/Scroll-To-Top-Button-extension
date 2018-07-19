const path = require( 'path' );
const { List, Map } = require( 'immutable' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );
const CleanWebpackPlugin = require( 'clean-webpack-plugin' );

const modeDevelopment = process.env.NODE_ENV === 'development';

const defaultConfig = Map( {
  entry: {
    'manifest': './src/manifest.json',
  },
  output: Map( {
    filename: '[name].js',
    chunkFilename: '[name].js',
    path: path.resolve( __dirname, 'dist' ),
  } ),
  module: {
    rules: [
      {
        test: /manifest.json$/,
        exclude: /node_modules/,
        loader: 'manifest-loader',
      },
    ],
  },
  plugins: List( [
    new CleanWebpackPlugin(
      [
        'dist',
      ]
    ),

    new CopyWebpackPlugin(
      [
        {
          from: './static',
          to: './',
        },
      ]
    ),
  ] ),
  resolveLoader: {
    modules: [
      path.resolve( __dirname, 'src', 'loaders' ),
      'node_modules',
    ],
  },
  node: {
    fs: 'empty',
  },
  devtool: undefined,
  watch: modeDevelopment,
} );

const supportedBrowsers = [
  'chromium',
  'firefox',
  'edge',
];

module.exports = supportedBrowsers.map( browserName => {
  return defaultConfig
    // Separate dist folder for each browser
    .updateIn(
      [
        'output',
        'path',
      ],
      () => path.resolve( __dirname, 'dist', browserName ),
    )
    .toJS()
    ;
} );
