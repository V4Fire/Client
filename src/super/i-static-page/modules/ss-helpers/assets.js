/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{webpack} = require('config');

const
	$C = require('collection.js');

const
	fs = require('fs-extra-promise'),
	delay = require('delay');

const
	{assetsJS, assetsJSON, isStandalone} = include('build/helpers.webpack');

const
	{getScriptDecl} = include('src/super/i-static-page/modules/ss-helpers/tags'),
	{needInline} = include('src/super/i-static-page/modules/ss-helpers/helpers');

exports.getAssets = getAssets;

/**
 * Returns a map of static page assets by the specified entry points
 *
 * @param {!Object<!Array<string>>} entryPoints
 * @returns {!Promise<!Object<string>>}
 */
async function getAssets(entryPoints) {
	const
		assets = {},
		assetsBlueprint = ['webpack'];

	$C(entryPoints).forEach((el, key) => {
		assetsBlueprint.push(key);

		if (!isStandalone(key)) {
			assetsBlueprint.push(`${key}_tpl`, `${key}_style`);
		}
	});

	await $C(assetsBlueprint).async.forEach(fillAssets);
	return assets;

	async function fillAssets(dep) {
		while (!assets[dep]) {
			try {
				$C(fs.readJSONSync(assetsJSON)).forEach((el, key, rawAssets) => {
					assets[key] = rawAssets[key];
				});

			} catch {}

			await delay((1).second());
		}
	}
}

exports.getAssetsDecl = getAssetsDecl;

/**
 * Returns declaration of project assets
 *
 * @param {boolean=} [inline] - if true, the declaration is placed as a text
 * @param {boolean=} [wrap] - if true, the declaration is wrapped by a script tag
 * @param {boolean=} [documentWrite] - if true, the function returns JS code to load
 *   the declaration by using document.write
 *
 * @returns {string}
 */
function getAssetsDecl({inline, wrap, documentWrite} = {}) {
	if (needInline(inline)) {
		const decl = fs.readFileSync(assetsJS).toString();
		return wrap ? getScriptDecl(decl) : decl;
	}

	const decl = getScriptDecl({src: webpack.publicPath(webpack.assetsJS()), documentWrite});
	return documentWrite && wrap ? getScriptDecl(decl) : decl;
}
