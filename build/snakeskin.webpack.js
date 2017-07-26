'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{String} = require('sugar'),
	{validators} = require('@pzlr/build-core');

const
	$C = require('collection.js'),
	ss = require('snakeskin'),
	uuid = require('uuid');

const
	fs = require('fs'),
	path = require('path'),
	glob = require('glob'),
	findUp = require('find-up');

/**
 * Initializes Snakeskin
 *
 * @param {string} blocks - path to a block folder
 * @param {string} coreClient - path to the V4Fire core library
 */
module.exports = function ({blocks, coreClient}) {
	const
		blocksTree = {},
		components = `/**/@(${validators.blockTypeList.join('|')})-*.js`;

	const files = [].concat(
		glob.sync(path.join(coreClient, components)),
		glob.sync(path.join(blocks, components))
	);

	$C(files).forEach((el) => {
		const
			file = fs.readFileSync(el, {encoding: 'utf-8'});

		if (!/^export default class (.*?) extends (.*?) {/m.test(file)) {
			return;
		}

		const
			component = RegExp.$1,
			parent = RegExp.$2;

		const obj = blocksTree[component] = blocksTree[component] || {
			props: {},
			functional: /@component\s*\(\s*{\s*functional\s*:\s*true\s*}\s*\)/.test(file),
			parent
		};

		const
			propRgxp = /^(\t@(?:field|abstract)[\s\S]+?\)*\n+)?\t([\w$]+)\s*:\s*[ \w|&$?()[\]{}<>'"`:.]+?\s*(?:=|;$)/gm;

		let s;
		while ((s = propRgxp.exec(file))) {
			if (!s[1]) {
				obj.props[s[2]] = true;
			}
		}
	});

	$C(blocksTree).forEach((el, key, data) => {
		if (el.parent && data[el.parent]) {
			Object.setPrototypeOf(el.props, data[el.parent].props);
		}
	});

	const bind = {
		bind: [
			(o) => o.getVar('$attrs'),
			'typeof rootTag !== "undefined" ? rootTag : undefined'
		]
	};

	ss.importFilters({
		vueComp,
		vueTag: ss.setFilterParams(vueTag, bind),
		bem2vue: ss.setFilterParams(bem2vue, bind),
		b: ss.setFilterParams(b, {bind: ['__dirname']})
	});

	function b(url, cwd) {
		const
			hasMagic = glob.hasMagic(url),
			end = /\.e?ss$/.test(url) ? '' : '/',
			ends = [];

		if (end) {
			const
				basename = path.basename(url);

			if (!glob.hasMagic(basename)) {
				ends.push(`${basename}.ss`);
			}

			ends.push('main.ss', 'index.ss');
		}

		const urls = [
			blocks,
			findUp.sync('src', {cwd}),
			coreClient
		];

		for (let i = 0; i < urls.length; i++) {
			for (let j = 0; j < ends.length; j++) {
				const
					fullPath = path.join(urls[i], url, ends[j] || '');

				if (hasMagic ? glob.sync(fullPath).length : fs.existsSync(fullPath)) {
					return fullPath;
				}
			}
		}

		return url + end;
	}

	function vueComp({name, attrs}) {
		$C(attrs).forEach((el, key) => {
			if (!/^(:|@|v-)/.test(key)) {
				return;
			}

			const
				tmp = String.dasherize(key);

			if (tmp !== key) {
				delete attrs[key];
				attrs[tmp] = el;
			}
		});

		let
			isSync = attrs['v-sync'];

		const
			isAsync = attrs['v-async'],
			isAsyncBack = attrs['v-async-back'];

		if (attrs['v-for']) {
			if (/^\s*([\w$]+)(\s+(?:in|of)\s+.*)$/.test(attrs['v-for'].join(' '))) {
				attrs['v-for'] = [`(${RegExp.$1}, i)${RegExp.$2}`];
			}
		}

		delete attrs['v-sync'];
		delete attrs['v-async'];
		delete attrs['v-async-back'];

		$C(attrs).forEach((el, key) => {
			if (key.slice(0, 2) === ':-') {
				attrs[`:data-${key.slice(2)}`] = el;
				delete attrs[key];

			} else if (key === ':key') {
				const
					parts = el.join('').split(/\s*,\s*/),
					val = attrs[key] = parts.slice(-1);

				$C(parts.slice(0, -1)).forEach((key) => {
					if (key.slice(0, 2) === ':-') {
						attrs[`:data-${key.slice(2)}`] = val;

					} else {
						attrs[key] = val;
					}
				});
			}
		});

		if (name === 'component' || validators.blockName(name)) {
			let componentName;
			if (attrs[':instance-of']) {
				componentName = attrs[':instance-of'][0];
				delete attrs[':instance-of'];

			} else {
				componentName = name === 'component' ? 'iBlock' : String.camelize(name, false);
			}

			const
				c = blocksTree[componentName];

			if (!isAsync && !isAsyncBack && c && c.functional) {
				isSync = true;
			}

			$C(attrs).forEach((el, key) => {
				if (key[0] !== ':') {
					return;
				}

				const
					base = key.slice(1),
					prop = `${base}Prop`;

				if (c && !c.props[base] && c.props[prop]) {
					attrs[`:${String.dasherize(prop)}`] = el;
					delete attrs[key];
				}
			});

			if (!attrs[':mods-prop']) {
				attrs[':mods-prop'] = ['provideMods()'];
			}
		}

		if (!isSync && !attrs.ref && !attrs[':ref'] && (isAsync || isAsyncBack)) {
			const
				id = `'${uuid()}' + i`,
				p = isAsyncBack ? 'Back' : '',
				key = attrs['v-else'] ? 'v-else-if' : attrs['v-else-if'] ? 'v-else-if' : 'v-if';

			attrs[key] = attachVIf(
				(attrs[key] || []).concat(`async${p}Components[regAsync${p}Component(${id}, '${name}')]`),
				isAsyncBack ? '||' : '&&'
			);

			delete attrs['v-else'];
		}
	}

	function vueTag(tag, attrs, rootTag) {
		if (/^a:void$/.test(tag)) {
			attrs.href = ['javascript:void(0)'];
			tag = 'a';

		} else if (/^button:a$/.test(tag)) {
			attrs.type = ['button'];
			attrs.class = attachClass((attrs.class || []).concat('a'));
			tag = 'button';

		} else if (tag === '_') {
			tag = rootTag;
		}

		return tag;
	}

	function attachVIf(arr, op) {
		const
			join = arr.join;

		arr.join = function () {
			return join.call(this, op);
		};

		return arr;
	}

	function bem2vue(block, attrs, rootTag, val) {
		const
			tmp = attrs[':class'] = attrs[':class'] || [];

		if (!$C(tmp).includes('blockId')) {
			attrs[':class'] = attachClass(tmp.concat('blockId', `classes['${val.replace(/^_+/, '')}']`));
		}

		return block + val;
	}

	function attachClass(arr) {
		const
			join = arr.join;

		arr.join = function () {
			if (this.length < 2) {
				return join.call(this);
			}

			return `[${join.call(this, ',')}]`;
		};

		return arr;
	}
};
