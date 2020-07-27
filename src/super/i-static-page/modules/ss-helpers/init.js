/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	fs = require('fs-extra-promise');

const
	{src} = require('config');

const
	h = include('src/super/i-static-page/modules/ss-helpers');

exports.generateInitJS = generateInitJS;

async function generateInitJS(name, {deps, selfDeps, assets}) {
	const opts = {
		assets,
		documentWrite: true
	};

	const
		head = [],
		body = [];

	head.push(await h.loadLibs(deps.headScripts, opts));
	head.push(await h.loadLinks(deps.links, opts));

	body.push(await h.loadStyles(deps.styles, opts));
	//body.push(await h.loadDependencies(selfDeps));
	body.push(await h.getScriptDepDecl('std', {optional: true}));

	fs.writeFileSync(src.clientOutput(`${name}.init-head.js`), head.join('\n'));
	fs.writeFileSync(src.clientOutput(`${name}.init-body.js`), body.join('\n'));
}
