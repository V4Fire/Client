# build/webpack/loaders/measure-loader

This loader measures the total execution time of loaders.

## Usage

It should be inserted between existing loaders in the configuration.
Assume the webpack config with the following loaders:

```js
// webpack.config.js
const webpackConfig = {
  name: 'default',
  module: {
    rules: [
      {
        test: /\.sass$/,
        exclude: /node_modules/,
        use: [
          'css-loader',
          'sass-loader'
        ],
      },
    ],
  }
}
```


```js
const {wrapLoaders} = require('./build/webpack/loaders/measure-loader');

wrapLoaders(webpackConfig.module.rules);
```

As a result, the loader's list will be changed as follows:

```js
[
  {loader: 'measure-loader', options: {prev: 'css-loader'}},
  'css-loader',
  {loader: 'measure-loader', options: {prev: 'sass-loader', next: 'css-loader'}},
  'sass-loader',
  {loader: 'measure-loader', options: {next: 'sass-loader'}}
]
```

Each time the measure loader is executed, it will save the timestamp for the `next` loader
and calculate the execution time for the `prev` loader.
Mind, `wrapLoaders` does not wrap loaders that are defined as functions.

You can get the metrics using the `getLoadersMetrics` helper:

```js
const {getLoadersMetrics} = require('./build/webpack/loaders/measure-loader');

process.on('beforeExit', () => {
  // Get loaders metrics by compilation name, which is specified in the webpack config
  const {sums} = getLoadersMetrics('default');

  for (const [loader, sum] of sums.entries()) {
    // `sum` is a bigint
    console.log(`${loader} total execution time ${Number(sum)} μs`);
  }
});

```
