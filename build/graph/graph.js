/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	$C = require('collection.js'),
	config = require('@config/config');

const
	fs = require('fs-extra'),
	path = require('upath');

const
	{src, build, webpack} = config,
	{resolve, block, entries, validators} = require('@pzlr/build-core');

const
	componentParams = include('build/graph/component-params');

const {
	isLayerDep,

	HTML,
	RUNTIME,
	STANDALONE,
	STYLES,

	MIN_PROCESS,
	MAX_TASKS_PER_ONE_PROCESS,
	MAX_PROCESS
} = include('build/const');

const {
	output,
	cacheDir,
	isStandalone,
	tracer,
	invokeByRegisterEvent,
	getLayerName
} = include('build/helpers');

/**
 * The project graph
 * @type {Promise<{entry, components, processes, dependencies}>}
 */
module.exports = buildProjectGraph();

const
	needLoadStylesAsJS = webpack.dynamicPublicPath();

let
	styleIndex = 1;

/**
 * Builds a project graph
 * @returns {Promise<{entry, entryDeps, components, processes, dependencies}>}
 */
async function buildProjectGraph() {
	const buildFinished = tracer.measure('Build graph', {cat: ['graph']});

	block.setObjToHash(config.componentDependencies());

	const
		graphCacheFile = path.join(cacheDir, 'graph.json');

	// The graph is already in the cache, and we can read it
	if (build.buildGraphFromCache && fs.existsSync(graphCacheFile)) {
		const cache = loadFromCache();
		buildFinished();
		return cache;
	}

	fs.mkdirpSync(cacheDir);
	fs.writeFileSync(graphCacheFile, '');

	// All other processes will use this cache
	process.env.BUILD_GRAPH_FROM_CACHE = 1;

	const
		tmpEntries = path.join(resolve.entry(), `tmp/${build.hash()}`);

	fs.mkdirpSync(tmpEntries);
	fs.mkdirpSync(path.join(src.clientOutput(), path.dirname(output)));

	let
		entriesFilter;

	// Filtering the build entries (if specified)
	if (build.entries) {
		entriesFilter = $C(build.entries).reduce((map, el) => {
			map[el] = true;
			return map;
		}, {});

		entriesFilter.index = true;
		entriesFilter.std = true;
	}

	const
		monic = config.monic().javascript;

	const
		buildConfig = (await entries.getBuildConfig({monic})).filter((el, key) => !entriesFilter || entriesFilter[key]),
		components = await getComponents();

	const
		graph = await buildConfig.getUnionEntryPoints({cache: components}),
		processes = $C(MIN_PROCESS).map(() => ({entries: {}}));

	if (webpack.ssr) {
		const ssrEntry = {
			main: new Map()
		};

		Object.entries(graph.entry).forEach(([name, value]) => {
			if (name === 'std' || !isStandalone(name)) {
				for (const [entryPath, entryVal] of value) {
					ssrEntry.main.set(entryPath, entryVal);
				}
			}
		});

		graph.entry = ssrEntry;
	}

	// Generate dynamic entries to build with webpack
	const entry = await $C(graph.entry)
		.parallel()
		.to({})
		.reduce(entryReducer);

	processes[HTML].name = 'html';
	processes[RUNTIME].name = 'runtime';
	processes[STANDALONE].name = 'standalone';
	processes[STYLES].name = 'styles';

	// Add all other tasks as dependencies to the HTML task
	processes[HTML].dependencies = processes
		.filter((proc) => !Object.isEmpty(proc.entries) && proc.name !== 'html')
		.map((proc) => proc.name);

	const res = {
		entry,

		entryDeps: $C(graph.entry).reduce((res, deps) => {
			deps.forEach((el, key) => {
				res.set(key, el);
			});

			return res;
		}, new Map()),

		components,
		processes,

		dependencies: $C(graph.dependencies).map((el, key) => [...el, key])
	};

	fs.writeFileSync(
		graphCacheFile,
		JSON.stringify(Object.reject(res, 'components'), undefined, 2)
	);

	console.log('The project graph is initialized');
	buildFinished();

	return res;

	/**
	 * The reducer for creating an entry point object
	 *
	 * @param {object} entry
	 * @param {Array<string>} list
	 * @param {string} name
	 * @returns {object}
	 */
	async function entryReducer(entry, list, name) {
		// JS / TS

		const
			componentsToIgnore = /^[iv]-/,
			usedLibs = new Set(),
			cursor = isStandalone(name) ? STANDALONE : RUNTIME;

		const
			webpackRuntime = "require('core/prelude/webpack');",
			taskProcess = processes[cursor];

		let tplContent = await $C(list).async.to('').reduce(async (str, {name, isParent}) => {
			const
				component = components.get(name),
				tpl = await component?.tpl;

			if (!isParent && tpl && !componentsToIgnore.test(name)) {
				const entry = getEntryPath(tpl);
				str += `Object.assign(TPLS, require('./${entry}'));\n`;
			}

			return str;
		});

		if (tplContent) {
			const tplsStore = 'globalThis.TPLS = globalThis.TPLS || Object.create(null);\n';
			tplContent = [webpackRuntime, tplsStore, tplContent, ''].join('\n');
		}

		{
			const
				entrySrc = path.join(tmpEntries, `${name}.js`);

			let content = await $C(list).async.to('').reduce(async (str, {name}) => {
				const
					component = components.get(name),
					logic = await component?.logic;

				if (component) {
					$C(component.libs).forEach((el) => {
						if (!usedLibs.has(el)) {
							usedLibs.add(el);
							
							str += `require('${el}');\n`;
						}
					});
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

					const entryPath = getEntryPath(entry);
					let importScript;

					const
						componentName = component?.name ?? name,
						isComponent = new RegExp(`\(${validators.blockTypeList.join('|')})-.+?/?`).test(componentName);

					
					if (webpack.ssr) {
						importScript = `Object.assign(module.exports, require('${entryPath}'));\n`;

					} else {
						importScript = `require('${entryPath}');\n`;
					}

					str += isComponent ? 
						invokeByRegisterEvent(importScript, getLayerName(entry), componentName) :
						importScript;
				}

				return str;
			});

			if (webpack.ssr) {
				content = tplContent + content;
			}

			if (content) {
				fs.writeFileSync(entrySrc, content);
				entry[name] = entrySrc;
				taskProcess.entries[name] = entrySrc;
			}
		}

		if (!webpack.ssr) {
			// TEMPLATES

			{
				const
					entryName = `${name}_tpl`,
					entrySrc = path.join(tmpEntries, `${name}.ss.js`);

				if (tplContent) {
					fs.writeFileSync(entrySrc, tplContent);
					entry[entryName] = entrySrc;
					taskProcess.entries[entryName] = entrySrc;
				}
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
	extends($${normalizedName.camelize(false)})

`;
							}
						}
					}

					return str;
				});

				if (content) {
					let entrySrc;

					if (needLoadStylesAsJS) {
						entrySrc = path.join(tmpEntries, `${name}.styl.js`);

						fs.writeFileSync(stylSrc, content);

						fs.writeFileSync(
							entrySrc,
							[webpackRuntime, `require('${stylSrc}');`].join('\n')
						);

					} else {
						entrySrc = stylSrc;

						fs.writeFileSync(
							entrySrc,
							[content, 'generateImgClasses()'].join('\n')
						);
					}

					entry[entryName] = entrySrc;

					let
						processStyleIndex = STYLES;

					const canMoveBuildToNewProcess = MAX_PROCESS > processes.length &&
						Object.keys(processes[STYLES].entries).length > MAX_TASKS_PER_ONE_PROCESS;

					if (canMoveBuildToNewProcess) {
						processes.push({entries: {}, name: `styles_${styleIndex++}`});
						processStyleIndex = processes.length - 1;
					}

					processes[processStyleIndex].entries[entryName] = entrySrc;
				}
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

				if (content) {
					fs.writeFileSync(entrySrc, content);

					entry[entryName] = entrySrc;

					// eslint-disable-next-line require-atomic-updates
					processes[HTML].entries[entryName] = entrySrc;
				}
			}
		}

		return entry;
	}

	/**
	 * Loads dependency graph from cache
	 * @returns {Promise<object>}
	 */
	function loadFromCache() {
		const
			timeout = (1).minute();

		let
			total = 0;

		return new Promise((r) => {
			const delay = 500;

			const f = () => {
				// Sometimes we can get into a situation where one of the many processes writes something
				// to the cache file and breaks the cache for a moment.
				// To avoid this, we can get some sleep and try again.
				setTimeout(async () => {
					try {
						const
							graph = fs.readJSONSync(graphCacheFile);

						r({
							...graph,
							components: await getComponents()
						});

					} catch {
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
	 * @returns {Promise<Array<object>>}
	 */
	async function getComponents() {
		const components = await block.getAll(null, {
			lockPrefix: build.componentLockPrefix()
		});

		$C(components).forEach((component, name) => {
			component.params = componentParams[name.camelize(false)] ?? {};
		});

		return components;
	}

	/**
	 * Returns the file path relative to the entry folder
	 *
	 * @param {string} filePath
	 * @returns {string}
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
