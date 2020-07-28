/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

require('../interface');

const
	path = require('upath'),
	fs = require('fs-extra-promise');

const
	{src, csp} = require('config'),
	{needInline} = include('src/super/i-static-page/modules/ss-helpers/helpers'),
	{getScriptDecl, getStyleDecl, normalizeAttrs} = include('src/super/i-static-page/modules/ss-helpers/tags');

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

exports.loadEntryPointDependencies = loadEntryPointDependencies;

/**
 * Initializes and loads the specified dependencies of an entry point.
 *
 * The function returns JS code to load the dependencies by using document.write.
 * You need to put this declaration within a script tag or use the "wrap" option.
 *
 * @param {Array<string>} dependencies - list of dependencies to load
 * @param {string=} [type] - type of dependencies (styles or scripts)
 * @param {boolean=} [wrap] - if true, declaration of the dependency is wrapped by a script tag
 * @returns {string}
 */
function loadEntryPointDependencies(dependencies, {type, wrap} = {}) {
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
