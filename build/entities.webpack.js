'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	$C = require('collection.js'),
	Sugar = require('sugar'),
	pzlr = require('@pzlr/build-core');

const
	fs = require('fs-extra-promise'),
	path = require('path'),
	hasha = require('hasha');

const
	{src} = require('config'),
	{args, output, assetsJSON, buildCache} = include('build/build.webpack');

const
	IN_PROCESS = 3;

/**
 * Tree of dependencies
 * @type {Promise<{entry, processes, dependencies}>}
 */
module.exports = (async () => {
	let
		cacheFile;

	if (Number(process.env.FROM_CACHE)) {
		await fs.mkdirpAsync(buildCache);
		cacheFile = path.join(buildCache, 'graph.json');

		if (fs.existsAsync(cacheFile)) {
			return fs.readJSONAsync(cacheFile);
		}
	}

	const
		tmpEntries = path.join(pzlr.resolve.entry(), 'tmp');

	const mkdirp = async (src) => {
		if (!await fs.existsAsync(src)) {
			await fs.mkdirAsync(src);
		}
	};

	await Promise.all([
		mkdirp(tmpEntries),
		mkdirp(path.dirname(output))
	]);

	let
		entriesFilter;

	if (typeof args.build === 'string') {
		entriesFilter = $C(args.build.split(',')).reduce((map, el) => (map[el] = true, map), {});
		entriesFilter.index = true;
	}

	const
		buildConfig = (await pzlr.entries.getBuildConfig()).filter((el, key) => entriesFilter ? entriesFilter[key] : true),
		blockMap = await pzlr.block.getAll();

	// console.log(await blockMap.get('b-input').getRuntimeDependencies({cache: blockMap}));
	console.log(buildConfig.dependencies);
	return;

	/**
	 * Returns true if the specified url is a node module
	 */
	function isNodeModule(url) {
		return !path.isAbsolute(url) && /^[^./\\]/.test(url);
	}

	/////////////////////////////////////////////////
	// Load entries and build a graph of dependencies
	/////////////////////////////////////////////////

	const
		packs = {},
		weights = {};

	console.log(1111, buildConfig.entries);

	$C(entriesList).forEach((el) => {
		const
			deps = packs[path.basename(el, '.js')] = getEntryDeps(path.dirname(el), fs.readFileSync(el, 'utf-8'));

		$C(deps.runtime).forEach((block) => {
			if (block in weights) {
				const
					w = weights[block];

				w.i++;
				if (w.isParent) {
					w.isParent = deps.parents.has(block);
				}

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

		// JS / TS

		const
			blackName = /^[iv]-/,
			logicTaskName = `${name}.js`,
			logicFile = path.join(tmpEntries, logicTaskName);

		fs.writeFileSync(logicFile, $C(list).reduce((str, {name}) => {
			const
				block = blockMap.get(name);

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
				block = blockMap.get(name);

			if (!isParent && $C(block).get('style.length') && !blackName.test(name)) {
				$C([].concat(block.style)).forEach((url) => {
					str += `@import "${getUrl(url)}"\n`;
				});

				if (/^[bp]-/.test(name)) {
					str +=
						`
.${name}
	extends($${Sugar.String.camelize(name, false)})

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
				block = blockMap.get(name);

			if (!isParent && block && block.tpl && !blackName.test(name)) {
				const url = getUrl(block.tpl);
				str += args.fast ? `- include '${url}'\n` : `Object.assign(TPLS, require('./${url}'));\n`;
			}

			return str;
		}, !args.fast ? 'window.TPLS = window.TPLS || Object.create(null);\n' : ''));

		if (args.fast) {
			const
				tplRequireFileUrl = path.join(tmpEntries, tplTaskName);

			fs.writeFileSync(
				tplRequireFileUrl,
				`Object.assign(window.TPLS = window.TPLS || Object.create(null), require('./${getUrl(tplFile)}'));\n`
			);

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
				block = blockMap.get(name);

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
})();
