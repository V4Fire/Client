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
	fs = require('fs-extra-promise'),
	path = require('path');

const
	{resolve, entries, block} = require('@pzlr/build-core'),
	{args, output, buildCache} = include('build/build.webpack'),
	{normalizeSep} = include('build/helpers');

const
	RUNTIME = 0,
	STD = 1,
	HTML = 2,
	I = [RUNTIME, STD, HTML].length;

const
	RCPU = require('os').cpus().length,
	IN_PROCESS = ['js', 'css', 'html'].length;

let MAX_PROCESS = RCPU * IN_PROCESS;
MAX_PROCESS += MAX_PROCESS <= I ? 1 : 0;

/**
 * Tree of dependencies
 * @type {Promise<{entry, processes, dependencies}>}
 */
module.exports = (async () => {
	const mkdirp = (src) => {
		if (!fs.existsSync(src)) {
			fs.mkdirpSync(src);
		}
	};

	const
		cacheFile = path.join(buildCache, 'graph.json');

	if (Number(process.env.BUILD_GRAPH_FROM_CACHE)) {
		if (fs.existsSync(cacheFile)) {
			await new Promise((r) => {
				const f = () => {
					setTimeout(() => {
						if (fs.readFileSync(cacheFile, 'utf-8') !== '') {
							r();

						} else {
							f();
						}

					}, 15);
				};

				f();
			});

			return fs.readJSONSync(cacheFile);
		}

	} else {
		mkdirp(buildCache);
		fs.writeFileSync(cacheFile, '');
		process.env.BUILD_GRAPH_FROM_CACHE = 1;
	}

	const
		tmpEntries = path.join(resolve.entry(), 'tmp');

	mkdirp(tmpEntries);
	mkdirp(path.dirname(output));

	let
		entriesFilter;

	if (typeof args.build === 'string') {
		entriesFilter = $C(args.build.split(',')).reduce((map, el) => (map[el] = true, map), {});
		entriesFilter.index = true;
	}

	const
		buildConfig = (await entries.getBuildConfig()).filter((el, key) => entriesFilter ? entriesFilter[key] : true),
		blockMap = await block.getAll(),
		graph = await buildConfig.getUnionEntryPoints({cache: blockMap}),
		processes = $C(I).map(() => ({}));

	/**
	 * Returns an url relative to the entry folder
	 */
	function getUrl(url) {
		if (resolve.isNodeModule(url)) {
			return normalizeSep(url);
		}

		return normalizeSep(path.relative(tmpEntries, url));
	}

	const entry = await $C(graph.entry)
		.parallel()
		.to({})
		.reduce(async (entry, list, name) => {
			// JS / TS

			const
				blackName = /^[iv]-/,
				logicTaskName = `${name}.js`,
				logicFile = path.join(tmpEntries, logicTaskName);

			fs.writeFileSync(logicFile, await $C(list).async.to('').reduce(async (str, {name}) => {
				const
					block = blockMap.get(name),
					logic = block && await block.logic;

				if (block) {
					$C(block.libs).forEach((el) => str += `require('${el}');\n`);
				}

				if (!block || logic) {
					const url = logic ? logic : resolve.isNodeModule(name) ? name : path.resolve(tmpEntries, '../', name);
					str += `require('${getUrl(url)}');\n`;
				}

				return str;
			}));

			entry[logicTaskName] = logicFile;

			if (name === 'std') {
				processes[STD][logicTaskName] = logicFile;

			} else {
				processes[RUNTIME][logicTaskName] = logicFile;
			}

			// CSS

			const
				styleTaskName = `${name}$style`,
				styleFile = path.join(tmpEntries, `${name}.styl`);

			fs.writeFileSync(styleFile, await $C(list).async.to('').reduce(async (str, {name, isParent}) => {
				const
					block = blockMap.get(name),
					style = block && await block.styles;

				if (!isParent && style && style.length && !blackName.test(name)) {
					$C(style).forEach((url) => {
						str += `@import "${getUrl(url)}"\n`;
					});

					if (/^[bp]-/.test(name)) {
						str +=
							`
.${name}
	extends($${name.camelize(false)})

`;
					}
				}

				return str;
			}));

			let
				union = processes[processes.length - 1];

			if (processes.length === I || MAX_PROCESS > processes.length && $C(union).length() > IN_PROCESS) {
				processes.push(union = {});
			}

			entry[styleTaskName] = union[styleTaskName] = styleFile;

			// TEMPLATES

			const
				tplTaskName = `${name}_tpl.js`,
				tplFile = path.join(tmpEntries, `${name}.ss${!args.fast ? '.js' : ''}`);

			fs.writeFileSync(tplFile, await $C(list)
				.async
				.to(args.fast ? '' : 'window.TPLS = window.TPLS || Object.create(null);\n')
				.reduce(async (str, {name, isParent}) => {
					const
						block = blockMap.get(name),
						tpl = block && await block.tpl;

					if (!isParent && tpl && !blackName.test(name)) {
						const url = getUrl(tpl);
						str += args.fast ? `- include '${url}'\n` : `Object.assign(TPLS, require('./${url}'));\n`;
					}

					return str;
				})
			);

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

			fs.writeFileSync(htmlFile, await $C(list).async.to('').reduce(async (str, {name}) => {
				const
					block = blockMap.get(name),
					html = block && await block.etpl;

				if (html && !blackName.test(name)) {
					str += `require('./${getUrl(html)}');\n`;
				}

				return str;
			}));

			entry[htmlTaskName] = processes[HTML][htmlTaskName] = htmlFile;
			return entry;
		});

	$C(processes)
		.remove((obj) => !$C(obj).length());

	const res = {
		entry,
		processes,
		dependencies: $C(graph.dependencies).map((el, key) => [...el, key])
	};

	fs.writeFileSync(cacheFile, JSON.stringify(res, null, 2));
	console.log('Project graph initialized');

	return res;
})();

module.exports.MAX_PROCESS = MAX_PROCESS;
