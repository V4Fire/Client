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
	fs = require('fs-extra'),
	path = require('upath');

const
	camelize = require('camelize');

const
	{src, build, webpack} = config,
	{resolve, entries, block} = require('@pzlr/build-core');

const
	{output, cacheDir, isStandalone} = include('build/helpers.webpack'),
	{isLayerDep} = include('build/const');

let
	buildIterator = 0;

const
	HTML = buildIterator++,
	RUNTIME = buildIterator++,
	STANDALONE = buildIterator;

const
	MIN_PROCESS = buildIterator + 1,
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

const
	needLoadStylesAsJS = webpack.dynamicPublicPath();

/**
 * Builds the project graph
 * @returns {!Promise<{entry, processes, dependencies, blockMap}>}
 */
async function buildProjectGraph() {
	block.setObjToHash(config.componentDependencies());

	const
		graphCacheFile = path.join(cacheDir, 'graph.json');

	// Graph already exists in the cache and we can read it
	if (build.buildGraphFromCache && fs.existsSync(graphCacheFile)) {
		return loadFromCache();
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

	// Generate dynamic entries to build with webpack
	const entry = await $C(graph.entry)
		.parallel()
		.to({})
		.reduce(entryReducer);

	// Move HTML tasks to the end of the build queue
	processes.push(processes[HTML]);
	processes.splice(HTML, 1);

	const res = {
		entry,
		blockMap,
		processes,
		dependencies: $C(graph.dependencies).map((el, key) => [...el, key])
	};

	fs.writeFileSync(graphCacheFile, JSON.stringify(Object.reject(res, 'blockMap'), undefined, 2));
	console.log('The project graph is initialized');

	return res;

	/**
	 * Reducer to create an entry point object
	 */
	async function entryReducer(entry, list, name) {
		// JS / TS

		const
			componentsToIgnore = /^[iv]-/,
			cursor = isStandalone(name) ? STANDALONE : RUNTIME;

		const
			webpackRuntime = "require('core/prelude/webpack');";

		let
			taskProcess = processes[cursor];

		{
			const
				entrySrc = path.join(tmpEntries, `${name}.js`);

			const content = await $C(list).async.to('').reduce(async (str, {name}) => {
				const
					block = blockMap.get(name),
					logic = block && await block.logic;

				if (block) {
					$C(block.libs).forEach((el) => str += `require('${el}');\n`);
				}

				const needRequireAsLogic = block ?
					logic :
					/^$|^\.(?:js|ts)(?:\?|$)/.test(path.extname(name));

				if (needRequireAsLogic) {
					let
						entry;

					if (logic) {
						entry = logic;

					} else if (resolve.isNodeModule(name)) {
						entry = name;

					} else {
						entry = path.resolve(tmpEntries, '../', name);
					}

					str += `require('${getEntryPath(entry)}');\n`;
				}

				return str;
			});

			fs.writeFileSync(entrySrc, content);
			entry[name] = entrySrc;
			taskProcess[name] = entrySrc;
		}

		// TEMPLATES

		{
			const
				entryName = `${name}_tpl`,
				entrySrc = path.join(tmpEntries, `${name}.ss.js`);

			const content = await $C(list).async.to('').reduce(async (str, {name, isParent}) => {
				const
					block = blockMap.get(name),
					tpl = block && await block.tpl;

				if (!isParent && tpl && !componentsToIgnore.test(name)) {
					const entry = getEntryPath(tpl);
					str += `Object.assign(TPLS, require('./${entry}'));\n`;
				}

				return str;
			});

			fs.writeFileSync(
				entrySrc,

				[
					webpackRuntime,
					'window.TPLS = window.TPLS || Object.create(null);',
					content
				].join('\n')
			);

			entry[entryName] = entrySrc;
			taskProcess[entryName] = entrySrc;
		}

		taskProcess = processes[buildIterator];

		const canAddMoreProcess =
			MAX_PROCESS > buildIterator &&
			$C(taskProcess).length() >= MAX_TASKS_PER_ONE_PROCESS;

		if (canAddMoreProcess) {
			taskProcess = {};
			processes.push(taskProcess);
			buildIterator++;
		}

		// CSS

		{
			const
				entryName = `${name}_style`,
				stylSrc = path.join(tmpEntries, `${name}.styl`);

			const content = await $C(list).async.to('').reduce(async (str, {name, isParent}) => {
				const
					block = blockMap.get(name),
					styles = block && await block.styles;

				const needRequireAsStyles = block ?
					!isParent && styles && styles.length && !componentsToIgnore.test(name) :
					/^\.(?:styl|css)(?:\?|$)/.test(path.extname(name));

				if (needRequireAsStyles) {
					const
						getImport = (filePath) => `@import "${getEntryPath(filePath)}"\n`;

					if (block) {
						$C(styles).forEach((filePath) => {
							str += getImport(filePath);
						});

					} else {
						str += getImport(name);
					}

					if (!needLoadStylesAsJS) {
						const
							normalizedName = path.basename(name, path.extname(name));

						if (/^[bp]-/.test(normalizedName)) {
							str +=
								`
.${normalizedName}
	extends($${camelize(normalizedName)})

`;
						}
					}
				}

				return str;
			});

			let
				entrySrc;

			if (needLoadStylesAsJS) {
				entrySrc = path.join(tmpEntries, `${name}.styl.js`);
				fs.writeFileSync(stylSrc, content);
				fs.writeFileSync(entrySrc, [webpackRuntime, `require('${stylSrc}');`].join('\n'));

			} else {
				entrySrc = stylSrc;
				fs.writeFileSync(entrySrc, [content, 'generateImgClasses()'].join('\n'));
			}

			entry[entryName] = entrySrc;
			taskProcess[entryName] = entrySrc;
		}

		// HTML

		{
			const
				entryName = `${name}_view`,
				entrySrc = path.join(tmpEntries, `${entryName}.html.js`);

			const content = await $C(list).async.to('').reduce(async (str, {name}) => {
				const
					block = blockMap.get(name),
					html = block && await block.etpl;

				if (html && !componentsToIgnore.test(name)) {
					str += [webpackRuntime, `require('./${getEntryPath(html)}');\n`].join('\n');
				}

				return str;
			});

			fs.writeFileSync(entrySrc, content);

			entry[entryName] = entrySrc;

			// eslint-disable-next-line require-atomic-updates
			processes[HTML][entryName] = entrySrc;
		}

		return entry;
	}

	/**
	 * Loads the dependency graph from a cache
	 */
	function loadFromCache() {
		const
			timeout = (1).minute();

		let
			total = 0;

		return new Promise((r) => {
			const delay = 500;

			const f = () => {
				// Sometimes we can be caught in the situation when one of the multiple processes writes something
				// to the cache file and it breaks the cache for a moment.
				// To avoid this, we can sleep a little and try again.
				setTimeout(async () => {
					try {
						const
							graph = fs.readJSONSync(graphCacheFile);

						r({
							...graph,
							blockMap: await block.getAll()
						});

					} catch (err) {
						total += delay;

						if (total > timeout) {
							build.buildGraphFromCache = false;
							return buildProjectGraph();
						}

						f();
					}
				}, delay);
			};

			f();
		});
	}

	/**
	 * Returns the specified path relative to the entry folder
	 */
	function getEntryPath(filePath) {
		if (resolve.isNodeModule(filePath)) {
			const
				resolvedEntry = src.lib(filePath);

			if (!isLayerDep.test(filePath) || !fs.existsSync(resolvedEntry)) {
				return path.normalize(filePath);
			}

			filePath = resolvedEntry;
		}

		return path.relative(tmpEntries, filePath);
	}
}
