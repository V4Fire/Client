/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	$C = require('collection.js'),
	Snakeskin = require('snakeskin'),
	hasha = require('hasha');

const
	{webpack} = require('@config/config'),
	{validators} = require('@pzlr/build-core'),
	{isV4Prop} = include('build/snakeskin/filters/const');

const
	componentParams = include('build/graph/component-params');

const
	tagFilters = include('build/snakeskin/filters/tag'),
	tagNameFilters = include('build/snakeskin/filters/tag-name'),
	bemFilters = include('build/snakeskin/filters/bem');

const
	TYPE_OF = Symbol('Type of component to create'),
	SMART_PROPS = Symbol('Smart component props');

const tagBind = {
	bind: [
		(o) => o.getVar('$attrs'),
		'typeof rootTag !== "undefined" ? rootTag : undefined'
	]
};

const tagNameBind = {
	bind: [
		...tagBind.bind,
		'typeof renderSSRAsString !== "undefined" ? renderSSRAsString : undefined'
	]
};

Snakeskin.importFilters({
	tagFilter: Snakeskin.setFilterParams(tagFilter, {bind: ['TPL_NAME', '$i++']}),
	tagNameFilter: Snakeskin.setFilterParams(tagNameFilter, tagNameBind),
	bemFilter: Snakeskin.setFilterParams(bemFilter, tagBind),
	line: Snakeskin.setFilterParams((_, line) => line, {bind: [(o) => o.i]})
});

function tagFilter({name, attrs = {}}, tplName, cursor) {
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

	if (attrs['v-tag']) {
		delete attrs['v-tag'];
		return;
	}

	if (!attrs[':componentIdProp']) {
		const id = hasha(JSON.stringify([
			cursor,
			componentName,
			tplName.replace(/\d{4,}$/, '_')
		])).slice(0, 6);

		attrs[':componentIdProp'] = [`componentId + ${JSON.stringify(id)}`];
	}

	attrs[':getRoot'] = ['$getRoot(self)'];
	attrs[':getParent'] = ["$getParent(self, typeof $restArgs !== 'undefined' ? $restArgs : undefined)"];

	if (component.inheritMods !== false && !attrs[':modsProp']) {
		attrs[':modsProp'] = ['sharedMods'];
	}

	const funcDir = attrs['v-func']?.[0];
	delete attrs['v-func'];

	let
		isFunctional = false;

	if (component && component.functional === true) {
		isFunctional = true;

	} else if (!funcDir && attrs[SMART_PROPS] != null) {
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

	if (isFunctional && webpack.ssr) {
		attrs[':renderComponentId'] = [false];
	}

	if (isSmartFunctional) {
		if (funcDir == null || funcDir === 'true') {
			if (webpack.ssr) {
				attrs[':renderComponentId'] = [false];

			} else {
				attrs['is'] = [`${attrs['is'][0]}-functional`];
			}

		} else if (funcDir !== 'false') {
			if (webpack.ssr) {
				attrs[':renderComponentId'] = [!funcDir];

			} else {
				attrs[':is'] = [`'${attrs['is'][0]}' + (${funcDir} ? '-functional' : '')`];
				delete attrs['is'];
			}
		}
	}
}

function tagNameFilter(tag, attrs, rootTag, renderSSRAsString) {
	attrs ??= {};

	tag = $C(tagNameFilters)
		.to(tag)
		.reduce((tag, filter) => filter(tag, attrs, rootTag, renderSSRAsString));

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
