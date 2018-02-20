'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	$C = require('collection.js'),
	fs = require('fs'),
	hasha = require('hasha');

const
	{output} = include('build/build.webpack');

/**
 * WebPack plugin for dependencies.js
 *
 * @param {{entry, processes, dependencies}} build - build object
 * @returns {!Function}
 */
module.exports = function ({build}) {
	return {
		apply(compiler) {
			compiler.plugin('emit', (compilation, cb) => {
				$C(build.dependencies).forEach((el, key, data) => {
					if (key !== 'index' && !el.has('index')) {
						data[key] = new Set(['index', ...el]);
					}

					el.add(key);

					const
						content = `ModuleDependencies.add("${key}", ${JSON.stringify([...el])});`,
						name = `${key}.dependencies`;

					const src = output
						.replace(/\[name]/g, `${name}.js`)
						.replace(/\[hash:?(\d*)]/, (str, length) => {
							const res = hasha(content, {algorithm: 'md5'});
							return length ? res.substr(0, Number(length)) : res;
						});

					fs.writeFileSync(src, content);
				});

				cb();
			});
		}
	};
};
