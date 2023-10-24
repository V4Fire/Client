/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	config = require('@config/config'),
	path = require('upath');

const
	{src, build, webpack: wp} = config;

const
	hashRgxp = /\[(chunk)?hash(:\d+)?]_/g;

/**
 * RegExp for a hashing output pattern
 * @type {RegExp}
 */
exports.hashRgxp = hashRgxp;

/**
 * Output pattern
 * @type {string}
 */
exports.output = hash(wp.output());

/**
 * Output pattern for assets
 * @type {string}
 */
exports.assetsOutput = hash(wp.assetsOutput());

/**
 * Path for `assets.json`
 * @type {string}
 */
exports.assetsJSON = path.join(src.clientOutput(), wp.assetsJSON());

/**
 * Path for `assets.js`
 * @type {string}
 */
exports.assetsJS = path.join(src.clientOutput(), wp.assetsJS());

/**
 * Path for `dll-manifest.json`
 * @type {string}
 */
exports.dllManifest = path.join(src.clientOutput(), wp.dllOutput({name: 'dll-manifest.json', hash: null}));

/**
 * Cache folder
 * @type {string}
 */
exports.cacheDir = path.join(src.cwd(), 'app-cache', build.hash());

exports.hash = hash;

/**
 * Returns a Webpack output path string from the specified string with hash parameters
 * (for long-term caching)
 *
 * @param {string} output - source string
 * @param {boolean} [chunk] - if true, then the specified output is a chunk
 * @returns {string}
 */
function hash(output, chunk) {
	return output.replace(hashRgxp, chunk ? `[chunkhash:${build.hashLength}]_` : `[contenthash:${build.hashLength}]_`);
}

exports.inherit = inherit;

/**
 * Alias for `Object.mixin({deep, concatArray})`
 *
 * @param {Array} args
 * @returns {object}
 */
function inherit(...args) {
	const extOpts = {
		deep: true,
		concatArrays: Array.union
	};

	return Object.mixin(extOpts, {}, ...args);
}

exports.isStandalone = isStandalone;

/**
 * Returns true if the specified entry point is standalone
 *
 * @param {string} entryPoint
 * @returns {boolean}
 */
function isStandalone(entryPoint) {
	return entryPoint === 'std' || /\.(worker|standalone)\b/.test(entryPoint);
}

exports.getManagedPath = getManagedPath;

/**
 * Returns managed path (starting with node_modules) for webpack `snapshot.managedPaths` option
 *
 * @param {string|string[]} exclude
 * @returns {RegExp}
 * @example
 * ```js
 * getManagedPath(['@v4fire/client', '@v4fire/core'])
 * // or
 * getManagedPath('@v4fire[\\\\/]client|@v4fire[\\\\/]core')
 * ```
 */
function getManagedPath(exclude) {
	const excludeStr = Array.isArray(exclude) ? prepareLibsForRegExp(exclude) : exclude;
	return new RegExp(`^(.+?[\\\\/]node_modules[\\\\/](?!(${excludeStr}))(@.+?[\\\\/])?.+?)[\\\\/]`);
}

exports.prepareLibsForRegExp = prepareLibsForRegExp;

/**
 * Prepares lib list for regexp
 *
 * @param {string[]} libs
 * @returns {string}
 * @example
 * ```js
 * prepareLibsForRegExp(['@v4fire/client', '@v4fire/core']) // '@v4fire[\\\\/]client|@v4fire[\\\\/]core'
 * ```
 */
function prepareLibsForRegExp(libs) {
	return libs.map((el) => {
		const src = Object.isString(el) ? el : el.src;
		return src.split(/[/\\]/).map(RegExp.escape).join('[\\\\/]');
	})
		.join('|');
}

exports.createDepRegExp = createDepRegExp;

/**
 * Returns regexp which matches all dependencies except the excluded.
 * It can be used to detect external dependencies.
 *
 * @param {string|string[]} exclude
 * @returns {RegExp}
 * @example
 * ```
 * const isExternalDep = createDepRegExp(['@v4fire/client', '@v4fire/core'])
 * // or
 * const isExternalDep = createDepRegExp('@v4fire[\\\\/]client|@v4fire[\\\\/]core')
 *
 * isExternalDep.test('./node_modules/@v4fire/client/bla')              // false
 * isExternalDep.test('./node_modules/@v4fire/client/node_modules/bla') // false
 * isExternalDep.test('./node_modules/bla')                             // true
 * ```
 */
function createDepRegExp(exclude) {
	const excludeStr = Array.isArray(exclude) ? prepareLibsForRegExp(exclude) : exclude;

	return new RegExp(
		'' +

		'^(?:(?!(?:^|[\\\\/])node_modules[\\\\/]).)*' +

		`[\\\\/]?node_modules[\\\\/](?:(?!${excludeStr}).)*$`
	);
}

/**
 * Webpack stats fields that need to be merged
 */
const requireStatsFields = [
	'assets',
	'chunks',
	'modules',
	'entrypoints',
	'namedChunksGroups',
	'assetsByChunkName'
];

/**
 * Merges child compilations from a Webpack stats file into the one entity
 *
 * @param {object} stats
 * @returns {object}
 */
function mergeStats(stats) {
	return stats.children.reduce((acc, compilation, index) => {
		if (index === 0) {
			const allFields = Object.keys(compilation);

			allFields.forEach((field) => {
				if (!requireStatsFields.includes(field)) {
					acc[field] = compilation[field];
				}
			});
		}

		requireStatsFields.forEach((field) => {
			const data = compilation[field];

			if (Array.isArray(data)) {
				if (!acc[field]) {
					acc[field] = [];
				}

				acc[field].push(...data);

			} else {
				if (!acc[field]) {
					acc[field] = {};
				}

				Object.assign(acc[field], data);
			}
		});

		return acc;
	}, {});
}

exports.mergeStats = mergeStats;

/**
 * Returns a new one Webpack stats JSON by merging the specified two stats objects
 *
 * @param {object} statsA
 * @param {object} statsB
 * @returns {string}
 */
function createUnifiedJSONStats(statsA, statsB) {
	const nameToIdentifier = {};

	const hashA = getTmpHashFromStats(statsA);
	const hashB = getTmpHashFromStats(statsB);

	statsB = JSON.parse(
		JSON.stringify(statsB).replace(new RegExp(hashB, 'g'), hashA)
	);

	statsA.modules.forEach((module) => {
		nameToIdentifier[module.name] = module.identifier;
	});

	statsA.chunks.forEach((chunk) => {
		chunk.modules.forEach((module) => {
			if (!nameToIdentifier[module.issuerName]) {
				nameToIdentifier[module.issuerName] = module.issuer;
			}
		});
	});

	statsB.modules.forEach((module) => {
		if (nameToIdentifier[module.name]) {
			module.identifier = nameToIdentifier[module.name];
		}
	});

	statsB.chunks.forEach((chunk) => {
		chunk.modules.forEach((module) => {
			if (nameToIdentifier[module.name]) {
				module.identifier = nameToIdentifier[module.name];
			}

			if (module.issuer) {
				module.issuerPath.forEach((path) => {
					if (nameToIdentifier[path.name]) {
						path.identifier = nameToIdentifier[path.name];
					}
				});

				module.issuer = module.issuerPath[module.issuerPath.length - 1].identifier;
			}

			module.reasons.forEach((reason) => {
				if (nameToIdentifier[reason.moduleName]) {
					reason.moduleIdentifier = nameToIdentifier[reason.moduleName];
					reason.resolvedModuleIdentifier = reason.moduleIdentifier;
				}
			});
		});
	});

	statsB.name = statsA.name;
	return JSON.stringify(statsB);
}

exports.createUnifiedJSONStats = createUnifiedJSONStats;

/**
 * Extracts temp folder hash from the passed Webpack stats object
 *
 * @param {object} stats
 * @returns {string}
 */
function getTmpHashFromStats(stats) {
	const {request} = stats.chunks[0].origins[0];
	return /([\\/])tmp\1(?<hash>.*?)\1/.exec(request).groups.hash;
}
