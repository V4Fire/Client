/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{getScriptDecl} = include('src/super/i-static-page/modules/ss-helpers/tags'),
	{i18n} = require('@config/config');

exports.getI18nDecl = getI18nDecl;

/**
 * Returns declaration of global i18n variable.
 * You need to put this declaration within a script tag or use the "wrap" option.
 *
 * @param {boolean=} [wrap] - if true, the declaration is wrapped by a script tag
 * @returns {string}
 */
function getI18nDecl({wrap} = {}) {
	const decl = `var ${i18n.translatesGlobalPath} = {};`;

	return wrap ? getScriptDecl(decl) : decl;
}
