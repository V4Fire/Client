/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	path = require('upath'),
	pzlr = require('@pzlr/build-core'),
	args = require('arg')({'--suit': String}, {permissive: true});

let
	suit = 'render';

if (args['suit']) {
	suit = args['suit'];
}

const
	componentDir = pzlr.resolve.blockSync('b-virtual-scroll');

const
	helpers = require(path.join(componentDir, 'test/helpers.js'));
	test = require(path.join(componentDir, `test/runners/${suit}.js`));

module.exports = async (page, params) => {
	await setup(page);
	await test(page, {...(await helpers.getComponentProps(page)), ...params});
}
/**
 * Setups an environment
 * @param {*} page
 */
async function setup(page) {
	await page.evaluate(`setEnv('mock', {patterns: ['.*']});`);
	await page.reload();
}
