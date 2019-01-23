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

const componentsTree = module.exports = {
	getComponentPropAttrs(name) {
		name = name.camelize(false);

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
	componentClassRgxp = /^\s*export\s+default\s+class\s+(([\s\S]*?)\s+extends\s+[\s\S]*?)\s*{/m,
	componentRgxp = /@component\(([^@]*?)\)\n+\s*export\s+/,
	propsRgxp = /^(\t+)@prop\s*\([^@]+?\)+\n+\1([ \w$]+)(?:\??: [ \w|&$?()[\]{}<>'"`:.]+?)?\s*(?:=|;$)/gm;

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

function getFunctionalParameters(obj) {
	if (!obj) {
		return false;
	}

	const
		v = obj.functional,
		isObj = Object.isObject(v);

	if (obj.parent && (v === undefined || isObj)) {
		const
			p = getFunctionalParameters(componentsTree[obj.parent]);

		if (Object.isObject(p)) {
			return {...p, ...v};
		}

		if (isObj) {
			return v;
		}

		return p;
	}

	return v || false;
}

$C(componentsTree).forEach((el, key, data) => {
	data[key].functional = getFunctionalParameters(el);

	const
		p = el.parent && data[el.parent];

	if (p) {
		Object.setPrototypeOf(el, p);
		Object.setPrototypeOf(el.props, p.props);
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

	if (name === 'component' || validators.blockName(name)) {
		let
			componentName;

		if (attrs[':instance-of']) {
			componentName = attrs[':instance-of'][0];
			delete attrs[':instance-of'];

		} else {
			componentName = name === 'component' ? 'iBlock' : name.camelize(false);
		}

		const
			c = componentsTree[componentName],
			smart = [attrs['v-func-placeholder'], delete attrs['v-func-placeholder']][0] && c && c.functional,
			vFunc = [attrs['v-func'], delete attrs['v-func']][0];

		const isFunctional = c && c.functional === true || !vFunc && $C(smart).every((el, key) => {
			key = key.dasherize();

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
				base = key.slice(1).camelize(false),
				prop = `${base}Prop`;

			if (c && !c.props[base] && c.props[prop]) {
				attrs[`:${prop.dasherize()}`] = el;
				delete attrs[key];
			}
		});

		if (c && c.inheritMods !== false && !attrs[':mods-prop']) {
			attrs[':mods-prop'] = ['provideMods()'];
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
			(attrs[key] || []).concat(`async${p}Components[regAsync${p}Component(${id})]`),
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
		nm = tag.camelize(false),
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
