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
	escaper = require('escaper');

const
	fs = require('fs'),
	path = require('upath'),
	glob = require('glob');

const
	{validators, resolve} = require('@pzlr/build-core');

module.exports = {};
const componentsTree = module.exports;

const
	resources = [resolve.blockSync(), ...resolve.dependencies],
	components = `/**/@(${validators.blockTypeList.join('|')})-*.@(ts|js)`,
	files = $C(resources).reduce((arr, el) => arr.concat(glob.sync(path.join(el, components))), []).reverse();

const
	componentRgxp = /@component\(([^@]*?)\)\n+\s*export\s+/,
	componentClassRgxp = /^\s*export\s+default\s+(?:abstract\s+)?class\s+(([\s\S]*?)\s+extends\s+[\s\S]*?)(?:\s+implements\s+[^{]*|\s*){/m,
	propsRgxp = /^(\t+)@prop\s*\([^@]+?\)+\n+\1([ \w$]+)(?:[?!]?:\s*[ \w|&$?()[\]{}<>'"`:.]+?)?\s*(?:=|;$)/gm;

const
	genericRgxp = /<.*|\s.*/g,
	extendsRgxp = /\s+extends\s+/;

$C(files).forEach((el) => {
	const
		file = escaper.replace(fs.readFileSync(el, {encoding: 'utf-8'})),
		componentClass = componentClassRgxp.exec(file);

	const
		p = ((v) => v && new Function(`return ${escaper.paste(v[1]) || '{}'}`)())(componentClass && componentRgxp.exec(file));

	if (!p) {
		return;
	}

	const
		component = componentClass[2].replace(genericRgxp, ''),
		parent = componentClass[1].split(extendsRgxp).slice(-1)[0].replace(genericRgxp, '');

	const obj = componentsTree[component] = componentsTree[component] || {
		props: {},
		parent
	};

	obj.model = p.model;
	obj.deprecatedProps = p.deprecatedProps || {};

	if (p.functional != null) {
		obj.functional = p.functional;
	}

	if (p.inheritMods != null) {
		obj.inheritMods = p.inheritMods;
	}

	let s;
	while ((s = propsRgxp.exec(file))) {
		obj.props[s[2].split(' ').slice(-1)[0]] = true;
	}
});

function getInheritParameters(obj) {
	if (!obj || !obj.parent) {
		return {};
	}

	const fields = [
		['model'],
		['deprecatedProps'],
		['functional', false]
	];

	const
		res = {},
		parent = getInheritParameters(componentsTree[obj.parent]);

	for (let i = 0; i < fields.length; i++) {
		const
			[key, def] = fields[i];

		const
			val = obj[key],
			isObj = Object.isObject(val);

		if (val === undefined || isObj) {
			const
				parentVal = parent[key];

			if (Object.isObject(parentVal)) {
				res[key] = {...parentVal, ...val};
				continue;
			}

			if (isObj) {
				res[key] = val;
				continue;
			}

			res[key] = parentVal !== undefined ? parentVal : def;
			continue;
		}

		res[key] = val;
	}

	return res;
}

$C(componentsTree).forEach((el, key, data) => {
	Object.assign(el, getInheritParameters(el));

	const
		parent = el.parent && data[el.parent];

	if (parent) {
		Object.setPrototypeOf(el, parent);
		Object.setPrototypeOf(el.props, parent.props);
	}
});
