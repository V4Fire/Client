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
	Snakeskin = require('snakeskin');

const
	fs = require('fs'),
	path = require('upath'),
	glob = require('glob');

const
	{validators, resolve} = require('@pzlr/build-core'),
	{attachVIf} = include('build/filters/helpers');

const
	resources = [resolve.blockSync(), ...resolve.dependencies],
	components = `/**/@(${validators.blockTypeList.join('|')})-*.@(ts|js)`;

const
	files = $C(resources).reduce((arr, el) => arr.concat(glob.sync(path.join(el, components))), []).reverse(),
	blocksTree = {};

const
	blockClassRgxp = /^\s*export\s+default\s+class\s+((.*?)\s+extends\s+.*?)\s*{/m,
	componentRgxp = /@component\(([\s\S]*?)\)\n+\s*export\s+/,
	propsRgxp = /^(\t+)@prop\s*\([\s\S]+?\)+\n+\1([ \w$]+)(?:\??: [ \w|&$?()[\]{}<>'"`:.]+?)?\s*(?:=|;$)/gm;

const
	genericRgxp = /<.*/,
	extendsRgxp = /\s+extends\s+/;

$C(files).forEach((el) => {
	const
		file = fs.readFileSync(el, {encoding: 'utf-8'}),
		block = blockClassRgxp.exec(file);

	const
		p = ((v) => v && new Function(`return ${v[1] || '{}'}`)())(block && componentRgxp.exec(file));

	if (!p) {
		return;
	}

	const
		component = block[2].replace(genericRgxp, ''),
		parent = block[1].split(extendsRgxp).slice(-1)[0].replace(genericRgxp, '');

	const obj = blocksTree[component] = blocksTree[component] || {
		props: {},
		parent
	};

	if (p.functional != null) {
		obj.functional = p.functional;
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
			p = getFunctionalParameters(blocksTree[obj.parent]);

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

$C(blocksTree).forEach((el, key, data) => {
	data[key].functional = getFunctionalParameters(el);

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

Snakeskin.importFilters({
	tagFilter,
	tagNameFilter: Snakeskin.setFilterParams(tagNameFilter, bind),
	bemFilter: Snakeskin.setFilterParams(bemFilter, bind)
});

const
	isVueProp = /^(:|@|v-)/;

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
			c = blocksTree[componentName],
			smart = [attrs['v-func-placeholder'], delete attrs['v-func-placeholder']][0] && c && c.functional,
			vFunc = [attrs['v-func'], delete attrs['v-func']][0];

		const isFunctional = c && c.functional === true || !vFunc && $C(smart).every((el, key) => {
			key = key.dasherize();

			if (!isVueProp.test(key)) {
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
				base = key.slice(1),
				prop = `${base}Prop`;

			if (c && !c.props[base] && c.props[prop]) {
				attrs[`:${prop.dasherize()}`] = el;
				delete attrs[key];
			}
		});

		if (!attrs[':mods-prop']) {
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
	tag = $C(include('build/filters/tagName'))
		.to('')
		.reduce((res, filter) => res + filter(tag, attrs, rootTag));

	const
		nm = tag.camelize(false),
		component = blocksTree[nm];

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
