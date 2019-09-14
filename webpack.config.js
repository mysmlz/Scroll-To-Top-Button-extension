const path = require( 'path' );
const { List, Map } = require( 'immutable' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );
const CleanWebpackPlugin = require( 'clean-webpack-plugin' );
const WebpackCleanPlugin = require( 'webpack-clean' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );

const modeDevelopment = process.env.NODE_ENV === 'development';

const defaultConfig = Map( {
  entry: {
    'manifest': './src/manifest.json',
    'content-scripts/content-scripts': './src/content-scripts/content-scripts.js',
    'shared/custom-elements/custom-elements': './src/shared/custom-elements/custom-elements.js',
    'options/options': './src/options/options.js',
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
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-proposal-private-methods',
            ],
          },
        },
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [
                require( 'precss' )(),
              ],
            },
          },
        ],
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
        {
          from: './src/shared/buttons',
          to: './shared/buttons',
        },
      ]
    ),

    new MiniCssExtractPlugin( {
      filename: '[name].css',
    } ),
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
  devtool: modeDevelopment ?
    'inline-cheap-module-source-map' :
    false,
  watch: modeDevelopment,
} );

const supportedBrowsers = [
  'chromium',
  'firefox',
  'edge',
];

module.exports = supportedBrowsers.map( browserName => {
  return defaultConfig
    // Create a separate dist folder for each browser
    .updateIn(
      [
        'output',
        'path',
      ],
      () => path.resolve( __dirname, 'dist', browserName ),
    )
    // Remove unused automatically-created JavaScript files post-build
    .updateIn(
      [
        'plugins',
      ],
      value => value.push(
        new WebpackCleanPlugin(
          [
            'manifest.js',
          ],
          {
            basePath: path.resolve( __dirname, 'dist', browserName ),
          },
        ),
      ),
    )
    .toJS()
    ;
} );
