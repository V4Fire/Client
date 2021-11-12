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
	{resolve, block, entries} = require('@pzlr/build-core');

const
	componentParams = include('build/graph/component-params');

let
	{buildIterator} = include('build/const');

const {
	isLayerDep,

	HTML,
	RUNTIME,
	STANDALONE,

	MIN_PROCESS,
	MAX_PROCESS,
	MAX_TASKS_PER_ONE_PROCESS
} = include('build/const');

const {
	output,
	cacheDir,
	isStandalone
} = include('build/helpers');

/**
 * The project graph
 * @type {Promise<{entry, components, processes, dependencies}>}
 */
module.exports = buildProjectGraph();

const
	needLoadStylesAsJS = webpack.dynamicPublicPath();

/**
 * Builds a project graph
 * @returns {!Promise<{entry, components, processes, dependencies}>}
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
		components = await getComponents();

	const
		graph = await buildConfig.getUnionEntryPoints({cache: components}),
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
		components,
		processes,
		dependencies: $C(graph.dependencies).map((el, key) => [...el, key])
	};

	fs.writeFileSync(graphCacheFile, JSON.stringify(Object.reject(res, 'components'), undefined, 2));
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
					component = components.get(name),
					logic = await component?.logic;

				if (component) {
					$C(component.libs).forEach((el) => str += `require('${el}');\n`);
				}

				const needRequireAsLogic = component ?
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
					component = components.get(name),
					tpl = await component?.tpl;

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
			cursor !== STANDALONE &&
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
					component = components.get(name),
					styles = await component?.styles;

				const needRequireAsStyles = component ?
					!isParent && styles && styles.length && !componentsToIgnore.test(name) :
					/^\.(?:styl|css)(?:\?|$)/.test(path.extname(name));

				if (needRequireAsStyles) {
					const
						getImport = (filePath) => `@import "${getEntryPath(filePath)}"\n`;

					if (component) {
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
					component = components.get(name),
					html = await component?.etpl;

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
							components: await getComponents()
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
	 * Returns a map of all existed components
	 */
	async function getComponents() {
		const components = await block.getAll(null, {
			lockPrefix: build.componentLockPrefix()
		});

		$C(components).forEach((component, name) => {
			component.params = componentParams[camelize(name)] ?? {};
		});

		return components;
	}

	/**
	 * Returns a file path relative to the entry folder
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
