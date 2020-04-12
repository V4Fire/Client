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
	Snakeskin = require('snakeskin');

const
	dasherize = require('string-dasherize'),
	camelize = require('camelize');

const
	{validators} = require('@pzlr/build-core');

const
	componentsTree = include('build/snakeskin/components-tree'),
	tagFilters = include('build/snakeskin/filters/tag'),
	tagNameFilters = include('build/snakeskin/filters/tag-name'),
	bemFilters = include('build/snakeskin/filters/bem');

const
	isV4Prop = /^(:|@|v-)/;

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

function tagFilter({name, attrs = {}}) {
	$C(tagFilters).forEach((filter) => {
		filter({name, attrs});
	});

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

			} catch {}

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
		}

		$C(attrs).forEach((el, key) => {
			if (key[0] !== ':') {
				return;
			}

			const
				basePropName = camelize(key.slice(1)),
				directPropName = `${basePropName}Prop`;

			let
				resolvedPropName = basePropName,
				alternative = component.deprecatedProps[resolvedPropName];

			if (!props[basePropName] && props[directPropName]) {
				resolvedPropName = directPropName;
				alternative = component.deprecatedProps[resolvedPropName];

				if (!alternative) {
					attrs[`:${dasherize(directPropName)}`] = el;
				}

				delete attrs[key];
			}

			if (alternative) {
				attrs[`:${dasherize(alternative)}`] = el;
			}
		});

		if (component && component.inheritMods !== false && !attrs[':mods-prop']) {
			attrs[':mods-prop'] = ['provide.mods()'];
		}
	}
}

function tagNameFilter(tag, attrs = {}, rootTag) {
	tag = $C(tagNameFilters)
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
	return $C(bemFilters).to('').reduce((res, filter) => res + filter(block, attrs, rootTag, value));
}
