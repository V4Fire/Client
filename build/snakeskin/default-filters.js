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

const
	TYPE_OF = Symbol('A type of the component to create'),
	SMART_PROPS = Symbol('The component smart props');

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
	Object.forEach(tagFilters, (filter) => filter({name, attrs}));

	const isSimpleTag =
		name !== 'component' &&
		!attrs[TYPE_OF] &&
		!validators.blockName(name);

	if (isSimpleTag) {
		return;
	}

	let
		componentName;

	if (attrs[TYPE_OF]) {
		componentName = attrs[TYPE_OF];

	} else {
		componentName = name === 'component' ? 'iBlock' : name.camelize(false);
	}

	const
		component = componentParams[componentName];

	if (!component) {
		return;
	}

	if (component.inheritMods !== false && !attrs[':mods-prop']) {
		attrs[':mods-prop'] = ['shareableMods'];
	}

	const funcDir = attrs['v-func']?.[0];
	delete attrs['v-func'];

	let
		isFunctional = false;

	if (component && component.functional === true) {
		isFunctional = true;

	} else if (!funcDir) {
		isFunctional = $C(attrs[SMART_PROPS]).every((propVal, prop) => {
			prop = prop.dasherize(true);

			if (!isV4Prop.test(prop)) {
				prop = `:${prop}`;
			}

			let
				attr = attrs[prop]?.[0];

			try {
				// eslint-disable-next-line no-new-func
				attr = Function(`return ${attr}`)();

			} catch {}

			if (Object.isArray(propVal)) {
				return $C(propVal).some((propVal) => Object.fastCompare(propVal, attr));
			}

			return Object.fastCompare(propVal, attr);
		});
	}

	const
		isSmartFunctional = attrs[SMART_PROPS] && (isFunctional || funcDir);

	if (isSmartFunctional) {
		if (funcDir == null || funcDir === 'true') {
			attrs['is'] = [`${attrs['is'][0]}-functional`];

		} else if (funcDir !== 'false') {
			attrs[':is'] = [`'${attrs['is'][0]}' + (${funcDir} ? '-functional' : '')`];
			delete attrs['is'];
		}
	}
}

function tagNameFilter(tag, attrs, rootTag) {
	attrs ??= {};

	tag = $C(tagNameFilters)
		.to(tag)
		.reduce((tag, filter) => filter(tag, attrs, rootTag));

	const
		componentName = tag.camelize(false),
		component = componentParams[componentName];

	const isSmartComponent =
		component != null &&
		!Object.isBoolean(component.functional);

	if (isSmartComponent) {
		attrs.is = [tag];

		attrs[TYPE_OF] = componentName.camelize(false);
		attrs[SMART_PROPS] = component.functional;

		return 'component';
	}

	return tag;
}

function bemFilter(block, attrs, rootTag, value) {
	attrs ??= {};

	return $C(bemFilters)
		.to('')
		.reduce((res, filter) => res + filter(block, attrs, rootTag, value));
}
