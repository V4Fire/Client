/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

require('../interface');

const
	{resolve} = require('@pzlr/build-core'),
	{webpack, src, csp} = require('@config/config');

const
	fs = require('fs-extra'),
	path = require('upath'),
	delay = require('delay');

const
	genHash = include('build/hash');

const
	{isURL, files, folders} = include('src/super/i-static-page/modules/const'),
	{getScriptDecl, getStyleDecl, getLinkDecl} = include('src/super/i-static-page/modules/ss-helpers/tags'),
	{needInline, addPublicPath} = include('src/super/i-static-page/modules/ss-helpers/helpers');

exports.loadLibs = loadLibs;

/**
 * Initializes the specified libraries and returns code to load
 *
 * @param {Libs} libs
 * @param {Object<string>=} [assets] - map with static page assets
 * @param {boolean=} [js] - if true, the function returns JS code to load the libraries
 * @param {boolean=} [wrap] - if true, the final code is wrapped by a script tag
 * @returns {!Promise<string>}
 */
async function loadLibs(libs, {assets, js, wrap} = {}) {
	let
		decl = '';

	if (csp.nonce() && !csp.postProcessor) {
		js = true;
	}

	for (const lib of await initLibs(libs, assets)) {
		lib.defer = lib.defer !== false;
		lib.js = js;

		decl += await getScriptDecl(lib);
	}

	if (js && wrap && decl) {
		return getScriptDecl(decl);
	}

	return decl;
}

exports.loadStyles = loadStyles;

/**
 * Initializes the specified styles and returns code to load
 *
 * @param {StyleLibs} libs
 * @param {Object<string>=} [assets] - map with static page assets
 * @param {boolean=} [js] - if true, the function returns JS code to load the libraries
 * @param {boolean=} [wrap] - if true, the final code is wrapped by a script tag
 * @returns {!Promise<string>}
 */
async function loadStyles(libs, {assets, js, wrap} = {}) {
	let
		decl = '';

	if (csp.nonce() && !csp.postProcessor) {
		js = true;
	}

	for (const lib of await initLibs(libs, assets)) {
		lib.defer = lib.defer !== false;
		lib.js = js;

		decl += await getStyleDecl(lib);
		decl += '\n';
	}

	if (js && wrap && decl) {
		return getScriptDecl(decl);
	}

	return decl;
}

exports.loadLinks = loadLinks;

/**
 * Initializes the specified links  and returns code to load
 *
 * @param {Links} libs
 * @param {Object<string>=} [assets] - map with static page assets
 * @param {boolean=} [js] - if true, the function returns JS code to load the links
 * @param {boolean=} [wrap] - if true, the final code is wrapped by a script tag
 * @returns {!Promise<string>}
 */
async function loadLinks(libs, {assets, js, wrap} = {}) {
	let
		decl = '';

	if (csp.nonce() && !csp.postProcessor) {
		js = true;
	}

	for (const lib of await initLibs(libs, assets)) {
		lib.js = js;

		decl += await getLinkDecl(lib);
		decl += '\n';
	}

	if (js && wrap && decl) {
		return getScriptDecl(decl);
	}

	return decl;
}

exports.initLibs = initLibs;

/**
 * Initializes the specified libraries.
 * The function returns a list of initialized libraries to load.
 *
 * @param {(Libs|StyleLibs)} libs
 * @param {Object<string>=} [assets] - map with static page assets
 * @returns {!Promise<!Array<(InitializedLib|InitializedStyleLib|InitializedLink)>>}
 */
async function initLibs(libs, assets) {
	const
		res = [];

	for (const [key, val] of libs.entries()) {
		const p = Object.isString(val) ? {src: val} : {...val};
		p.inline = needInline(p.inline);

		let
			cwd;

		if (!p.source || p.source === 'lib') {
			cwd = src.lib();

		} else if (p.source === 'src') {
			cwd = resolve.sourceDirs;

		} else {
			cwd = src.clientOutput();
		}

		if (p.source === 'output') {
			if (assets?.[p.src]) {
				p.src = assets[p.src].path;
			}

			p.src = path.join(cwd, p.src);

			if (!p.inline) {
				p.src = path.relative(src.clientOutput(), p.src);
			}

		} else {
			p.src = resolveAsLib({name: key, relative: !p.inline}, cwd, p.src);
		}

		if (p.inline) {
			while (!fs.existsSync(p.src)) {
				await delay((1).second());
			}

		} else if (p.source !== 'external') {
			p.src = addPublicPath(p.src);
		}

		res.push(p);
	}

	return res;
}

exports.resolveAsLib = resolveAsLib;

/**
 * Loads the specified file or directory as an external library to the output folder.
 * The function returns a path to the library from the output folder.
 *
 * @param {string=} [name] - name of the library
 *   (if not specified, the name will be taken from a basename of the source file)
 *
 * @param {boolean=} [dest='lib'] - where to store the library
 * @param {boolean=} [relative=true] - if false, the function will return an absolute path
 * @param {(Array<string>|string)=} cwd - active working directory (can be defined as an array to enable layers)
 * @param {...string} paths - string paths to join (also, can take URL-s)
 * @returns {string}
 *
 * @example
 * ```js
 * resolveAsLib({name: 'jquery'}, 'node_modules', 'jquery/dist/jquery.min.js');
 * resolveAsLib({name: 'images'}, 'assets', 'images/');
 * ```
 */
function resolveAsLib(
	{name, dest = 'lib', relative = true} = {},
	cwd = null,
	...paths
) {
	const
		url = paths.find((el) => isURL.test(el));

	if (url != null) {
		return url;
	}

	let
		resSrc;

	if (Object.isArray(cwd)) {
		for (let i = 0; i < cwd.length; i++) {
			resSrc = path.join(...[].concat(cwd[i] || [], paths));

			if (fs.existsSync(resSrc)) {
				break;
			}
		}

	} else {
		resSrc = path.join(...[].concat(cwd || [], paths));
	}

	const
		srcIsFolder = fs.lstatSync(resSrc).isDirectory();

	name = name ?
		name + path.extname(resSrc) :
		path.basename(resSrc);

	const
		needHash = Boolean(webpack.hashFunction()),
		cache = srcIsFolder ? folders : files;

	if (cache[name]) {
		return cache[name];
	}

	const
		libDest = src.clientOutput(webpack.output({name: dest}));

	let
		fileContent,
		newSrc;

	if (srcIsFolder) {
		const hash = needHash ? `${genHash(path.join(resSrc, '/**/*'))}_` : '';
		newSrc = path.join(libDest, hash + name);

	} else {
		fileContent = fs.readFileSync(resSrc);
		const hash = needHash ? `${genHash(fileContent)}_` : '';
		newSrc = path.join(libDest, hash + name);
	}

	const
		distPath = relative ? path.relative(src.clientOutput(), newSrc) : newSrc;

	if (!fs.existsSync(newSrc)) {
		if (srcIsFolder) {
			fs.mkdirpSync(newSrc);
			fs.copySync(resSrc, newSrc);

		} else {
			const
				clrfx = /\/\/# sourceMappingURL=.*/;

			fs.mkdirpSync(libDest);
			fs.writeFileSync(newSrc, fileContent.toString().replace(clrfx, ''));
		}
	}

	cache[name] = distPath;
	return distPath;
}
