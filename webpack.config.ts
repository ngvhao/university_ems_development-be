import { join } from 'path';
import { lib } from 'serverless-webpack';
import nodeExternals from 'webpack-node-externals';

export const entry = lib.entries;
export const target = 'node';
export const mode = 'production';
export const optimization = {
  minimize: true,
};
export const externals = [nodeExternals()];
export const output = {
  libraryTarget: 'module',
  path: join(__dirname, '.webpack'),
  filename: '[name].js',
  chunkFormat: 'module',
  environment: {
    module: true,
  },
};
export const experiments = {
  outputModule: true,
};
export const resolve = {
  extensions: ['.ts', '.js'],
};
export const module = {
  rules: [
    {
      test: /\.ts$/,
      exclude: /node_modules/,
      use: {
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
      },
    },
  ],
};
