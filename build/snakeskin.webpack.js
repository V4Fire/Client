'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

include('build/filters');

const
	$C = require('collection.js'),
	Snakeskin = require('snakeskin'),
	escaper = require('escaper');

const
	dasherize = require('string-dasherize'),
	camelize = require('camelize');

const componentsTree = module.exports = {
	getComponentPropAttrs(name) {
		name = camelize(name);

		if (!this[name]) {
			throw new Error(`The specified component "${name}" is not defined`);
		}

		return $C(this[name].props)
			.object(true)
			.to({})
			.reduce((map, el, key) => (map[`:${key}`] = key, map));
	}
};

const
	fs = require('fs'),
	path = require('upath'),
	glob = require('glob');

const
	{validators, resolve} = require('@pzlr/build-core'),
	{attachVIf} = include('build/filters/helpers');

const
	resources = [resolve.blockSync(), ...resolve.dependencies],
	components = `/**/@(${validators.blockTypeList.join('|')})-*.@(ts|js)`,
	files = $C(resources).reduce((arr, el) => arr.concat(glob.sync(path.join(el, components))), []).reverse();

const
	componentRgxp = /@component\(([^@]*?)\)\n+\s*export\s+/,
	componentClassRgxp = /^\s*export\s+default\s+(?:abstract\s+)?class\s+(([\s\S]*?)\s+extends\s+[\s\S]*?)(?:\s+implements\s+|\s*)?[\s\S]*?\{/m,
	propsRgxp = /^(\t+)@prop\s*\([^@]+?\)+\n+\1([ \w$]+)(?:[\?!]?:\s*[ \w|&$?()\[\]{}<>'"`:.]+?)?\s*(?:=|;$)/gm;

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
		['functional', false],
		['model']
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

const bind = {
	bind: [
		(o) => o.getVar('$attrs'),
		'typeof rootTag !== "undefined" ? rootTag : undefined'
	]
};

Snakeskin.importFilters({
	tagFilter,
	tagNameFilter: Snakeskin.setFilterParams(tagNameFilter, bind),
	bemFilter: Snakeskin.setFilterParams(bemFilter, bind)
});

const
	isV4Prop = /^(:|@|v-)/;

function tagFilter({name, attrs = {}}) {
	$C(include('build/filters/tag')).forEach((filter) => {
		filter({name, attrs});
	});

	let
		isSync = attrs['v-sync'];

	const
		asyncVal = attrs['v-async'],
		asyncBackVal = attrs['v-async-back'],
		asyncCounter = attrs['v-async-counter'];

	delete attrs['v-sync'];
	delete attrs['v-async'];
	delete attrs['v-async-back'];
	delete attrs['v-async-counter'];

	if (name === 'component' || attrs[':instance-of'] || validators.blockName(name)) {
		let
			componentName;

		if (attrs[':instance-of']) {
			componentName = camelize(attrs[':instance-of'][0]);
			delete attrs[':instance-of'];

		} else {
			componentName = name === 'component' ? 'iBlock' : camelize(name);
		}

		const
			component = componentsTree[componentName],
			props = component ? component.props : Object.create(null);

		const
			smart = [attrs['v-func-placeholder'], delete attrs['v-func-placeholder']][0] && component && component.functional,
			vFunc = [attrs['v-func'], delete attrs['v-func']][0];

		const isFunctional = component && component.functional === true || !vFunc && $C(smart).every((el, key) => {
			key = dasherize(key);

			if (!isV4Prop.test(key)) {
				key = `:${key}`;
			}

			let
				attr = attrs[key] && attrs[key][0];

			try {
				attr = new Function(`return ${attr}`)();

			} catch (_) {}

			if (Object.isArray(el)) {
				if (!Object.isArray(el[0])) {
					return $C(el).includes(attr);
				}

				return Object.isEqual(el[0], attr);
			}

			if (Object.isRegExp(el)) {
				return el.test(attr);
			}

			if (Object.isFunction(el)) {
				return el(attr);
			}

			return Object.isEqual(el, attr);
		});

		if (isFunctional || vFunc) {
			const
				model = attrs['v-model'];

			if (component && model) {
				const
					modelInfo = component.model;

				if (modelInfo) {
					attrs[`:${dasherize(modelInfo.prop)}`] = model;
					attrs[`@${modelInfo.event.dasherize()}`] = [`${model[0]}=$event`];
					delete attrs['v-model'];
				}
			}

			if (smart) {
				if (vFunc) {
					attrs[':is'] = [`'${attrs['is'][0]}' + (${vFunc[0]} ? '-functional' : '')`];
					delete attrs['is'];

				} else {
					attrs['is'] = [`${attrs['is'][0]}-functional`];
				}
			}

			if (!asyncVal && !asyncBackVal) {
				isSync = true;
			}
		}

		$C(attrs).forEach((el, key) => {
			if (key[0] !== ':') {
				return;
			}

			const
				base = camelize(key.slice(1)),
				prop = `${base}Prop`;

			if (!props[base] && props[prop]) {
				attrs[`:${dasherize(prop)}`] = el;
				delete attrs[key];
			}
		});

		if (component && component.inheritMods !== false && !attrs[':mods-prop']) {
			attrs[':mods-prop'] = ['provide.mods()'];
		}
	}

	if (!isSync && !attrs.ref && !attrs[':ref'] && (asyncVal || asyncBackVal)) {
		const
			uid = Math.random(),
			selfId = asyncVal ? asyncVal[0] : asyncBackVal[0],
			id = selfId !== true ? selfId : asyncCounter ? `'${uid}' + ${asyncCounter[0]}` : `'${uid}'`;

		const
			p = asyncBackVal ? 'Back' : '',
			key = attrs['v-else'] ? 'v-else-if' : attrs['v-else-if'] ? 'v-else-if' : 'v-if';

		attrs[key] = attachVIf(
			(attrs[key] || []).concat(`async${p}Components[async.reg${p}Component(${id})]`),
			asyncBackVal ? '||' : '&&'
		);

		delete attrs['v-else'];
	}
}

function tagNameFilter(tag, attrs = {}, rootTag) {
	tag = $C(include('build/filters/tag-name'))
		.to('')
		.reduce((res, filter) => res + filter(tag, attrs, rootTag));

	const
		nm = camelize(tag),
		component = componentsTree[nm];

	if (component && !Object.isBoolean(component.functional)) {
		Object.assign(attrs, {
			':instance-of': [nm],
			'v-func-placeholder': [true],
			'is': [tag]
		});

		return 'component';
	}

	return tag;
}

function bemFilter(block, attrs = {}, rootTag, value) {
	return $C(include('build/filters/bem')).to('').reduce((res, filter) => res + filter(block, attrs, rootTag, value));
}
