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
	{assetsJSON, assetsJS} = include('build/build.webpack'),
	{getScriptDecl} = include('src/super/i-static-page/modules/ss-helpers/tags'),
	{needInline} = include('src/super/i-static-page/modules/ss-helpers/helpers');

exports.getAssets = getAssets;

/**
 * Returns a map of project assets by the specified entry points
 *
 * @param {!Object<!Array<string>>} entryPoints
 * @returns {!Promise<!Object<string>>}
 */
async function getAssets(entryPoints) {
	const
		assets = {},
		assetsBlueprint = ['webpack.runtime'];

	$C(entryPoints).forEach((el, key) => {
		assetsBlueprint.push(key, `${key}_tpl`, `${key}$style`);
	});

	await $C(assetsBlueprint).async.forEach(fillAssets);
	return assets;

	async function fillAssets(dep) {
		while (!assets[dep]) {
			try {
				$C(fs.readJSONSync(assetsJSON)).forEach((el, key, rawAssets) => {
					assets[key] = rawAssets[key].publicPath;
				});

			} catch {}

			await delay((1).second());
		}
	}
}

exports.getAssetsDecl = getAssetsDecl;

/**
 * Returns declaration of project assets.
 * You need to put this declaration within a script tag or use the "wrap" option.
 *
 * @param {boolean=} [inline] - if true, the declaration is placed as a text
 * @param {boolean=} [wrap] - if true, the declaration is wrapped by a script tag
 * @returns {string}
 */
function getAssetsDecl({inline, wrap}) {
	if (needInline(inline)) {
		const
			decl = fs.readFileSync(assetsJS).toString();

		if (wrap) {
			return getScriptDecl(decl);
		}

		return decl;
	}

	return getScriptDecl({src: webpack.publicPath(webpack.assetsJS)});
}
