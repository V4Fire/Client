/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	$C = require('collection.js');

const
	{webpack} = require('@config/config'),
	{resolve} = require('@pzlr/build-core');

if (webpack.ssr) {
	/**
	 * Returns parameters for `webpack.externals`
	 * @returns {Array}
	 */
	module.exports = function externals() {
		const cache = Object.createDict();

		return [
			({request}, cb) => {
				if (cache[request] != null) {
					return cb(...cache[request]);
				}

				if (resolve.isNodeModule(request)) {
					try {
						require.resolve(request);

						try {
							require.resolve(resolve.blockSync(request));

						} catch {
							require(request);
							cache[request] = [null, `commonjs ${request}`];
							return cb(...cache[request]);
						}

					} catch {}
				}

				cache[request] = [];
				cb();
			}
		];
	};

} else {
	const
		{STANDALONE} = include('build/const');

	const
		externalList = [],
		asRgxp = /^\/(.*?)\/$/;

	const externalMap = $C(webpack.externals()).filter((el, key) => {
		if (!asRgxp.test(key)) {
			return true;
		}

		const
			rgxp = new RegExp(RegExp.$1);

		externalList.push((ctx, req, cb) => {
			if (rgxp.test(req)) {
				return cb(null, `root ${Object.isDictionary(el) ? el.root : el}`);
			}

			cb();
		});

		return false;

	}).map();

	/**
	 * Returns parameters for `webpack.externals`
	 *
	 * @param {(number|string)} buildId
	 * @returns {Array}
	 */
	module.exports = function externals({buildId}) {
		if (buildId !== STANDALONE) {
			return [externalMap].concat(externalList);
		}

		return [];
	};
}
