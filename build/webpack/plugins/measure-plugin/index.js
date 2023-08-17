/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	{createWriteStream} = require('fs'),
	path = require('upath');

/** @type {import('../../../helpers/tracer')} */
const {tracer} = include('build/helpers/tracer');

module.exports = class MeasurePlugin {
	static activeCompilers = 0;

	eventCallbacks = new Map();

	output = '';

	/**
	 * @param {*} [param0]
	 * @param {string} [param0.output] - output filename relative to `process.cwd()`
	 */
	constructor({output = 'measure.json'} = {}) {
		this.output = output;
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

			tracer.trace.instantEvent({name: 'Build finished'});

			const ws = createWriteStream(path.resolve(process.cwd(), this.output));

			ws.on('error', (error) => {
				logger.error(`Measure write failed, reason: ${error.message}`);
			});

			ws.on('close', cb);

			tracer.trace.pipe(ws);
			tracer.trace.flush();

		});
	}
};
