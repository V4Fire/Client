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
		!attrs[':instance-of'] &&
		!validators.blockName(name);

	if (isSimpleTag) {
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
		smartProps = attrs[SMART_PROPS];

	const funcDir = attrs['v-func']?.[0];
	delete attrs['v-func'];

	let
		isFunctional = false;

	if (component && component.functional === true) {
		isFunctional = true;

	} else if (!funcDir) {
		isFunctional = $C(smartProps).every((propVal, prop) => {
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
				if (!Object.isArray(propVal[0])) {
					return $C(propVal).includes(attr);
				}

				return Object.fastCompare(propVal[0], attr);
			}

			if (Object.isRegExp(propVal)) {
				return propVal.test(attr);
			}

			if (Object.isFunction(propVal)) {
				return propVal(attr);
			}

			return Object.fastCompare(propVal, attr);
		});
	}

	const
		isSmartFunctional = smartProps && (isFunctional || funcDir);

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

		attrs[':instance-of'] = [componentName];
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
