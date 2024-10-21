/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const {validators} = require('@pzlr/build-core');
const {
	invokeByRegisterEvent,
	getLayerName
} = include('build/helpers');

const
	{commentModuleExpr: commentExpr} = include('build/const');

const importRgxp = new RegExp(
	`\\bimport${commentExpr}\\((${commentExpr})(["'])((?:.*?[\\\\/]|)([bp]-[^.\\\\/"')]+)+)\\2${commentExpr}\\)`,
	'g'
);

module.exports = async function lazyComponentImport(str, filePath) {
	const
		isComponentPath = new RegExp(`\\/(${validators.blockTypeList.join('|')})-.+?\\/?`).test(filePath);

	// if (!isComponentPath) {
	// 	return str;
	// }

	// console.log(str);
	
	return str.replace(importRgxp, (str, magicComments, q, resourcePath, resourceName) => {
		// console.log(resourcePath);

		return str;
		// return invokeByRegisterEvent(str, getLayerName(filePath), resourceName);
	});
}