# build/webpack/plugins/measure-plugin

This plugin outputs a summary of build times to stdout or a file
and can also measure the overall execution time of each loader.

When saving the summary to a file, it uses a [format](https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU/edit#heading=h.q8di1j2nawlp)
that can be visualized in [Perfetto UI](https://ui.perfetto.dev/#!/info) or through `browser://tracing`.

The execution time of loaders is measured by [measure-loader](../../loaders/measure-loader).

## Usage

_Disclaimer: this plugin is enabled by default in development mode._

To generate the trace file of the build, run the following command:

```bash
yarn webpack --env module-parallelism=1 --env trace-build-times=true
```

The plugin will output the following summary to stdout:

```
--- Summary ---
Build graph: 0.35s
Generate webpack config: 0.65s
Compilation 'runtime': 17.47s
Compilation 'standalone': 8.12s
Compilation 'styles': 17.87s
Compilation 'html': 0.84s
Total time: 19.82s
```

If tracing mode is enabled, a trace file will be created instead.

## Options

### [trace = `false`]

If set to true, the tracing mode will be enabled.

### [output = `'trace.json'`]

The name of the file where the report will be saved when using the tracing mode.

## Configuration

Example for the arbitrary webpack config:

```js
// webpack.config.js

const {wrapLoaders} = include('build/webpack/loaders/measure-loader');
const MeasurePlugin = include('build/webpack/plugins/measure-plugin');

const config = {
  // ...
  plugins: [
    new MeasurePlugin({
      output: 'trace.json',
      trace: true
    })
  ],

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ['ts-loader']
      }
    ],
  }
};

wrapLoaders(config.module.rules);

module.exports = config;
```

Note: the execution time of loaders defined via functions is not measured.
