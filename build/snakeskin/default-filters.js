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
	{validators} = require('@pzlr/build-core'),
	{isV4Prop} = include('build/snakeskin/filters/const');

const
	componentParams = include('build/graph/component-params');

const
	tagFilters = include('build/snakeskin/filters/tag'),
	tagNameFilters = include('build/snakeskin/filters/tag-name'),
	bemFilters = include('build/snakeskin/filters/bem');

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

	if (name !== 'component' && !attrs[':instance-of'] && !validators.blockName(name)) {
		return;
	}

	let
		componentName;

	if (attrs[':instance-of']) {
		componentName = attrs[':instance-of'][0].camelize(false);
		delete attrs[':instance-of'];

	} else {
		componentName = name === 'component' ? 'iBlock' : name.camelize(false);
	}

	const
		component = componentParams[componentName],
		props = component ? component.props : Object.create(null);

	const
		smartProps = [attrs['v-func-placeholder'], delete attrs['v-func-placeholder']][0] && component && component.functional,
		funcMode = [attrs['v-func'], delete attrs['v-func']][0];

	let
		isFunctional = false;

	if (component && component.functional === true) {
		isFunctional = true;

	} else if (!funcMode) {
		isFunctional = $C(smartProps).every((el, key) => {
			key = key.dasherize(true);

			if (!isV4Prop.test(key)) {
				key = `:${key}`;
			}

			let
				attr = attrs[key] && attrs[key][0];

			try {
				// eslint-disable-next-line no-new-func
				attr = Function(`return ${attr}`)();

			} catch {}

			if (Object.isArray(el)) {
				if (!Object.isArray(el[0])) {
					return $C(el).includes(attr);
				}

				return Object.fastCompare(el[0], attr);
			}

			if (Object.isRegExp(el)) {
				return el.test(attr);
			}

			if (Object.isFunction(el)) {
				return el(attr);
			}

			return Object.fastCompare(el, attr);
		});
	}

	if ((isFunctional || funcMode) && smartProps) {
		if (funcMode) {
			attrs[':is'] = [`'${attrs['is'][0]}' + (${funcMode[0]} ? '-functional' : '')`];
			delete attrs['is'];

		} else {
			attrs['is'] = [`${attrs['is'][0]}-functional`];
		}
	}

	if (component) {
		$C(attrs).forEach((el, key) => {
			if (key[0] !== ':') {
				return;
			}

			const
				basePropName = key.slice(1).camelize(false),
				directPropName = `${basePropName}Prop`;

			let
				resolvedPropName = basePropName,
				alternative = component.deprecatedProps[resolvedPropName];

			if (!props[basePropName] && props[directPropName]) {
				resolvedPropName = directPropName;
				alternative = component.deprecatedProps[resolvedPropName];

				if (!alternative) {
					attrs[`:${directPropName.dasherize(true)}`] = el;
				}

				delete attrs[key];
			}

			if (alternative) {
				attrs[`:${alternative.dasherize(true)}`] = el;
				delete attrs[key];
			}
		});

		if (component.inheritMods !== false && !attrs[':mods-prop']) {
			attrs[':mods-prop'] = ['provide.mods()'];
		}
	}
}

// eslint-disable-next-line default-param-last
function tagNameFilter(tag, attrs = {}, rootTag) {
	tag = $C(tagNameFilters)
		.to(tag)
		.reduce((tag, filter) => filter(tag, attrs, rootTag));

	const
		nm = tag.camelize(false),
		component = componentParams[nm];

	if (component != null && !Object.isBoolean(component.functional)) {
		Object.assign(attrs, {
			':instance-of': [nm],
			'v-func-placeholder': [true],
			is: [tag]
		});

		return 'component';
	}

	return tag;
}

// eslint-disable-next-line default-param-last
function bemFilter(block, attrs = {}, rootTag, value) {
	return $C(bemFilters)
		.to('')
		.reduce((res, filter) => res + filter(block, attrs, rootTag, value));
}
