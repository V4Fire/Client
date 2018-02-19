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
	path = require('path'),
	hasha = require('hasha');

const
	{resolve, entries, block} = require('@pzlr/build-core'),
	{args, output, assetsJSON, buildCache} = include('build/build.webpack'),
	{normalizeSep} = include('build/helpers');

const
	IN_PROCESS = 3;

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

	let
		cacheFile;

	if (Number(process.env.FROM_CACHE)) {
		mkdirp(buildCache);
		cacheFile = path.join(buildCache, 'graph.json');

		if (fs.existsSync(cacheFile)) {
			return fs.readJSONSync(cacheFile);
		}
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
		graph = await buildConfig.getUnionEntryPoints({cache: blockMap});

	$C(graph.dependencies).forEach((el, key, data) => {
		if (key !== 'index' && !el.has('index')) {
			data[key] = new Set(['index', ...el]);
		}

		el.add(key);

		const
			content = `ModuleDependencies.add("${key}", ${JSON.stringify([...el])});`,
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

	/**
	 * Returns an url relative to the entry folder
	 */
	function getUrl(url) {
		if (resolve.isNodeModule(url)) {
			return normalizeSep(url);
		}

		return normalizeSep(path.relative(tmpEntries, url));
	}

	const processes = [
		{}
	];

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
			processes[0][logicTaskName] = logicFile;

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

			let union = processes[processes.length - 1];
			if (processes.length === 1 || $C(union).length() > IN_PROCESS) {
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

			entry[htmlTaskName] = union[htmlTaskName] = htmlFile;
			return entry;
		});

	const res = {
		entry,
		processes,
		dependencies: graph.dependencies
	};

	if (cacheFile) {
		fs.writeFileSync(cacheFile, JSON.stringify(res, null, 2));
		process.env.FROM_CACHE = true;
	}

	return res;
})();
