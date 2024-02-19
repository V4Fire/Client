/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const {validators} = require('@pzlr/build-core');
const path = require('upath');

/**
 *
 * @param source
 */
exports.default = function loader(source) {
	let modified = source;

	const componentRegExp = new RegExp(`(${path.sep}|\\|)(${validators.blockTypeList.join('|')})-.+?(${path.sep}|\\|)?`);
	const prefixPathRegExp = new RegExp(`.+(${path.sep}|\\|)src`);

	if (componentRegExp.test(this.resourcePath)) {
		const srcPrefixPath = this.resourcePath.match(prefixPathRegExp)[0];

		// Const segments = this.resourcePath.split(path.sep);
		//
		// while (segments.pop() !== 'src' && segments.length > 0) { }
		//
		const packageJson = require(`${srcPrefixPath}/../package.json`);
		const packageName = packageJson.name;

		modified = modified
			.replace(/@component\((?<options>.*?)\)/s, (...args) => {
				let options = args.at(-1).options.trim();

				if (options !== '') {

				} else {
					options = `{ layer: "${packageName}"}`;
				}

				return `@component(${options})`;
			});

		return source;
	}

	return modified;
};
