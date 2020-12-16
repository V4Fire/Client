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
	config = require('config');

const
	fs = require('fs-extra-promise'),
	path = require('upath'),
	camelize = require('camelize');

const
	{build, src} = config,
	{resolve, entries, block} = require('@pzlr/build-core');

const
	{output, cacheDir, isStandalone} = include('build/helpers.webpack');

let
	buildIterator = -1;

const
	STANDALONE = ++buildIterator,
	RUNTIME = ++buildIterator,
	HTML = ++buildIterator;

const
	MIN_PROCESS = ++buildIterator,
	MAX_PROCESS = build.processes > MIN_PROCESS ? build.processes : MIN_PROCESS,
	MAX_TASKS_PER_ONE_PROCESS = 3;

/**
 * The project graph
 * @type {Promise<{entry, processes, dependencies, blockMap}>}
 */
module.exports = Object.assign(buildProjectGraph(), {
	STANDALONE,
	RUNTIME,
	HTML,
	MIN_PROCESS,
	MAX_PROCESS
});

/**
 * Builds the project graph
 * @returns {Promise<{entry, processes, dependencies, blockMap}>}
 */
async function buildProjectGraph() {
	const
		graphCacheFile = path.join(cacheDir, 'graph.json');

	// Graph already exists in the cache and we can read it
	if (build.buildGraphFromCache && fs.existsSync(graphCacheFile)) {
		/**
		 * Parses the graph from JSON to JS
		 * @returns {!Object}
		 */
		const readCache = () => fs.readJSONSync(graphCacheFile, {
			reviver(k, v) {
				if (Object.isObject(v) && v.type === 'Map') {
					return new Map(v.value);
				}

				return v;
			}
		});

		const
			timeout = (1).minute();

		let
			total = 0;

		return new Promise((r) => {
			const f = () => {
				// Sometimes we can be caught in the situation when one of the multiple processes writes something
				// to the cache file and it breaks the cache for a moment.
				// To avoid this, we can sleep a little and try again.
				setTimeout(() => {
					try {
						r(readCache());

					} catch {
						total += 15;

						if (total > timeout) {
							build.buildGraphFromCache = false;
							return buildProjectGraph();
						}

						f();
					}
				}, 15);
			};

			f();
		});
	}

	fs.mkdirpSync(cacheDir);
	fs.writeFileSync(graphCacheFile, '');

	// All others process will use this cache
	process.env.BUILD_GRAPH_FROM_CACHE = 1;

	const
		tmpEntries = path.join(resolve.entry(), `tmp/${build.hash()}`);

	fs.mkdirpSync(tmpEntries);
	fs.mkdirpSync(path.join(src.clientOutput(), path.dirname(output)));

	let
		entriesFilter;

	// Filtering of build entries (if there are specified)
	if (build.entries) {
		entriesFilter = $C(build.entries).reduce((map, el) => {
			map[el] = true;
			return map;
		}, {});

		entriesFilter.index = true;
		entriesFilter.std = true;
	}

	const
		buildConfig = (await entries.getBuildConfig()).filter((el, key) => !entriesFilter || entriesFilter[key]),
		blockMap = await block.getAll();

	const
		graph = await buildConfig.getUnionEntryPoints({cache: blockMap}),
		processes = $C(MIN_PROCESS).map(() => ({}));

	// Generate dynamic entries to build with WebPack
	const entry = await $C(graph.entry)
		.parallel()
		.to({})
		.reduce(async (entry, list, name) => {
			// JS / TS

			const
				componentsToIgnore = /^[iv]-/,
				cursor = isStandalone(name) ? STANDALONE : RUNTIME;

			let
				taskProcess = processes[cursor];

			{
				const
					entrySrc = path.join(tmpEntries, `${name}.js`);

				fs.writeFileSync(entrySrc, await $C(list).async.to('').reduce(async (str, {name}) => {
					const
						block = blockMap.get(name),
						logic = block && await block.logic;

					if (block) {
						$C(block.libs).forEach((el) => str += `require('${el}');\n`);
					}

					if (!block || logic) {
						let
							url;

						if (logic) {
							url = logic;

						} else if (resolve.isNodeModule(name)) {
							url = name;

						} else {
							url = path.resolve(tmpEntries, '../', name);
						}

						str += `require('${getEntryURL(url)}');\n`;
					}

					return str;
				}));

				entry[name] = entrySrc;
				taskProcess[name] = entrySrc;
			}

			// TEMPLATES

			{
				const
					entryName = `${name}_tpl`,
					entrySrc = path.join(tmpEntries, `${name}.ss.js`);

				fs.writeFileSync(entrySrc, await $C(list)
					.async
					.to('window.TPLS = window.TPLS || Object.create(null);\n')
					.reduce(async (str, {name, isParent}) => {
						const
							block = blockMap.get(name),
							tpl = block && await block.tpl;

						if (!isParent && tpl && !componentsToIgnore.test(name)) {
							const url = getEntryURL(tpl);
							str += `Object.assign(TPLS, require('./${url}'));\n`;
						}

						return str;
					}));

				entry[entryName] = entrySrc;
				taskProcess[entryName] = entrySrc;
			}

			taskProcess = processes[processes.length > buildIterator ? processes.length - 1 : STANDALONE];

			if (MAX_PROCESS > processes.length && $C(taskProcess).length() > MAX_TASKS_PER_ONE_PROCESS) {
				taskProcess = {};
				processes.push(taskProcess);
			}

			// CSS

			{
				const
					entryName = `${name}_style`,
					entrySrc = path.join(tmpEntries, `${name}.styl`);

				fs.writeFileSync(entrySrc, [
					await $C(list).async.to('').reduce(async (str, {name, isParent}) => {
						const
							block = blockMap.get(name),
							style = block && await block.styles;

						if (!isParent && style && style.length && !componentsToIgnore.test(name)) {
							$C(style).forEach((url) => {
								str += `@import "${getEntryURL(url)}"\n`;
							});

							if (/^[bp]-/.test(name)) {
								str +=
									`
.${name}
	extends($${camelize(name)})

`;
							}
						}

						return str;
					}),

					'generateImgClasses()'
				].join('\n'));

				entry[entryName] = entrySrc;
				taskProcess[entryName] = entrySrc;
			}

			// HTML

			{
				const
					entryName = `${name}_view`,
					entrySrc = path.join(tmpEntries, `${entryName}.html.js`);

				fs.writeFileSync(entrySrc, await $C(list).async.to('').reduce(async (str, {name}) => {
					const
						block = blockMap.get(name),
						html = block && await block.etpl;

					if (html && !componentsToIgnore.test(name)) {
						str += `require('./${getEntryURL(html)}');\n`;
					}

					return str;
				}));

				entry[entryName] = entrySrc;

				// eslint-disable-next-line require-atomic-updates
				processes[HTML][entryName] = entrySrc;
			}

			return entry;
		});

	// Move HTML tasks to the end of the build queue
	processes.push(processes[HTML]);
	processes.splice(HTML, 1);

	// Remove redundant process
	$C(processes).remove((obj, i) => i >= buildIterator.length && !$C(obj).length());

	// Helper to serialize Map values
	blockMap.toJSON = () => ({
		type: 'Map',
		value: Array.from(blockMap.entries())
	});

	const res = {
		entry,
		blockMap,
		processes,
		dependencies: $C(graph.dependencies).map((el, key) => [...el, key])
	};

	fs.writeFileSync(graphCacheFile, JSON.stringify(res));
	console.log('Project graph initialized');

	return res;

	/**
	 * Returns the specified URL relative to the entry folder
	 */
	function getEntryURL(url) {
		if (resolve.isNodeModule(url)) {
			return path.normalize(url);
		}

		return path.relative(tmpEntries, url);
	}
}
