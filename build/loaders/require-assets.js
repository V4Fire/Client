'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	build = include('build/entries.webpack'),
	fs = require('fs-extra-promise');

const
	includedIcons = new Set(),
	replaceRegExp = /requireAsset\((.*?)\)/g;

/**
 * Finds an icon declaration and appends it to the build
 *
 * @param {string} str
 * @returns {string}
 */
module.exports = async function (str) {
	const
		graph = await build,
		filePath = graph.entry['a-svg.js'];

	return str.replace(replaceRegExp, (str, name) => {
		const
			url = `sprite/${name}.svg?sprite`;

		if (!includedIcons.has(url)) {
			includedIcons.add(url);
			fs.writeFileSync(
				filePath,
				Array.from(includedIcons).reduce((res, u) => (res, res += `require('${u}');\n`), '')
			);
		}

		return '';
	});
};
