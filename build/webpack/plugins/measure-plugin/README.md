# build/webpack/plugins/measure-plugin

This plugin outputs a summary of build times to stdout and can also measure the total execution time of each loader.

In trace mode, a special file is generated, which can be visualized in the [Perfetto UI](https://ui.perfetto.dev/#!/info) or via the `browser://tracing`.

The file is generated in the [Trace Event Format](https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU/edit#heading=h.q8di1j2nawlp).

The execution time of loaders is measured by [measure-loader](../../loaders/measure-loader.js).

## Usage

_Disclaimer: plugin is enabled by default in dev mode_

To generate the trace file of the build, run:

`yarn webpack --env module-parallelism=1 --env trace-build-times=true`

## Options

- output - the name of the trace file, default: trace.json
- trace - enable trace mode, default: false

## Output

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

If trace mode is enabled, a trace file will be generated instead.

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
