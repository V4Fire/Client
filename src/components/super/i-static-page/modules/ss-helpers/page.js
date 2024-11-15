/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	config = require('@config/config'),
	{src, webpack} = config;

const
	fs = require('fs-extra');

const
	{getScriptDecl, getStyleDecl} = include('src/components/super/i-static-page/modules/ss-helpers/tags'),
	{needInline, addPublicPath, canLoadStylesDeferred} = include('src/components/super/i-static-page/modules/ss-helpers/helpers');

const
	needLoadStylesAsJS = Boolean(webpack.dynamicPublicPath());

const defAttrs = {
	crossorigin: webpack.publicPath() === '' ? undefined : 'anonymous'
};

exports.getPageScriptDepsDecl = getPageScriptDepsDecl;

/**
 * Returns code to load script dependencies of a page.
 *
 * The function returns JS code to load the library using JS.
 * You need to put this declaration within a script tag or use the `wrap` option.
 *
 * @param {Array<string>} dependencies - the list of dependencies to load
 * @param {object} [opts] - additional options
 * @param {Object<string>} opts.assets - a dictionary with static page assets
 * @param {boolean} [opts.wrap] - if set to true, the final code will be wrapped by a `<script>` tag
 * @returns {string}
 */
function getPageScriptDepsDecl(dependencies, {assets, wrap, js} = {}) {
	if (!dependencies) {
		return '';
	}

	let
		decl = '';

	for (const dep of dependencies) {
		const scripts = [
			getScriptDeclByName(`${dep}_tpl`, {assets, js}),
			getScriptDeclByName(dep, {assets, js})
		];

		// We can't compile styles into static CSS files because
		// we have to provide a dynamic public path to them via runtime
		if (needLoadStylesAsJS) {
			scripts.unshift(getScriptDeclByName(`${dep}_style`, {assets, js}));
		}

		if (dep === 'index') {
			scripts.reverse();
		}

		decl += `${scripts.join('\n')}\n`;
	}

	if (wrap) {
		decl = getScriptDecl(decl);
	}

	return decl;
}

exports.getPageAsyncScripts = getPageAsyncScripts;

function getPageAsyncScripts() {
	if (!needInline()) {
		return '';
	}

	const
		fileName = webpack.asyncAssetsJSON(),
		filePath = src.clientOutput(fileName);

	try {
		const
			fileContent = fs.readFileSync(filePath, 'utf-8'),
			asyncChunks = JSON.parse(fileContent);

		if (webpack.mode() === 'production') {
			return asyncChunks.reduce((result, chunk) => `${result}<script type="template" id="${chunk.id}"><script>${
				chunk.files.map((fileName) => `include('${src.clientOutput(fileName)}');\n`).join()
			}</script></script>`, '');
		}

		return `<div id="scripts-shadow-store">${asyncChunks.reduce((result, chunk) => `${result}<script type="template" id="${chunk.id}"><script id="${chunk.id}">${
				chunk.files.map((fileName) => `include('${src.clientOutput(fileName)}');\n`).join()
			}</script></script>`, '')}</div>`;

	} catch (e) {
		return '';
	}
}

exports.getPageStyleDepsDecl = getPageStyleDepsDecl;

/**
 * Returns code to load style dependencies of a page.
 *
 * The function can return JS code to load the style using `document.write` or pure CSS for inline.
 * You may use the wrap option to wrap the final code with a tag for loading.
 *
 * @param {Array<string>} dependencies - the list of dependencies to load
 * @param {object} opts - additional options
 * @param {Object<string>} opts.assets - a dictionary with static page assets
 * @param {boolean} [opts.wrap] - if set to true, the final code is wrapped by a tag to load
 * @param {boolean} [opts.js] - if set to true, the function will always return JS code to load the dependency
 * @param {boolean} [opts.inline] - if set to true, the styles will be placed as text
 * @returns {string}
 */
function getPageStyleDepsDecl(dependencies, {assets, wrap, js, inline}) {
	if (!dependencies || needLoadStylesAsJS) {
		return '';
	}

	let
		decl = '';

	for (const dep of dependencies) {
		decl += getStyleDeclByName(dep, {assets, js, inline});
		decl += '\n';
	}

	if (wrap && (js || !needInline())) {
		decl = getScriptDecl(decl);
	}

	return decl;
}

exports.getScriptDeclByName = getScriptDeclByName;

/**
 * Returns code to load a script with the specified name.
 * The names correspond to entry points from "src/entries".
 *
 * The function returns JS code to load the library using JS.
 * You need to put this declaration within a script tag or use the `wrap` option.
 *
 * @param {string} name
 * @param {object} opts - additional options
 * @param {Object<string>} opts.assets - a dictionary with static page assets
 * @param {boolean} [opts.optional] - if set to true, the missing of this script won't throw an error
 * @param {boolean} [opts.defer] - if set to true, the script is loaded with the "defer" attribute
 * @param {boolean} [opts.inline] - if set to true, the script is placed as a text
 * @param {boolean} [opts.wrap] - if set to true, the final code will be wrapped by a `<script>` tag
 * @param {boolean} [opts.js] - if set to true, the function will always return JS code to load the dependency
 * @returns {string}
 *
 * @throws {Error} if the dependency with the specified name does not exist
 */
function getScriptDeclByName(name, {
	assets,
	optional,
	defer = true,
	inline,
	wrap,
	js = false
}) {
	const
		inlineDecl = needInline(inline);

	if (!assets[name] && (inlineDecl || !js)) {
		if (optional) {
			return '';
		}

		throw new ReferenceError(`A script with the name "${name}" is not defined`);
	}

	let
		decl;

	if (inlineDecl) {
		const
			filePath = src.clientOutput(assets[name].path);

		if (fs.existsSync(filePath)) {
			decl = `include('${filePath}');`;
		}

	} else {
		decl = getScriptDecl({
			...defAttrs,
			defer,
			js,
			src: js ? addPublicPath([`PATH['${name}']`]) : assets[name].publicPath
		});

		if (optional && js) {
			decl = `if ('${name}' in PATH) {
	${decl}
}`;
		}
	}

	return wrap ? getScriptDecl(decl) : decl;
}

exports.getStyleDeclByName = getStyleDeclByName;

/**
 * Returns code to load a style with the specified name.
 * The names correspond to entry points from "src/entries".
 *
 * The function can return JS code to load the style using JS or pure CSS for inline.
 * You may use the `wrap` option to wrap the final code with a tag for loading.
 *
 * @param {string} name
 * @param {object} opts - additional options
 * @param {Object<string>} opts.assets - a dictionary with static page assets
 * @param {boolean} [opts.optional] - if set to true, the missing of this style won't throw an error
 * @param {boolean} [opts.defer] - if set to true, the style is loaded only after loading of the whole page
 * @param {boolean} [opts.inline] - if set to true, the style is placed as a text
 * @param {boolean} [opts.wrap] - if set to true, the final code is wrapped by a tag to load
 * @param {boolean} [opts.js] - if set to true, the function will always return JS code to load the dependency
 * @returns {string}
 *
 * @throws {Error} if the dependency with the specified name does not exist
 */
function getStyleDeclByName(name, {
	assets,
	optional,
	defer = canLoadStylesDeferred,
	inline,
	wrap,
	js
}) {
	const
		rname = `${name}_style`;

	if (needLoadStylesAsJS) {
		return getScriptDeclByName(rname, {assets, optional, defer, inline, wrap});
	}

	const
		inlineDecl = needInline(inline);

	if (!assets[rname] && (inlineDecl || !js)) {
		if (optional) {
			return '';
		}

		throw new ReferenceError(`A style with the name "${name}" is not defined`);
	}

	let
		decl;

	if (inlineDecl) {
		const
			filePath = src.clientOutput(assets[rname].path);

		if (fs.existsSync(filePath)) {
			decl = getStyleDecl({...defAttrs, js, inline: inlineDecl}, `include('${filePath}');`);
		}

	} else {
		decl = getStyleDecl({
			...defAttrs,
			defer,
			js,
			rel: 'stylesheet',
			src: js ? addPublicPath([`PATH['${rname}']`]) : assets[rname].publicPath
		});

		if (optional && js) {
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
