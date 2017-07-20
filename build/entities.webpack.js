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
	{String} = require('sugar'),
	{args} = require('./helpers.webpack');

const
	fs = require('fs'),
	path = require('path'),
	findUp = require('find-up'),
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
 * @param {string} blocks - path to a block folder
 * @param {string} lib - path to a lib folder
 * @param {string} output - output path
 * @param {string} cache - path to a cache folder
 * @param {string} assetsJSON - path to assets.json file
 * @returns {{processes, entry, dependencies, commonPacks}}
 */
module.exports = function ({entries, blocks, lib, output, cache, assetsJSON}) {
	let
		cacheFile;

	if (cache) {
		mkdirp.sync(cache);
		cacheFile = path.join(cache, 'graph.json');
		if (fs.existsSync(cacheFile)) {
			return require(cacheFile);
		}
	}

	function getCommonName(i) {
		return `common_${i}`;
	}

	const
		components = '!(core|models|libs|entries)/**/@(index|*.index).js';

	const files = [].concat(
		glob.sync(path.join(lib, '@v4fire/client/src', components)),
		glob.sync(path.join(blocks, components))
	);

	// Load index declarations of blocks
	const blockMap = $C(files).reduce((map, el) => {
		const
			decl = pzlr.declaration.parse(fs.readFileSync(el)),
			cwd = path.dirname(el),
			url = (ext) => path.join(cwd, `${decl.name}.${ext}`);

		const
			logic = url('js'),
			style = url('styl'),
			tpl = url('ss'),
			html = url('ess');

		if (fs.existsSync(logic)) {
			decl.logic = logic;
		}

		if (fs.existsSync(style)) {
			decl.style = style;
		}

		if (fs.existsSync(tpl)) {
			decl.tpl = tpl;
		}

		if (fs.existsSync(html)) {
			decl.html = html;
		}

		if (decl.libs.length) {
			const root = findUp.sync('src', {cwd});
			$C(decl.libs).set((el) => path.join(root, el));
		}

		decl.src = el;
		map[decl.name] = decl;
		return map;
	}, {});

	// Parse --build arguments
	let entriesFilter;
	if (typeof args.build === 'string') {
		entriesFilter = $C(args.build.split(',')).reduce((map, el) => (map[el] = true, map), {});
		entriesFilter.index = true;
	}

	// Load entries
	const entriesList = $C(glob.sync(path.join(entries, '*.js'))).get((el) => {
		if (entriesFilter) {
			return entriesFilter[path.basename(el, '.js')];
		}

		return true;
	});

	// Build a graph with dependencies for each block
	function getBlocks(name, runtimeDependencies = [], compileDependencies = [], parents = []) {
		compileDependencies.unshift(name);
		runtimeDependencies.unshift(name);

		const
			block = blockMap[name];

		if (!block) {
			throw new Error(`Block "${name}" not exists!`);
		}

		$C(block.dependencies).forEach((block) => {
			block = path.basename(block.replace(/^@/, ''));
			compileDependencies.unshift(block);
			runtimeDependencies.unshift(block);
			getBlocks(block, runtimeDependencies, compileDependencies);
		});

		if (block.parent) {
			const parent = path.basename(block.parent);
			runtimeDependencies.unshift(parent);
			parents.unshift(parent);
			getBlocks(parent, runtimeDependencies, compileDependencies, parents);
		}

		block.compileDependencies = new Set(compileDependencies);
		block.runtimeDependencies = new Set(runtimeDependencies);
		block.parents = new Set(parents);

		return runtimeDependencies;
	}

	function isNodeModule(url) {
		return !path.isAbsolute(url) && /^[^./\\]/.test(url);
	}

	// Returns dependencies from a file with entries
	function getDependencies(dir, file, arr = []) {
		$C(file.split(/\r?\n|\r/)).forEach((el) => {
			if (!/^import\s+('|")(.*?)\1;?/.test(el)) {
				return;
			}

			const
				url = RegExp.$2,
				nodeModule = isNodeModule(url);

			if (nodeModule || /^\.\//.test(url)) {
				const
					d = nodeModule ? lib : dir;

				let
					f = path.join(d, `${url}.js`);

				if (!fs.existsSync(f)) {
					f = path.join(d, `${url}/index.js`)
				}

				getDependencies(path.dirname(f), fs.readFileSync(f, 'utf-8'), arr);

			} else {
				arr.push(path.join(dir, url));
			}
		});

		return arr;
	}

	// Parses a file with entries
	function extractFile(dir, file) {
		let list = [];

		$C(getDependencies(dir, file)).forEach((el) => {
			const
				name = path.basename(el, '.js'),
				block = blockMap[name];

			if (!pzlr.validators.blockName(name) || !block) {
				list.push(el);
				return;
			}

			list = list.concat(getBlocks(name));
		});

		return [...new Set(list)];
	}

	const
		packs = {},
		weights = {};

	// Load entries
	$C(entriesList).forEach((el) => {
		const
			list = packs[path.basename(el, '.js')] = extractFile(path.dirname(el), fs.readFileSync(el, 'utf-8'));

		$C(list).forEach((block) => {
			if (block in weights) {
				weights[block]++;

			} else {
				weights[block] = 0;
			}
		});
	});

	// Find common modules (weight > 1)
	const commonPacks = [];
	$C(weights).forEach((i, key) => {
		if (i > 1) {
			const pos = entriesList.length - i - 1;
			(commonPacks[pos] = commonPacks[pos] || new Set()).add(key);
		}
	});

	// Remove empty modules
	$C(commonPacks).remove((el) => !el);

	// Configure dependencies for each entry point
	const dependencies = {};
	$C(packs).forEach((list, name) => {
		const
			dep = dependencies[name] = dependencies[name] || new Set(),
			newList = [];

		$C(list).forEach((block) => {
			const
				pos = $C(commonPacks).one.search((set) => set.has(block));

			if (pos === null) {
				newList.push(block);

			} else {
				dep.add(pos);
			}
		});

		dependencies[name] = [...dep].sort((a, b) => a - b).map((i) => getCommonName(i));
		packs[name] = newList;
	});

	// Generate new entry points
	const entry = {};
	$C(commonPacks).forEach((list, i) => entry[getCommonName(i)] = list);
	$C(packs).forEach((list, name) => entry[name] = new Set(list));

	// Temporary folder for webpack entry points
	const tmpEntries = path.join(entries, 'tmp');
	mkdirp.sync(tmpEntries);

	function getUrl(url) {
		const
			r = (s) => s.replace(/\\/g, '/');

		if (isNodeModule(url)) {
			return r(url);
		}

		return r(path.relative(tmpEntries, url));
	}

	// Generate webpack entry points
	const processes = [{}];
	$C(entry).forEach((list, name) => {
		delete entry[name];

		// JS

		const
			blackName = /^[iv]-/,
			logicTaskName = `${name}.js`,
			logicFile = path.join(tmpEntries, logicTaskName);

		fs.writeFileSync(logicFile, $C(list).reduce((str, name) => {
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

		fs.writeFileSync(styleFile, $C(list).reduce((str, name) => {
			const
				block = blockMap[name];

			if (block && block.style && !blackName.test(name)) {
				const url = getUrl(block.style);
				str += `@import "${url}"\n`;

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

		fs.writeFileSync(tplFile, $C(list).reduce((str, name) => {
			const
				block = blockMap[name];

			if (block && block.tpl && !blackName.test(name)) {
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

		fs.writeFileSync(htmlFile, $C(list).reduce((str, name) => {
			const
				block = blockMap[name];

			if (block && block.html && !blackName.test(name)) {
				str += `require('./${getUrl(block.html)}');\n`;
			}

			return str;
		}, ''));

		entry[htmlTaskName] = union[htmlTaskName] = htmlFile;
	});

	const finalCommonPacks = ['index.js'].concat($C(commonPacks).map((el, i) => `${getCommonName(i)}.js`));
	mkdirp.sync(path.dirname(output));

	// Generate dependence declarations
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

	const res = {
		processes,
		entry,
		dependencies,
		commonPacks: finalCommonPacks
	};

	if (cacheFile) {
		fs.writeFileSync(cacheFile, JSON.stringify(res, null, 2));
		process.env.FROM_CACHE = true;
	}

	return res;
};
