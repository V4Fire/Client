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
	{loadLibs, loadStyles, loadLinks} = include('src/super/i-static-page/modules/ss-helpers/libs'),
	{normalizeAttrs} = include('src/super/i-static-page/modules/ss-helpers/tags'),
	{getAssetsDecl} = include('src/super/i-static-page/modules/ss-helpers/assets'),
	{getScriptDeclByName, loadEntryPointDependencies} = include('src/super/i-static-page/modules/ss-helpers/entry-point'),
	{getVarsDecl, getInitLibDecl} = include('src/super/i-static-page/modules/ss-helpers/base-declarations');

exports.generateInitJS = generateInitJS;

async function generateInitJS(name, {
	deps,
	entryPoint,

	assets,
	assetsRequest,

	rootTag,
	rootAttrs
}) {
	const
		head = [],
		body = [];

	// - block links
	head.push(await loadLinks(deps.links, {assets, documentWrite: true}));

	// - block headScripts
	head.push(
		getVarsDecl(),
		await loadLibs(deps.headScripts, {assets, documentWrite: true})
	);

	{
		const
			name = rootAttrs['data-root-component'],
			attrs = normalizeAttrs(rootAttrs);

		body.push(
			`document.write('<${rootTag} class=".i-static-page.${name}" ${attrs}></${rootTag}>')`
		);
	}

	// - block styles
	body.push(
		await loadStyles(deps.styles, {assets, documentWrite: true}),
		loadEntryPointDependencies(entryPoint, {type: 'styles'})
	);

	// - block assets
	body.push(getAssetsDecl({inline: !assetsRequest, documentWrite: true}));

	// - block scripts
	body.push(
		await getScriptDeclByName('std', {optional: true}),

		await loadLibs(deps.scripts, {assets, documentWrite: true}),
		getInitLibDecl(),

		getScriptDeclByName('vendor', {optional: true}),
		loadEntryPointDependencies(entryPoint, {type: 'scripts'}),
		getScriptDeclByName('webpack.runtime', {optional: true})
	);

	const bodyInitializer = `
function $__RENDER_ROOT() {
	${body.join('\n')}
}
`;

	fs.writeFileSync(
		src.clientOutput(`${name}.init.js`),
		head.join('\n') + bodyInitializer
	);
}
