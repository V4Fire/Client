/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

require('../interface');

const
	{src, csp} = require('config');

const
	path = require('upath'),
	fs = require('fs-extra-promise');

const
	{needInline} = include('src/super/i-static-page/modules/ss-helpers/helpers'),
	{getAssetsDecl} = include('src/super/i-static-page/modules/ss-helpers/assets'),
	{getScriptDecl, getStyleDecl, normalizeAttrs} = include('src/super/i-static-page/modules/ss-helpers/tags'),
	{loadLibs, loadStyles, loadLinks} = include('src/super/i-static-page/modules/ss-helpers/libs'),
	{getVarsDecl, getInitLibDecl} = include('src/super/i-static-page/modules/ss-helpers/base-declarations');

const
	globals = include('build/globals.webpack');

const nonce = {
	nonce: csp.nonce
};

exports.getScriptDeclByName = getScriptDeclByName;

/**
 * Returns declaration of a script tag to load a library by the specified name.
 *
 * The names are taken on entry points from "src/entries".
 * The function returns JS code to load the library by using document.write.
 * You need to put this declaration within a script tag or use the "wrap" option.
 *
 * @param {string} name
 * @param {DepOptions=} [opts] - additional options
 * @param {Object<string>=} [assets] - map with assets
 * @returns {string}
 */
function getScriptDeclByName(name, opts, assets) {
	opts = {defer: true, ...opts};

	if (needInline(opts.inline)) {
		if (assets[name]) {
			const
				filePath = path.join(src.clientOutput(assets[name]));

			if (fs.existsSync(filePath)) {
				const decl = `include(${filePath})`;
				return opts.wrap ? getScriptDecl(decl) : decl;
			}

		} else if (!opts.optional) {
			throw new ReferenceError(`Script dependency with id "${name}" is not defined`);
		}

		return '';
	}

	const attrs = normalizeAttrs({
		staticAttrs: `src="' + PATH['${name}'] + '"`,
		defer: opts.defer !== false,
		...nonce
	});

	const script = [
		`'<script ${attrs}' +`,
		"'><' +",
		"'/script>'"
	].join(' ');

	let
		decl = `document.write(${script});`;

	if (opts.optional) {
		decl = `if ('${name}' in PATH) {
	${decl}
}`;
	}

	return opts.wrap ? getScriptDecl(decl) : decl;
}

exports.getStyleDeclByName = getStyleDeclByName;

/**
 * Returns declaration of a script tag to load a style library by the specified name.
 *
 * The names are taken on entry points from "src/entries".
 * The function returns JS code to load the library by using document.write.
 * You need to put this declaration within a script tag or use the "wrap" option.
 *
 * @param {string} name
 * @param {DepOptions=} [opts] - additional options
 * @param {Object<string>=} [assets] - map with assets
 * @returns {string}
 */
function getStyleDeclByName(name, opts, assets) {
	opts = {defer: true, ...opts};

	const
		rname = `${name}$style`;

	if (needInline(opts.inline)) {
		if (assets[rname]) {
			const
				filePath = path.join(src.clientOutput(assets[rname]));

			if (fs.existsSync(filePath)) {
				const decl = `include(${filePath})`;
				return opts.wrap ? getStyleDecl(decl) : decl;
			}

		} else if (!opts.optional) {
			throw new ReferenceError(`Script dependency with id "${name}" is not defined`);
		}

		return '';
	}

	const attrs = normalizeAttrs({
		staticAttrs: `href="' + PATH['${rname}'] + '"`,
		rel: 'stylesheet',
		defer: opts.defer !== false,
		...nonce
	});

	let
		decl = `document.write('<link ${attrs}>');`;

	if (opts.optional) {
		decl = `if ('${rname}' in PATH) {
	${decl}
}`;
	}

	return opts.wrap ? getStyleDecl(decl) : decl;
}

exports.loadPageDependencies = loadPageDependencies;

/**
 * Initializes and loads the specified dependencies of a page.
 *
 * The function returns JS code to load the dependencies by using document.write.
 * You need to put this declaration within a script tag or use the "wrap" option.
 *
 * @param {Array<string>} dependencies - list of dependencies to load
 * @param {string=} [type] - type of dependencies (styles or scripts)
 * @param {boolean=} [wrap] - if true, declaration of the dependency is wrapped by a script tag
 * @returns {string}
 */
function loadPageDependencies(dependencies, {type, wrap} = {}) {
	if (!dependencies) {
		return '';
	}

	let
		styles = '',
		scripts = '';

	if (!type || type === 'styles') {
		for (const dep of dependencies) {
			styles += getStyleDeclByName(dep);
			styles += '\n';
		}

		if (wrap) {
			if (needInline()) {
				styles = getStyleDecl(styles);

			} else {
				styles = getScriptDecl(styles);
			}
		}
	}

	if (!type || type === 'scripts') {
		for (const dep of dependencies) {
			const
				tpl = `${dep}_tpl`;

			if (dep === 'index') {
				scripts += getScriptDeclByName(dep);
				scripts += '\n';
				scripts += getScriptDeclByName(tpl);
				scripts += '\n';

			} else {
				scripts += getScriptDeclByName(tpl);
				scripts += '\n';
				scripts += getScriptDeclByName(dep);
				scripts += '\n';
			}

			scripts += `window[${globals.MODULE_DEPENDENCIES}].fileCache['${dep}'] = true;`;
		}

		if (wrap) {
			scripts = getScriptDecl(scripts);
		}
	}

	return styles + scripts;
}

exports.generatePageInitJS = generatePageInitJS;

/**
 * Generates js script to initialize the specified page
 *
 * @param pageName
 *
 * @param deps - map of external libraries to load
 * @param ownDeps - own dependencies of the page
 *
 * @param assets - map with static page assets
 * @param assetsRequest - should or not do a request for assets.js
 *
 * @param rootTag - type of the root tag (div, span, etc.)
 * @param rootAttrs - attributes for the root tag
 *
 * @returns {!Promise<void>}
 */
async function generatePageInitJS(pageName, {
	deps,
	ownDeps,

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
			attrs = normalizeAttrs(rootAttrs);

		body.push(
			`document.write('<${rootTag} class=".i-static-page.${pageName}" ${attrs}></${rootTag}>')`
		);
	}

	// - block styles
	body.push(
		await loadStyles(deps.styles, {assets, documentWrite: true}),
		loadPageDependencies(ownDeps, {type: 'styles'})
	);

	// - block assets
	body.push(getAssetsDecl({inline: !assetsRequest, documentWrite: true}));

	// - block scripts
	body.push(
		await getScriptDeclByName('std', {optional: true}),

		await loadLibs(deps.scripts, {assets, documentWrite: true}),
		getInitLibDecl(),

		getScriptDeclByName('vendor', {optional: true}),
		loadPageDependencies(ownDeps, {type: 'scripts'}),
		getScriptDeclByName('webpack.runtime', {optional: true})
	);

	const bodyInitializer = `
function $__RENDER_ROOT() {
	${body.join('\n')}
}
`;

	fs.writeFileSync(
		src.clientOutput(`${pageName}.init.js`),
		head.join('\n') + bodyInitializer
	);
}
