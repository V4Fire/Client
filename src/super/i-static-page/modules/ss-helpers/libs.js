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
	fs = require('fs-extra-promise'),
	delay = require('delay');

const
	{webpack, src} = require('config'),
	{isURL, isFolder, files, folders} = include('src/super/i-static-page/modules/const'),
	{getScriptDecl, getStyleDecl, getLinkDecl} = include('src/super/i-static-page/modules/ss-helpers/tags'),
	{needInline} = include('src/super/i-static-page/modules/ss-helpers/helpers');

const
	build = include('build/build.webpack'),
	genHash = include('build/hash');

exports.initLibs = initLibs;

/**
 * Initializes the specified libraries.
 * The function returns a list of initialized libraries to load.
 *
 * @param {(Libs|StyleLibs)} libs
 * @param {Object<string>=} [assets] - map with assets
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
 * @param {Object<string>=} [assets] - map with assets
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
 * @param {Object<string>=} [assets] - map with assets
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
 * @param {Object<string>=} [assets] - map with assets
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

	const
		libDest = src.clientOutput(webpack.output({name: 'lib'}));

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
