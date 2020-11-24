/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	config = require('config'),
	{webpack, src, csp} = config;

const
	fs = require('fs-extra-promise'),
	path = require('upath');

const
	buble = require('buble'),
	monic = require('monic');

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
 * Returns code to load a script by the specified name.
 * The names are equal with entry points from "src/entries".
 *
 * The function returns JS code to load the library by using document.write.
 * You need to put this declaration within a script tag or use the "wrap" option.
 *
 * @param {string} name
 * @param {!Object<string>} assets - map with static page assets
 * @param {boolean=} [optional] - if true, the missing of this script won't throw an error
 * @param {boolean=} [defer=true] - if true, the script is loaded with the "defer" attribute
 * @param {boolean=} [inline] - if true, the script is placed as a text
 * @param {boolean=} [wrap] - if true, the final code is wrapped by a script tag
 * @returns {string}
 */
function getScriptDeclByName(name, {
	assets,
	optional,
	defer = true,
	inline,
	wrap
}) {
	if (needInline(inline)) {
		if (assets[name]) {
			const
				filePath = path.join(src.clientOutput(assets[name].path));

			if (fs.existsSync(filePath)) {
				const decl = `include('${filePath}');`;
				return wrap ? getScriptDecl(decl) : decl;
			}

		} else if (!optional) {
			throw new ReferenceError(`Script by a name "${name}" is not defined`);
		}

		return '';
	}

	const attrs = normalizeAttrs({
		staticAttrs: `src="\${PATH['${name}']}"`,
		defer: defer !== false,
		...nonce
	});

	const script = [
		`\`<script ${attrs}\` +`,
		"'><' +",
		"'/script>'"
	].join(' ');

	let
		decl = `document.write(${script});`;

	if (optional) {
		decl = `if ('${name}' in PATH) {
	${decl}
}`;
	}

	if (config.es() === 'ES5') {
		decl = buble.transform(decl).code;
	}

	return wrap ? getScriptDecl(decl) : decl;
}

exports.getPageScriptDepsDecl = getPageScriptDepsDecl;

/**
 * Returns code to load script dependencies of a page.
 *
 * The function returns JS code to load the library by using document.write.
 * You need to put this declaration within a script tag or use the "wrap" option.
 *
 * @param {Array<string>} dependencies - list of dependencies to load
 * @param {!Object<string>} assets - map with static page assets
 * @param {boolean=} [wrap] - if true, the final code is wrapped by a script tag
 * @returns {string}
 */
function getPageScriptDepsDecl(dependencies, {assets, wrap} = {}) {
	if (!dependencies) {
		return '';
	}

	let
		res = '';

	for (const dep of dependencies) {
		const
			tpl = `${dep}_tpl`;

		if (dep === 'index') {
			res += getScriptDeclByName(dep, {assets});
			res += '\n';
			res += getScriptDeclByName(tpl, {assets});
			res += '\n';

		} else {
			res += getScriptDeclByName(tpl, {assets});
			res += '\n';
			res += getScriptDeclByName(dep, {assets});
			res += '\n';
		}
	}

	if (wrap) {
		res = getScriptDecl(res);
	}

	return res;
}

exports.getStyleDeclByName = getStyleDeclByName;

/**
 * Returns code to load a style by the specified name.
 * The names are equal with entry points from "src/entries".
 *
 * The function can return JS code to load the style by using document.write or pure CSS to inline.
 * You may use the "wrap" option to wrap the final code with a tag to load.
 *
 * @param {string} name
 * @param {!Object<string>} assets - map with static page assets
 * @param {boolean=} [optional] - if true, the missing of this style won't throw an error
 * @param {boolean=} [defer=true] - if true, the style is loaded only after loading of the whole page
 * @param {boolean=} [inline] - if true, the style is placed as a text
 * @param {boolean=} [wrap] - if true, the final code is wrapped by a tag to load
 * @param {boolean=} [documentWrite] - if true, the function will always return JS code to
 *   load the dependency by using document.write
 *
 * @returns {string}
 */
function getStyleDeclByName(name, {
	assets,
	optional,
	defer = true,
	inline,
	wrap,
	documentWrite
}) {
	const
		rname = `${name}$style`;

	if (needInline(inline)) {
		if (assets[rname]) {
			const
				filePath = path.join(src.clientOutput(assets[rname].path));

			if (fs.existsSync(filePath)) {
				let
					decl = `include('${filePath}');`;

				if (documentWrite) {
					decl = `document.write(\`${decl}\`);`;
				}

				return wrap ? getStyleDecl(decl) : decl;
			}

		} else if (!optional) {
			throw new ReferenceError(`Style by a name "${name}" is not defined`);
		}

		return '';
	}

	const attrs = normalizeAttrs({
		staticAttrs: `href="\${PATH['${rname}']}"`,
		rel: 'stylesheet',
		defer: defer !== false,
		...nonce
	});

	let
		decl = `document.write(\`<link ${attrs}>\`);`;

	if (optional) {
		decl = `if ('${rname}' in PATH) {
	${decl}
}`;
	}

	if (config.es() === 'ES5') {
		decl = buble.transform(decl).code;
	}

	return wrap ? getStyleDecl(decl) : decl;
}

exports.getPageStyleDepsDecl = getPageStyleDepsDecl;

/**
 * Returns code to load style dependencies of a page.
 *
 * The function can return JS code to load the style by using document.write or pure CSS to inline.
 * You may use the "wrap" option to wrap the final code with a tag to load.
 *
 * @param {Array<string>} dependencies - list of dependencies to load
 * @param {!Object<string>} assets - map with static page assets
 * @param {boolean=} [wrap] - if true, the final code is wrapped by a tag to load
 * @param {boolean=} [documentWrite] - if true, the function will always return JS code to
 *   load the dependency by using document.write
 *
 * @returns {string}
 */
function getPageStyleDepsDecl(dependencies, {assets, wrap, documentWrite}) {
	if (!dependencies) {
		return '';
	}

	let
		res = '';

	for (const dep of dependencies) {
		res += getStyleDeclByName(dep, {assets, documentWrite});
		res += '\n';
	}

	if (wrap) {
		if (needInline() && !documentWrite) {
			res = getStyleDecl(res);

		} else {
			res = getScriptDecl(res);
		}
	}

	return res;
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
			`document.write('<${rootTag} class=".i-static-page.${pageName}" ${attrs}></${rootTag}>');`
		);
	}

	// - block assets
	body.push(getAssetsDecl({inline: !assetsRequest, documentWrite: true}));

	// - block styles
	body.push(
		await loadStyles(deps.styles, {assets, documentWrite: true}),
		getPageStyleDepsDecl(ownDeps, {assets, documentWrite: true})
	);

	// - block scripts
	body.push(
		await getScriptDeclByName('std', {assets, optional: true}),

		await loadLibs(deps.scripts, {assets, documentWrite: true}),
		getInitLibDecl(),

		getScriptDeclByName('vendor', {assets, optional: true}),
		getPageScriptDepsDecl(ownDeps, {assets}),
		getScriptDeclByName('webpack.runtime', {assets})
	);

	const bodyInitializer = `
function $__RENDER_ROOT() {
	${body.join('\n')}
}
`;

	const
		initPath = src.clientOutput(`${webpack.output({name: pageName})}.init.js`),
		content = head.join('\n') + bodyInitializer;

	fs.writeFileSync(initPath, content);

	let {result} = await monic.compile(initPath, {
		content,
		saveFiles: false,
		replacers: [include('build/replacers/include')]
	});

	if (config.es() === 'ES5') {
		result = buble.transform(result).code;
	}

	fs.writeFileSync(initPath, result);
}
