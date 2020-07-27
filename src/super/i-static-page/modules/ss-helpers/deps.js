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

exports.getScriptDepDecl = getScriptDepDecl;

/**
 * Returns declaration of a script to initialize the specified dependency.
 * The declaration based on the "document.write" mechanism,
 * i.e., to load dependency you need to put this declaration within a script tag or use the "wrap" option.
 *
 * @param {string} name - dependence name
 * @param {DepOptions=} [opts] - additional options
 * @param {Object<string>=} [assets] - map with assets
 * @returns {string}
 */
function getScriptDepDecl(name, opts, assets) {
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
		src: `' + PATH['${name}'] + '`,
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
		decl = `if ('${name}' in PATH) { ${decl} }`;
	}

	return opts.wrap ? getScriptDecl(decl) : decl;
}

exports.getStyleDepDecl = getStyleDepDecl;

/**
 * Returns declaration of a style to initialize the specified dependency.
 * The declaration based on the "document.write" mechanism,
 * i.e., to load dependency you need to put this declaration within a script tag or use the "wrap" option.
 *
 * @param {string} name - dependence name
 * @param {DepOptions=} [opts] - additional options
 * @param {Object<string>=} [assets] - map with assets
 * @returns {string}
 */
function getStyleDepDecl(name, opts, assets) {
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
		rel: 'stylesheet',
		href: `' + PATH['${rname}'] + '`,
		defer: opts.defer !== false,
		...nonce
	});

	let
		decl = `document.write('<link ${attrs}>')`;

	if (opts.optional) {
		decl = `if ('${rname}' in PATH) { ${decl} }`;
	}

	return opts.wrap ? getStyleDecl(decl) : decl;
}

exports.loadDependencies = loadDependencies;

/**
 * Initializes and loads runtime dependencies of the project
 *
 * @param {Array<string>} dependencies - list of dependencies to load
 * @param {string=} [type] - type of dependencies (styles, scripts)
 * @returns {string}
 */
function loadDependencies(dependencies, type) {
	if (!dependencies) {
		return '';
	}

	let
		styles = '',
		scripts = '';

	if (!type || type === 'styles') {
		for (const dep of dependencies) {
			styles += getStyleDepDecl(dep);
		}

		if (needInline()) {
			styles = getStyleDecl(styles);

		} else {
			styles = getScriptDecl(styles);
		}
	}

	if (!type || type === 'scripts') {
		for (const dep of dependencies) {
			const
				tpl = `${dep}_tpl`;

			if (dep === 'index') {
				scripts += getScriptDepDecl(dep);
				scripts += getScriptDepDecl(tpl);

			} else {
				scripts += getScriptDepDecl(tpl);
				scripts += getScriptDepDecl(dep);
			}

			scripts += `window[${globals.MODULE_DEPENDENCIES}].fileCache['${dep}'] = true;\n`;
		}

		scripts = getScriptDecl(scripts);
	}

	return styles + scripts;
}
