/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

require('../interface');

const
	$C = require('collection.js');

const
	fs = require('fs-extra-promise'),
	delay = require('delay');

const
	{webpack, src} = require('config'),
	{needInline} = include('src/super/i-static-page/modules/ss-helpers/helpers');

exports.initAssets = initAssets;

/**
 * Initializes the specified assets
 *
 * @param {!Object<string>} assets - map with assets
 * @param {!Object<!Array<string>>} dependencies - map of project dependencies
 * @returns {!Promise<!Object<string>>}
 */
async function initAssets(assets, dependencies) {
	if (!needInline()) {
		return assets;
	}

	$C(dependencies).forEach((el, key) => {
		const nm = webpack.output({name: key});
		assets[key] = `${nm}.js`;
		assets[`${key}_tpl`] = `${nm}_tpl.js`;
		assets[`${key}$style`] = `${nm}$style.css`;
	});

	await $C(assets).async.forEach(wait);

	// eslint-disable-next-line require-atomic-updates
	assets['std'] = `${webpack.output({name: 'std'})}.js`;

	// eslint-disable-next-line require-atomic-updates
	assets['vendor'] = `${webpack.output({name: 'vendor'})}.js`;

	// eslint-disable-next-line require-atomic-updates
	assets['webpack.runtime'] = `${webpack.output({name: 'webpack.runtime'})}.js`;

	return assets;

	async function wait(path) {
		while (!fs.existsSync(src.clientOutput(path))) {
			await delay(200);
		}
	}
}
