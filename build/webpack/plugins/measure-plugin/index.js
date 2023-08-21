/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	{tracer} = include('build/helpers/tracer'),
	{writeToStdout, writeToFile, traceLoaders, timestamp} = include('build/webpack/plugins/measure-plugin/helpers');

/**
 * This plugin measures build times and outputs them to stdout,
 * it also can create detailed trace file when `trace = true`
 */
module.exports = class MeasurePlugin {
	/**
	 * Active compiler count. It is static because plugin is applied to multiple configurations.
	 */
	static activeCompilers = 0;

	/**
	 * Store for pending events
	 */
	events = new Map();

	/**
	 * Output filename
	 */
	output = '';

	/**
	 * Enable detailed trace
	 */
	trace = false;

	/**
	 * @param {*} [param0]
	 * @param {string} [param0.output] - output filename relative to `process.cwd()`
	 * @param {boolean} [param0.trace] - perform detailed trace of the build
	 */
	constructor({output = 'trace.json', trace = false} = {}) {
		this.output = output;
		this.trace = trace;
	}

	/**
	 * Applies measurements to webpack build
	 * @param {import('webpack').Compiler} compiler
	 */
	apply(compiler) {
		if (compiler.watchMode) {
			return;
		}

		const logger = compiler.getInfrastructureLogger(this.constructor.name);

		compiler.hooks.compilation.tap(this.constructor.name, (compilation) => {
			MeasurePlugin.activeCompilers++;

			const {name} = compilation;
			const event = {
				name: `Compilation '${name}'`,
				id: ++tracer.counter,
				cat: [`compilation.${name}`],
				ts: timestamp()
			};

			tracer.trace.begin(event);
			this.events.set(`compilation.${name}`, event);
		});

		compiler.hooks.done.tap(this.constructor.name, (stats) => {
			const
				{name} = stats.compilation,
				key = `compilation.${name}`;

			const
				event = this.events.get(key);

			if (this.trace) {
				traceLoaders(name, event);
			}

			if (event != null) {
				tracer.trace.end({...event, ts: timestamp()});
			}

			this.events.delete(key);
		});

		compiler.hooks.shutdown.tapAsync(this.constructor.name, (cb) => {
			if (--MeasurePlugin.activeCompilers > 0) {
				return cb();
			}

			tracer.trace.instantEvent({name: 'Total time'});

			if (this.trace) {
				writeToFile(cb, {logger, filename: this.output});

			} else {
				writeToStdout(cb);
			}
		});
	}
};
