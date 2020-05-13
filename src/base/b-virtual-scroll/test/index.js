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
	componentDir = pzlr.resolve.blockSync('b-virtual-scroll'),
	test = require(path.join(componentDir, `test/runners/${suit}.js`));

module.exports = async (page, params) => {
	await setup(page);
	await test(page, {...(await getComponentProps(page)), ...params});
}

async function setup(page) {
	await page.evaluate(`setEnv('mock', {patterns: ['.*']});`);
	await page.reload();
}

async function getComponentProps(page) {
	const
		componentSelector = '.b-virtual-scroll',
		component = await (await page.$(componentSelector)).getProperty('component');

	return {componentSelector, component};
}
