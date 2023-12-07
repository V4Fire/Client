/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	isMainComponentStyleFile = /[/\\]([bp]-[^/\\]+)[/\\]\1\.styl$/;

/**
 * A Monic replacer is used to apply the styles of the components that have been loaded via the `import` function
 *
 * @param {string} str
 * @param {string} filePath
 * @returns {string}
 *
 * @example
 * ```js
 * import('base/b-list/b-list.styl').then((data) => console.log(data))
 * ```
 */
module.exports = function applyDynamicComponentStylesReplacer(str, filePath) {
	if (isMainComponentStyleFile.test(filePath)) {
		str += `

.${RegExp.$1}
	extends($${RegExp.$1.camelize(false)})

generateImgClasses()

`;
	}

	return str;
};

Object.assign(module.exports, {
	isMainComponentStyleFile
});
