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
	dasherize = require('string-dasherize');

const
	args = require('arg')({'--runner': String}, {permissive: true}),
	runner = args['--runner'] || 'render';

const
	componentDir = pzlr.resolve.blockSync('b-virtual-scroll'),
	helpers = require(path.join(componentDir, 'test/helpers.js'));
	test = require(path.join(componentDir, `test/runners/${dasherize(runner)}.js`));

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
