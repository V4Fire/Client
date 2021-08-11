/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	config = require('config'),
	{webpack, src} = config;

const
	fs = require('fs-extra');

const
	buble = require('buble'),
	monic = require('monic');

const
	{getAssetsDecl} = include('src/super/i-static-page/modules/ss-helpers/assets'),
	{getScriptDecl, getStyleDecl, normalizeAttrs} = include('src/super/i-static-page/modules/ss-helpers/tags'),
	{loadLibs, loadStyles, loadLinks} = include('src/super/i-static-page/modules/ss-helpers/libs');

const
	{getVarsDecl} = include('src/super/i-static-page/modules/ss-helpers/base-declarations'),
	{needInline, addPublicPath} = include('src/super/i-static-page/modules/ss-helpers/helpers');

const defAttrs = {
	crossorigin: webpack.publicPath() === '' ? undefined : 'anonymous'
};

exports.getPageScriptDepsDecl = getPageScriptDepsDecl;

/**
 * Returns code to load script dependencies of a page.
 *
 * The function returns JS code to load the library by using JS.
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
		decl = '';

	for (const dep of dependencies) {
		const
			tpl = `${dep}_tpl`;

		if (dep === 'index') {
			decl += getScriptDeclByName(dep, {assets});
			decl += '\n';
			decl += getScriptDeclByName(tpl, {assets});
			decl += '\n';

		} else {
			decl += getScriptDeclByName(tpl, {assets});
			decl += '\n';
			decl += getScriptDeclByName(dep, {assets});
			decl += '\n';
		}
	}

	if (wrap) {
		decl = getScriptDecl(decl);
	}

	return decl;
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
 * @param {boolean=} [js] - if true, the function will always return JS code to load the dependency
 * @returns {string}
 */
function getPageStyleDepsDecl(dependencies, {assets, wrap, js}) {
	if (!dependencies) {
		return '';
	}

	let
		decl = '';

	for (const dep of dependencies) {
		decl += getStyleDeclByName(dep, {assets, js});
		decl += '\n';
	}

	if (wrap && (js || !needInline())) {
		decl = getScriptDecl(decl);
	}

	return decl;
}

exports.getScriptDeclByName = getScriptDeclByName;

/**
 * Returns code to load a script by the specified name.
 * The names are equal with entry points from "src/entries".
 *
 * The function returns JS code to load the library by using JS.
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
	let
		decl;

	if (needInline(inline)) {
		if (assets[name]) {
			const
				filePath = src.clientOutput(assets[name].path);

			if (fs.existsSync(filePath)) {
				decl = `include('${filePath}');`;
			}

		} else {
			if (!optional) {
				throw new ReferenceError(`A script by the name "${name}" is not defined`);
			}

			return '';
		}

	} else {
		decl = getScriptDecl({
			...defAttrs,
			defer,
			js: true,
			src: addPublicPath([`PATH['${name}']`])
		});

		if (optional) {
			decl = `if ('${name}' in PATH) {
	${decl}
}`;
		}
	}

	return wrap ? getScriptDecl(decl) : decl;
}

exports.getStyleDeclByName = getStyleDeclByName;

/**
 * Returns code to load a style by the specified name.
 * The names are equal with entry points from "src/entries".
 *
 * The function can return JS code to load the style by using JS or pure CSS to inline.
 * You may use the "wrap" option to wrap the final code with a tag to load.
 *
 * @param {string} name
 * @param {!Object<string>} assets - map with static page assets
 * @param {boolean=} [optional] - if true, the missing of this style won't throw an error
 * @param {boolean=} [defer=true] - if true, the style is loaded only after loading of the whole page
 * @param {boolean=} [inline] - if true, the style is placed as a text
 * @param {boolean=} [wrap] - if true, the final code is wrapped by a tag to load
 * @param {boolean=} [js] - if true, the function will always return JS code to load the dependency
 * @returns {string}
 */
function getStyleDeclByName(name, {
	assets,
	optional,
	defer = true,
	inline,
	wrap,
	js
}) {
	const
		rname = `${name}_style`;

	let
		decl;

	if (needInline(inline)) {
		if (assets[rname]) {
			const
				filePath = src.clientOutput(assets[rname].path);

			if (fs.existsSync(filePath)) {
				decl = getStyleDecl({...defAttrs, js}, `include('${filePath}');`);
			}

		} else if (!optional) {
			throw new ReferenceError(`A style by the name "${name}" is not defined`);
		}

	} else {
		decl = getStyleDecl({
			...defAttrs,
			defer,
			js: true,
			rel: 'stylesheet',
			src: addPublicPath([`PATH['${rname}']`])
		});

		if (optional) {
			decl = `if ('${rname}' in PATH) {
	${decl}
}`;
		}
	}

	if (!decl) {
		return '';
	}

	return wrap ? getScriptDecl(decl) : decl;
}

exports.generateInitJS = generateInitJS;

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
async function generateInitJS(pageName, {
	deps,
	ownDeps,

	assets,
	assetsRequest,

	rootTag,
	rootAttrs
}) {
	if (needInline()) {
		return;
	}

	const
		head = [],
		body = [];

	console.log(1);

	// - block varsDecl
	head.push(getVarsDecl());

	console.log(2);

	// - block assets
	head.push(getAssetsDecl({inline: !assetsRequest, js: true}));

	console.log(3);

	// - block links
	head.push(await loadLinks(deps.links, {assets, js: true}));

	console.log(4);

	// - block headStyles
	head.push(await getStyleDeclByName('std', {assets, optional: true, js: true}));

	console.log(5);

	// - block headScripts
	head.push(await loadLibs(deps.headScripts, {assets, js: true}));

	console.log(6);

	body.push(`
(function () {
	var el = document.createElement('${rootTag || 'div'}');
	${normalizeAttrs(rootAttrs, true)}
	el.setAttribute('class', 'i-static-page ${pageName}');
	document.body.appendChild(el);
})();
`);

	// - block styles
	body.push(
		await loadStyles(deps.styles, {assets, js: true}),
		getPageStyleDepsDecl(ownDeps, {assets, js: true})
	);

	console.log(7);

	// - block scripts
	body.push(
		await getScriptDeclByName('std', {assets, optional: true}),
		await loadLibs(deps.scripts, {assets, js: true}),

		getScriptDeclByName('index-core', {assets, optional: true}),
		getScriptDeclByName('vendor', {assets, optional: true}),

		getPageScriptDepsDecl(ownDeps, {assets})
	);

	console.log(8);

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

	console.log(9);

	if (/ES[35]$/.test(config.es())) {
		result = buble.transform(result).code;
	}

	fs.writeFileSync(initPath, result);
}
