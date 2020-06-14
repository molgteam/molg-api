/**
 * 지금은 사용하지 않는다.
 * express-generator를 사용하면 엔트리 포인트를 찾지 못한다..
 */

const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = () => {
  return {
    entry: {
      server: './bin/www',
    },
    output: {
      path: path.join(__dirname, 'dist'),
      publicPath: '/',
      filename: '[name].js',
    },
    target: 'node',
    node: {
      // Need this when working with express, otherwise the build fails
      __dirname: true, // if you don't put this is, __dirname
      __filename: false, // and __filename return blank or /
    },
    externals: [nodeExternals()], // 외부 모듈 의존성을 끊고 순수 내가 작성한 모듈만 번들링한다. https://jamong-icetea.tistory.com/349
    module: {
      rules: [
        {
          // Transpiles ES6-8 into ES5
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
      ],
    },
    plugins: [
      new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
    ],
  };
};
