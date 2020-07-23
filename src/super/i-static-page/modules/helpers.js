/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

require('./interface');

const
	path = require('upath'),
	fs = require('fs-extra-promise'),
	delay = require('delay');

const
	{webpack, src} = require('config'),
	{files, folders} = include('src/super/i-static-page/modules/const');

const
	build = include('build/build.webpack'),
	genHash = include('build/hash');

const
	isFolder = /[\\/]+$/,
	isURL = /^(\w+:)?\/\//;

const
	libDest = path.join(src.clientOutput(), webpack.output({name: 'lib'}));

exports.getScriptDecl = getScriptDecl;

/**
 * Returns declaration of a script tag to load the specified library.
 * If the "inline" parameter is set to true, the function will return a promise.
 *
 * @param {(InitializedLib|body)} lib - library or raw code
 * @param {string=} [body] - library body
 * @returns {(Promise<string>|string)}
 */
function getScriptDecl(lib, body) {
	if (lib.load === false || isFolder.test(lib.src)) {
		return '';
	}

	if (Object.isString(lib)) {
		return `<script>${body}</script>`;
	}

	const normalizedAttrs = normalizeAttrs({
		...Object.reject(lib, ['source', 'inline'].concat(lib.inline || body ? 'src' : [])),
		...lib.attrs
	});

	const
		attrs = normalizedAttrs.join(' ');

	if (lib.inline && !body) {
		return (async () => {
			while (!fs.existsSync(lib.src)) {
				await delay(500);
			}

			return `<script ${attrs}>requireMonic({${lib.src}})</script>`;
		})();
	}

	return `<script ${attrs}>${body || ''}</script>`;
}

exports.getStyleDecl = getStyleDecl;

/**
 * Returns declaration of a link/style tag to load the specified style library.
 * If the "inline" parameter is set to true, the function will return a promise.
 *
 * @param {(InitializedStyleLib|body)} lib - library or raw code
 * @param {string=} [body] - library body
 * @returns {(Promise<string>|string)}
 */
function getStyleDecl(lib, body) {
	if (Object.isString(lib)) {
		return `<style>${body}</style>`;
	}

	const
		rel = lib.attrs?.rel ?? 'stylesheet';

	const normalizedAttrs = normalizeAttrs({
		...Object.reject(lib, ['src', 'source', 'inline', 'defer']),
		...lib.attrs,
		...lib.inline || body ? null : {href: lib.src, rel},
		...lib.defer ? {rel: 'preload', onload: `this.rel='${rel}'`} : null
	});

	const
		attrs = normalizedAttrs.join(' ');

	if (lib.inline && !body) {
		return (async () => {
			while (!fs.existsSync(lib.src)) {
				await delay(500);
			}

			return `<style ${attrs}>requireMonic({${lib.src}})</style>`;
		})();
	}

	if (body) {
		return `<style ${attrs}>${body}</style>`;
	}

	return `<link ${attrs}>`;
}

exports.getLinkDecl = getLinkDecl;

/**
 * Returns declaration of a link tag to load the specified link
 *
 * @param {InitializedLink} link
 * @returns {string}
 */
function getLinkDecl(link) {
	const normalizedAttrs = normalizeAttrs({
		href: src,
		...Object.reject(link, ['src', 'source']),
		...link.attrs
	});

	return `<link ${normalizedAttrs.join(' ')}>`;
}

exports.normalizeAttrs = normalizeAttrs;

/**
 * Takes an object with tag attributes and transforms it to a list with normalized attribute declarations
 *
 * @param {Object} attrs
 * @returns {!Array<string>}
 *
 * @example
 * ```js
 * // ['defer', 'type="text/javascript"']
 * normalizeAttrs({defer: true, type: 'text/javascript'});
 * ```
 */
function normalizeAttrs(attrs) {
	const
		normalizedAttrs = [];

	if (!attrs) {
		return normalizedAttrs;
	}

	Object.keys(attrs).forEach((key) => {
		const
			val = attrs[key];

		if (val === undefined) {
			return;
		}

		if (Object.isString(val)) {
			normalizedAttrs.push(`${key}="${val}"`);

		} else if (val) {
			normalizedAttrs.push(key);
		}
	});

	return normalizedAttrs;
}

exports.initLibs = initLibs;

/**
 * Initializes the specified libraries.
 * The function returns a list of initialized libraries to load.
 *
 * @param {(Libs|StyleLibs)} libs
 * @param {Object=} [assets] - map with assets
 * @returns {!Promise<!Array<(InitializedLib|InitializedStyleLib|InitializedLink)>>}
 */
async function initLibs(libs, assets) {
	const
		res = [];

	for (const [key, val] of libs.entries()) {
		const p = Object.isString(val) ? {src: val} : {...val};
		p.inline = webpack.fatHTML() || p.inline;

		let
			cwd;

		if (!p.source || p.source === 'lib') {
			cwd = src.lib();

		} else if (p.source === 'src') {
			cwd = src.src();

		} else {
			cwd = src.clientOutput();
		}

		if (p.source === 'output') {
			if (assets) {
				while (!assets[p.src]) {
					while (!fs.existsSync(build.assetsJSON)) {
						await delay(500);
					}

					await delay(500);
					Object.assign(assets, fs.readJSONSync(path.join(build.assetsJSON)));
				}

				p.src = assets[p.src];
			}

			p.src = path.join(cwd, Object.isObject(p.src) ? p.src.path : p.src);

			if (!p.inline) {
				p.src = path.relative(src.clientOutput(), p.src);
			}

		} else {
			p.src = requireAsLib({name: key, relative: !p.inline}, cwd, p.src);
		}

		if (p.inline) {
			while (!fs.existsSync(src)) {
				await delay(500);
			}

		} else {
			p.src = webpack.publicPath(p.src);
		}

		res.push(p);
	}

	return res;
}

exports.loadLibs = loadLibs;

/**
 * Initializes and loads the specified libraries.
 * The function returns declaration to load libraries.
 *
 * @param {Libs} libs
 * @param {Object=} [assets] - map with assets
 * @returns {!Promise<string>}
 */
async function loadLibs(libs, assets) {
	let
		res = '';

	for (const lib of await initLibs(libs, assets)) {
		lib.defer = lib.defer !== false;
		res += await getScriptDecl(lib);
	}

	return res;
}

exports.loadStyles = loadStyles;

/**
 * Initializes and loads the specified style libraries.
 * The function returns declaration to load libraries.
 *
 * @param {StyleLibs} libs
 * @param {Object=} [assets] - map with assets
 * @returns {!Promise<string>}
 */
async function loadStyles(libs, assets) {
	let
		res = '';

	for (const lib of await initLibs(libs, assets)) {
		lib.defer = lib.defer !== false;
		res += await getStyleDecl(lib);
	}

	return res;
}

exports.loadLinks = loadLinks;

/**
 * Initializes and loads the specified links.
 * The function returns declaration to load links.
 *
 * @param {Links} libs
 * @param {Object=} [assets] - map with assets
 * @returns {!Promise<string>}
 */
async function loadLinks(libs, assets) {
	let
		res = '';

	for (const lib of await initLibs(libs, assets)) {
		res += await getLinkDecl(lib);
	}

	return res;
}

exports.requireAsLib = requireAsLib;

/**
 * Loads the specified file or directory as an external library to the output folder.
 * The function returns a path to the library from the output folder.
 *
 * @param {string=} [name] - name of the library
 *   (if not specified, the name will be taken from a basename of the source file)
 *
 * @param {boolean=} [relative=true] - if false, the function will return an absolute path
 * @param {...string} paths - string paths to join (also, can take URLs)
 * @returns {string}
 *
 * @example
 * ```js
 * loadAsLib({name: 'jquery'}, 'node_modules', 'jquery/dist/jquery.min.js');
 * loadAsLib({name: 'images'}, 'assets', 'images/');
 * ```
 */
function requireAsLib({name, relative = true} = {}, ...paths) {
	const
		url = paths.find((el) => isURL.test(el));

	if (url != null) {
		return url;
	}

	const
		resSrc = path.join(...paths),
		srcIsFolder = isFolder.test(resSrc);

	name = name ?
		name + path.extname(resSrc) :
		path.basename(resSrc);

	const
		needHash = Boolean(webpack.hashFunction()),
		cache = srcIsFolder ? folders : files;

	if (cache[name]) {
		return cache[name];
	}

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
