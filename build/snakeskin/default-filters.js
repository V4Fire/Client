/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	Snakeskin = require('snakeskin'),
	hasha = require('hasha');

const
	{webpack} = require('@config/config'),
	{validators} = require('@pzlr/build-core'),
	{isV4Prop, isStaticV4Prop} = include('build/snakeskin/filters/const');

const
	componentParams = include('build/graph/component-params');

const
	tagFilters = include('build/snakeskin/filters/tag'),
	tagNameFilters = include('build/snakeskin/filters/tag-name'),
	bemFilters = include('build/snakeskin/filters/bem');

const
	TYPE_OF = Symbol('Type of component to create'),
	SMART_PROPS = Symbol('Smart component props');

const bind = {
	bind: [
		(o) => o.getVar('$attrs'),
		'typeof rootTag !== "undefined" ? rootTag : undefined'
	]
};

Snakeskin.importFilters({
	tagFilter: Snakeskin.setFilterParams(tagFilter, {bind: ['TPL_NAME', '$i++']}),
	tagNameFilter: Snakeskin.setFilterParams(tagNameFilter, bind),
	bemFilter: Snakeskin.setFilterParams(bemFilter, bind),
	line: Snakeskin.setFilterParams((_, line) => line, {bind: [(o) => o.i]})
});

function tagFilter({name, attrs = {}}, tplName, cursor) {
	let componentName;

	if (attrs[TYPE_OF]) {
		componentName = attrs[TYPE_OF];

	} else {
		componentName = name === 'component' ? 'iBlock' : name.camelize(false);
	}

	const component = componentParams[componentName];

	const isSimpleTag =
		name !== 'component' &&
		!attrs[TYPE_OF] &&
		!validators.blockName(name);

	const vFuncDir = attrs['v-func']?.[0];
	delete attrs['v-func'];

	Object.entries(attrs).forEach(([key, attr]) => {
		if (isStaticV4Prop.test(key)) {
			// Since HTML is not case-sensitive, the name can be written differently.
			// We will explicitly normalize the name to the most popular format for HTML notation.
			const tmp = key.dasherize(key.startsWith(':'));

			if (tmp !== key) {
				delete attrs[key];
				attrs[tmp] = attr;
			}
		}
	});

	let isFunctional = false;

	if (component) {
		if (component && component.functional === true) {
			isFunctional = true;

		} else if (!vFuncDir && attrs[SMART_PROPS] != null) {
			isFunctional = Object.entries(attrs[SMART_PROPS]).every(([propName, propVal]) => {
				propName = propName.dasherize(true);

				if (!isV4Prop.test(propName)) {
					propName = `:${propName}`;
				}

				let attr = attrs[propName]?.[0];

				try {
					// eslint-disable-next-line no-new-func
					attr = Function(`return ${attr}`)();

				} catch {}

				if (Object.isArray(propVal)) {
					return propVal.some((propVal) => Object.fastCompare(propVal, attr));
				}

				return Object.fastCompare(propVal, attr);
			});
		}
	}

	const isSmartFunctional =
		attrs[SMART_PROPS] &&
		(isFunctional || vFuncDir);

	Object.forEach(tagFilters, (filter) => filter({
		name,
		attrs,
		component,
		isSimpleTag,
		isFunctional,
		isSmartFunctional,
		vFuncDir
	}));

	if (isSimpleTag || !component) {
		return;
	}

	if (attrs['v-tag']) {
		delete attrs['v-tag'];
	}

	if (!attrs[':componentIdProp']) {
		const id = hasha(JSON.stringify([
			cursor,
			componentName,
			tplName.replace(/\d{4,}$/, '_')
		])).slice(0, 6);

		attrs[':componentIdProp'] = [`componentId + ${JSON.stringify(id)}`];
	}

	Object.entries(attrs).forEach(([name, val]) => {
		if (!name.startsWith(':')) {
			return;
		}

		let propName = name.slice(1).camelize(false);

		if (component.props[`${propName}Prop`]) {
			propName = `${propName}Prop`;
		}

		if (component.props[propName]?.forceUpdate === false) {
			attrs[`@:${propName}`] = [`createPropAccessors(() => (${val.join('')}))()`];
		}
	});

	attrs[':getRoot'] = ['$getRoot(self)'];
	attrs[':getParent'] = ["$getParent(self, typeof $restArgs !== 'undefined' ? $restArgs : undefined)"];

	if (component.inheritMods !== false && !attrs[':modsProp']) {
		attrs[':modsProp'] = ['sharedMods'];
	}

	if (isFunctional && webpack.ssr) {
		attrs[':renderComponentId'] = [false];
	}

	if (isSmartFunctional) {
		if (vFuncDir == null || vFuncDir === 'true') {
			if (webpack.ssr) {
				attrs[':renderComponentId'] = [false];

			} else {
				attrs['is'] = [`${attrs['is'][0]}-functional`];
			}

		} else if (vFuncDir !== 'false') {
			if (webpack.ssr) {
				attrs[':renderComponentId'] = [!vFuncDir];

			} else {
				attrs[':is'] = [`'${attrs['is'][0]}' + (${vFuncDir} ? '-functional' : '')`];
				delete attrs['is'];
			}
		}
	}
}

function tagNameFilter(tag, attrs, rootTag) {
	attrs ??= {};
	tag = tagNameFilters.reduce((tag, filter) => filter(tag, attrs, rootTag), tag);

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
	return bemFilters.reduce((res, filter) => res + filter(block, attrs, rootTag, value), '');
}
