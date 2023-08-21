/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

/**
 * @typedef {object} LoadersMetrics
 * @prop {Map<string, bigint>} sums Total execution time for the loader
 * @prop {Map<string, bigint>} timestamps Execution start time for a specific resource and the loader
 * @prop {Map<string, bigint>} firstExecTimestamp Loader's first execution timestamp
 *
 * @typedef {Object<string, LoadersMetrics>} CompilationLoadersMetrics
 */

/** @type {CompilationLoadersMetrics} */
const metrics = {};

/**
 * It measures execution time of loaders
 *
 * @param {string} str
 * @returns {string}
 */
exports.default = function measureLoader(str) {
	// NOTE: `style-loader` is executed in batch before all loaders, currently there is no fix
	const {next, prev} = this.getOptions();

	const
		{name} = this._compilation,
		now = process.hrtime.bigint();

	const {sums, execTimestamps, firstExecTimestamp} = getLoadersMetrics(name);

	if (next) {
		const key = `${next}:${this.resourcePath}`;

		if (!firstExecTimestamp.has(next)) {
			firstExecTimestamp.set(next, now / 1000n);
		}

		if (execTimestamps.has(key)) {
			this.getLogger('measure loader').warn(`Duplicate key: ${key}`);

		} else {
			execTimestamps.set(key, now);
		}
	}

	if (prev) {
		const key = `${prev}:${this.resourcePath}`;

		const
			start = execTimestamps.get(key) ?? now,
			sum = sums.get(prev) ?? 0n;

		sums.set(prev, sum + (now - start) / 1000n);

		execTimestamps.delete(key);
	}

	return str;
};

exports.getLoadersMetrics = getLoadersMetrics;

exports.wrapLoaders = wrapLoaders;

/**
 * Returns loaders metrics for specified compilation
 *
 * @param {string} compilationName
 * @returns {LoadersMetrics}
 */
function getLoadersMetrics(compilationName) {
	if (metrics[compilationName] == null) {
		metrics[compilationName] = {
			sums: new Map(),
			execTimestamps: new Map(),
			firstExecTimestamp: new Map()
		};
	}

	return metrics[compilationName];
}

/**
 * Wraps loaders with measure loader
 *
 * @param {import('webpack').RuleSetRule|import('webpack').RuleSetRule[]|undefined} rules
 * @returns {void}
 */
function wrapLoaders(rules) {
	if (rules == null) {
		return rules;
	}

	if (Array.isArray(rules)) {
		return rules.map(wrapLoaders);
	}

	if (rules.oneOf) {
		rules.oneOf = wrapLoaders(rules.oneOf);
	}

	if (rules.rules) {
		rules.rules = wrapLoaders(rules.rules);
	}

	if (rules.loader) {
		rules.use = [rules.loader];

		if (rules.options) {
			rules.use[0] = {loader: rules.loader, options: rules.options};
			delete rules.options;
		}

		delete rules.loader;
	}

	if (rules.use) {
		if (!Array.isArray(rules.use)) {
			rules.use = [rules.use];
		}

		const wrapped = [];
		let
			next = null,
			prev = null;

		rules.use.forEach((loader, i) => {
			if (Object.isString(loader)) {
				prev = prepareLoaderName(loader);

			} else if (Object.isPlainObject(loader) && Object.isString(loader.loader)) {
				prev = prepareLoaderName(loader.loader);
				modifyEdgeCaseLoader(loader);

			} else {
				console.warn(`Unsupported loader type, ext: ${rules.test}, index: ${i}`);
				prev = null;
			}

			wrapped.push({
				loader: 'measure-loader',
				options: {prev, next}
			}, loader);

			next = prev;
		});

		if (next != null) {
			wrapped.push({
				loader: 'measure-loader',
				options: {next}
			});
		}

		rules.use = wrapped;
	}

	return rules;
}

/**
 * Removes excess path from loaders name
 *
 * @param {string} name
 * @returns {string}
 */
function prepareLoaderName(name) {
	if (/node_modules/.test(name)) {
		return name.replace(/^.+?[/\\]node_modules[/\\]/, '');
	}

	return name;
}

/**
 * Handles edge-cases for specific loaders
 * @param {import('webpack').RuleSetUseItem} loader
 */
function modifyEdgeCaseLoader(loader) {
	if (Object.isPlainObject(loader)) {
		switch (loader.loader) {
			case 'css-loader':
				if (loader.options.importLoaders > 0) {
					loader.options.importLoaders += 1;
				}

				break;

			default:
				// Ignore
		}
	}
}
