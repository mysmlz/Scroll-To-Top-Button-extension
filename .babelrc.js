const modeDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        debug: modeDevelopment,
        useBuiltIns: 'usage',
        corejs: 3,
      },
    ],
  ],
};
