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
	{writeToStdout, writeToFile} = include('build/webpack/plugins/measure-plugin/helpers');

/**
 * This plugin measures build times and outputs them to stdout,
 * it also can create detailed trace file if `writeToFile = true`
 */
module.exports = class MeasurePlugin {
	static activeCompilers = 0;

	eventCallbacks = new Map();

	output = '';

	writeToFile = false;

	/**
	 * @param {*} [param0]
	 * @param {string} [param0.output] - output filename relative to `process.cwd()`
	 * @param {boolean} [param0.writeToFile] - output trace to file
	 */
	constructor({output = 'trace.json', writeToFile = false} = {}) {
		this.output = output;
		this.writeToFile = writeToFile;
	}

	/**
	 * Applies measurements to webpack build
	 * @param {import('webpack').Compiler} compiler
	 */
	apply(compiler) {
		const logger = compiler.getInfrastructureLogger(this.constructor.name);

		compiler.hooks.compilation.tap(this.constructor.name, (compilation) => {
			MeasurePlugin.activeCompilers++;

			const {name} = compilation;
			const event = {
				name: `Compilation '${name}'`,
				id: ++tracer.counter,
				cat: [`compilation.${name}`]
			};

			tracer.trace.begin(event);
			this.eventCallbacks.set(`compilation.${name}`, () => tracer.trace.end(event));
		});

		compiler.hooks.done.tap(this.constructor.name, (stats) => {
			const
				{name} = stats.compilation,
				key = `compilation.${name}`;

			const
				done = this.eventCallbacks.get(key);

			if (typeof done === 'function') {
				done();
			}

			this.eventCallbacks.delete(key);
		});

		compiler.hooks.shutdown.tapAsync(this.constructor.name, (cb) => {
			if (--MeasurePlugin.activeCompilers > 0) {
				return cb();
			}

			tracer.trace.instantEvent({name: 'Total time'});

			if (this.writeToFile) {
				writeToFile(cb, {logger, filename: this.output});

			} else {
				writeToStdout(cb);
			}
		});
	}
};
