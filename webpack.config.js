const path = require( 'path' );
const { List, Map } = require( 'immutable' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );
const { CleanWebpackPlugin } = require( 'clean-webpack-plugin' );
const WebpackCleanPlugin = require( 'webpack-clean' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );

const modeDevelopment = process.env.NODE_ENV === 'development';

const defaultConfig = Map( {
  entry: {
    'manifest': './src/manifest.json',
    'background': './src/background/index.js',
    'content-scripts': './src/content-scripts/index.js',
    'options': './src/options/index.js',
    'shared/elements/scroll-to-top-button': './src/shared/elements/scroll-to-top-button.css',
    'shared/legacy/background': './src/background/legacy.js',
    'shared/legacy/context-menus': './src/shared/context-menus/legacy.js',
    'shared/legacy/i18n': './src/shared/i18n/legacy.js',
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
              '@babel/plugin-transform-async-to-generator',
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
            },
          },
        ],
      },
    ],
  },
  plugins: List( [
    new CleanWebpackPlugin(),

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
        {
          from: './src/shared/images',
          to: './shared/images',
        },
      ]
    ),

    new MiniCssExtractPlugin( {
      filename: '[name].css',
    } ),
  ] ),
  resolve: {
    alias: {
      Shared: path.resolve( __dirname, 'src', 'shared' ),
      ContentScripts: path.resolve( __dirname, 'src', 'content-scripts' ),
    },
    fallback: {
      fs: false,
    },
  },
  resolveLoader: {
    modules: [
      path.resolve( __dirname, 'src', 'loaders' ),
      'node_modules',
    ],
  },
  devtool: modeDevelopment ?
    'inline-cheap-module-source-map' :
    false,
  watch: modeDevelopment,
} );

const supportedBrowsers = [
  'chromium',
  'firefox',
  // 'edge',
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
            'shared/elements/scroll-to-top-button.js',
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
