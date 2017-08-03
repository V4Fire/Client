'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	$C = require('collection.js');

const
	{String, Array} = require('sugar'),
	{args} = require('./helpers.webpack'),
	{validators} = require('@pzlr/build-core');

const
	fs = require('fs'),
	path = require('path'),
	glob = require('glob'),
	mkdirp = require('mkdirp'),
	hasha = require('hasha'),
	pzlr = require('@pzlr/build-core');

const
	IN_PROCESS = 3;

/**
 * Builds entry points for WebPack by the specified parameters and returns a tree of dependencies
 *
 * @param {string} entries - path to base entry points
 * @param {string} folders - list of block folders
 * @param {string} output - output path
 * @param {string} cache - path to a cache folder
 * @param {string} assetsJSON - path to assets.json file
 * @param {string} lib - path to a node_modules folder
 * @returns {{entry, processes, dependencies}}
 */
module.exports = function ({entries, folders, output, cache, assetsJSON, lib}) {
	//////////////////
	// Load from cache
	//////////////////

	let
		cacheFile;

	if (cache) {
		mkdirp.sync(cache);
		cacheFile = path.join(cache, 'graph.json');
		if (fs.existsSync(cacheFile)) {
			return require(cacheFile);
		}
	}

	//////////////////////////
	// Parse --build arguments
	//////////////////////////

	let
		entriesFilter;

	if (typeof args.build === 'string') {
		entriesFilter = $C(args.build.split(',')).reduce((map, el) => (map[el] = true, map), {});
		entriesFilter.index = true;
	}

	////////////////////
	// Load entries list
	////////////////////

	const entriesList = $C(glob.sync(path.join(entries, '*.js'))).get((el) => {
		if (entriesFilter) {
			return entriesFilter[path.basename(el, '.js')];
		}

		return true;
	});

	///////////////////////////
	// Create temporary folders
	///////////////////////////

	const
		tmpEntries = path.join(entries, 'tmp');

	mkdirp.sync(tmpEntries);
	mkdirp.sync(path.dirname(output));

	////////////////////////////////////
	// Load index declarations of blocks
	////////////////////////////////////

	const
		b = `@(${validators.blockTypeList.join('|')})-*`,
		components = `/**/${b}/index.js`,
		virtualComponents = `/**/${b}.index.js`;

	const files = $C(folders).reduce((arr, el) => arr.concat(
		glob.sync(path.join(el, components)),
		glob.sync(path.join(el, virtualComponents))
	), []).reverse();

	const blockMap = $C(files).reduce((map, el) => {
		const
			decl = pzlr.declaration.parse(fs.readFileSync(el)).toJSON(),
			nm = decl.name,
			base = map[nm];

		const
			cwd = path.dirname(el),
			url = (ext) => path.join(cwd, `${nm}.${ext}`);

		if (base) {
			if (decl.mixin) {
				$C.extend({
					deep: true,
					concatArray: true,
					concatFn: Array.union
				}, decl, base);

			} else {
				Object.assign(decl, base);
			}
		}

		const
			logic = url('js'),
			style = url('styl'),
			tpl = url('ss'),
			html = url('ess');

		if (fs.existsSync(logic)) {
			decl.logic = logic;
		}

		if (decl.mixin) {
			if (fs.existsSync(style)) {
				decl.style = style;

			} else {
				decl.style = [].concat(base.style || [], glob.sync(path.join(cwd, `${nm}_*.styl`)));
			}

		} else if (fs.existsSync(style)) {
			decl.style = style;
		}

		if (fs.existsSync(tpl)) {
			decl.tpl = tpl;
		}

		if (fs.existsSync(html)) {
			decl.html = html;
		}

		decl.src = decl.mixin ? base.src : el;
		map[nm] = decl;

		return map;
	}, {});

	/**
	 * Returns a graph with dependencies for a block
	 */
	function getBlockDeps(name, isParent, runtime = new Set(), parents = new Set()) {
		runtime.add(name);

		if (!isParent && parents.has(name)) {
			parents.delete(name);
		}

		const
			block = blockMap[name];

		if (!block) {
			throw new Error(`Block "${name}" not exists!`);
		}

		$C(block.dependencies).forEach((block) => {
			block = path.basename(block.replace(/^@/, ''));
			runtime.add(block);
			getBlockDeps(block, false, runtime, parents);
		});

		if (block.parent) {
			const
				parent = path.basename(block.parent);

			if (!runtime.has(parent)) {
				parents.add(parent);
				runtime.add(parent);
			}

			getBlockDeps(parent, true, runtime, parents);
		}

		block.runtime = new Set(runtime);
		block.parents = new Set(parents);

		return {runtime, parents};
	}

	/**
	 * Returns true if the specified url is a node module
	 */
	function isNodeModule(url) {
		return !path.isAbsolute(url) && /^[^./\\]/.test(url);
	}

	/**
	 * Returns a list of dependencies from an entry file
	 */
	function getEntryDepList(dir, file, arr = []) {
		$C(file.split(/\r?\n|\r/)).forEach((el) => {
			if (!/^import\s+('|")(.*?)\1;?/.test(el)) {
				return;
			}

			const
				url = RegExp.$2,
				nodeModule = isNodeModule(url);

			if (nodeModule && /\bentries\b/.test(url) || /^\.\//.test(url)) {
				const
					d = nodeModule ? lib : dir;

				let
					f = path.join(d, `${url}.js`);

				if (!fs.existsSync(f)) {
					f = path.join(d, `${url}/index.js`);
				}

				getEntryDepList(path.dirname(f), fs.readFileSync(f, 'utf-8'), arr);

			} else {
				arr.push(path.join(dir, url));
			}
		});

		return arr;
	}

	/**
	 * Returns a graph with dependencies for an entry file
	 */
	function getEntryDeps(dir, file) {
		const deps = {
			runtime: new Set(),
			parents: new Set()
		};

		const
			runtime = new Set();

		$C(getEntryDepList(dir, file)).forEach((el) => {
			const
				name = path.basename(el, '.js'),
				block = blockMap[name];

			if (!pzlr.validators.blockName(name) || !block) {
				deps.runtime.add(el);
				return;
			}

			const
				blockDeps = getBlockDeps(name);

			$C(blockDeps.runtime).forEach((block) => {
				if (!blockDeps.parents.has(block)) {
					runtime.add(block);
				}
			});

			deps.runtime = new Set([...deps.runtime, ...blockDeps.runtime]);
			deps.parents = new Set($C([...deps.parents, ...blockDeps.parents]).filter((el) => !runtime.has(el)).map());
		});

		return deps;
	}

	/////////////////////////////////////////////////
	// Load entries and build a graph of dependencies
	/////////////////////////////////////////////////

	const
		packs = {},
		weights = {};

	$C(entriesList).forEach((el) => {
		const
			deps = packs[path.basename(el, '.js')] = getEntryDeps(path.dirname(el), fs.readFileSync(el, 'utf-8'));

		$C(deps.runtime).forEach((block) => {
			if (block in weights) {
				weights[block].i++;

			} else {
				weights[block] = {
					i: 0,
					name: block,
					isParent: deps.parents.has(block)
				};
			}
		});
	});

	// Find common modules (weight > 1)
	const commonPacks = [];
	$C(weights).forEach((el, key) => {
		if (el.i > 1) {
			const pos = entriesList.length - el.i - 1;
			commonPacks[pos] = (commonPacks[pos] || new Map()).set(key, el);
		}
	});

	// Remove empty modules
	$C(commonPacks).remove((el) => !el);

	///////////////////////////////////
	// Generate dependence declarations
	///////////////////////////////////

	/**
	 * Returns a name for a common chunk by the specified id
	 */
	function getCommonName(i) {
		return `common_${i}`;
	}

	const
		dependencies = {};

	$C(packs).forEach((deps, name) => {
		const
			depList = new Set();

		$C(deps.runtime).forEach((block) => {
			const
				pos = $C(commonPacks).one.search((map) => map.has(block));

			if (pos !== null) {
				depList.add(pos);
				deps.runtime.delete(block);
			}
		});

		dependencies[name] = [...depList].sort((a, b) => a - b).map((i) => getCommonName(i));
	});

	$C(dependencies).forEach((el, key) => {
		if (key !== 'index' && !el.includes('index')) {
			el.unshift('index');
		}

		el.push(key);

		const
			content = `ModuleDependencies.add("${key}", ${JSON.stringify(el)});`,
			name = `${key}.dependencies`;

		const src = output
			.replace(/\[name]/g, `${name}.js`)
			.replace(/\[hash:?(\d*)]/, (str, length) => {
				const res = hasha(content, {algorithm: 'md5'});
				return length ? res.substr(0, Number(length)) : res;
			});

		fs.writeFileSync(src, content);

		let fd;
		try {
			fd = fs.openSync(assetsJSON, 'r+');

		} catch (_) {
			fd = fs.openSync(assetsJSON, 'w+');
		}

		const
			file = fs.readFileSync(fd, 'utf-8'),
			assets = file ? JSON.parse(file) : {};

		assets[name] = {js: src};
		fs.writeFileSync(fd, JSON.stringify(assets));
		fs.closeSync(fd);
	});

	////////////////////////////////
	// Generate webpack entry points
	////////////////////////////////

	const
		entry = {};

	$C(commonPacks).forEach((deps, i) => {
		entry[getCommonName(i)] = deps;
	});

	$C(packs).forEach((deps, name) => {
		entry[name] = $C(deps.runtime).reduce((map, name) => map.set(name, {
			name,
			isParent: deps.parents.has(name)
		}), new Map());
	});

	/**
	 * Returns an url relative to the entry folder
	 */
	function getUrl(url) {
		const
			r = (s) => s.replace(/\\/g, '/');

		if (isNodeModule(url)) {
			return r(url);
		}

		return r(path.relative(tmpEntries, url));
	}

	const processes = [{}];
	$C(entry).forEach((list, name) => {
		delete entry[name];

		// JS

		const
			blackName = /^[iv]-/,
			logicTaskName = `${name}.js`,
			logicFile = path.join(tmpEntries, logicTaskName);

		fs.writeFileSync(logicFile, $C(list).reduce((str, {name}) => {
			const
				block = blockMap[name];

			if (block) {
				$C(block.libs).forEach((el) => str += `require('${el}');\n`);
			}

			if (!block || block && block.logic) {
				const url = block ? block.logic : isNodeModule(name) ? name : path.resolve(tmpEntries, '../', name);
				str += `require('${getUrl(url)}');\n`;
			}

			return str;
		}, ''));

		entry[logicTaskName] = logicFile;
		processes[0][logicTaskName] = logicFile;

		// CSS

		const
			styleTaskName = `${name}$style`,
			styleFile = path.join(tmpEntries, `${name}.styl`);

		fs.writeFileSync(styleFile, $C(list).reduce((str, {name, isParent}) => {
			const
				block = blockMap[name];

			if (!isParent && $C(block).get('style.length') && !blackName.test(name)) {
				$C([].concat(block.style)).forEach((url) => {
					str += `@import "${getUrl(url)}"\n`;
				});

				if (/^[bp]-/.test(name)) {
					str +=
						`
.${name}
	extends($${String.camelize(name, false)})

`;
				}
			}

			return str;
		}, ''));

		let union = processes[processes.length - 1];
		if (processes.length === 1 || $C(union).length() > IN_PROCESS) {
			processes.push(union = {});
		}

		entry[styleTaskName] = union[styleTaskName] = styleFile;

		// TEMPLATES

		const
			tplTaskName = `${name}_tpl.js`,
			tplFile = path.join(tmpEntries, `${name}.ss${!args.fast ? '.js' : ''}`);

		fs.writeFileSync(tplFile, $C(list).reduce((str, {name, isParent}) => {
			const
				block = blockMap[name];

			if (!isParent && block && block.tpl && !blackName.test(name)) {
				const url = getUrl(block.tpl);
				str += args.fast ? `- include '${url}'\n` : `Object.assign(TPLS, require('./${url}'));\n`;
			}

			return str;
		}, !args.fast ? 'window.TPLS = window.TPLS || {};\n' : ''));

		if (args.fast) {
			const tplRequireFileUrl = path.join(tmpEntries, tplTaskName);
			fs.writeFileSync(tplRequireFileUrl, `Object.assign(window.TPLS = window.TPLS || {}, require('./${getUrl(tplFile)}'));\n`);
			entry[tplTaskName] = union[tplTaskName] = tplRequireFileUrl;

		} else {
			entry[tplTaskName] = union[tplTaskName] = tplFile;
		}

		// HTML

		const
			htmlTaskName = `${name}_view`,
			htmlFile = path.join(tmpEntries, `${htmlTaskName}.html.js`);

		fs.writeFileSync(htmlFile, $C(list).reduce((str, {name}) => {
			const
				block = blockMap[name];

			if (block && block.html && !blackName.test(name)) {
				str += `require('./${getUrl(block.html)}');\n`;
			}

			return str;
		}, ''));

		entry[htmlTaskName] = union[htmlTaskName] = htmlFile;
	});

	///////////////////
	// Cache the result
	///////////////////

	const res = {
		entry,
		processes,
		dependencies
	};

	if (cacheFile) {
		fs.writeFileSync(cacheFile, JSON.stringify(res, null, 2));
		process.env.FROM_CACHE = true;
	}

	return res;
};
