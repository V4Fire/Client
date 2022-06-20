/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{webpack} = require('@config/config');

const
	fs = require('fs-extra'),
	$C = require('collection.js');

const
	{assetsJS, assetsJSON, isStandalone} = include('build/helpers'),
	{getScriptDecl} = include('src/super/i-static-page/modules/ss-helpers/tags'),
	{needInline} = include('src/super/i-static-page/modules/ss-helpers/helpers');

exports.getAssets = getAssets;

/**
 * Returns a map of static page assets by the specified entry points
 *
 * @param {!Object<!Array<string>>} entryPoints
 * @returns {!Promise<!Object<string>>}
 */
function getAssets(entryPoints) {
	const
		assets = {},
		assetsBlueprint = [];

	$C(entryPoints).forEach((el, key) => {
		assetsBlueprint.push(key);

		if (!isStandalone(key)) {
			assetsBlueprint.push(`${key}_tpl`, `${key}_style`);
		}
	});

	assetsBlueprint.forEach(() => {
		const fileList = fs.readJSONSync(assetsJSON);

		$C(fileList).forEach((el, key, rawAssets) => {
			assets[key] = rawAssets[key];
		});
	});

	return assets;
}

exports.getAssetsDecl = getAssetsDecl;

/**
 * Returns declaration of project assets
 *
 * @param {boolean=} [inline] - if true, the declaration is placed as a text
 * @param {boolean=} [wrap] - if true, the declaration is wrapped by a script tag
 * @param {boolean=} [js] - if true, the function returns JS code to load the declaration
 * @returns {string}
 */
function getAssetsDecl({inline, wrap, js} = {}) {
	if (needInline(inline)) {
		const decl = fs.readFileSync(assetsJS).toString();
		return wrap ? getScriptDecl(decl) : decl;
	}

	const decl = getScriptDecl({src: webpack.publicPath(webpack.assetsJS()), js});
	return js && wrap ? getScriptDecl(decl) : decl;
}
