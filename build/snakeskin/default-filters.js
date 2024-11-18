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

const bemBind = {
	bind: [
		(o) => o.getVar('$attrs'),
		'typeof rootTag !== "undefined" ? rootTag : undefined'
	]
};

const tagNameBind = {
	bind: [
		...bemBind.bind,
		'typeof forceRenderAsVNode !== "undefined" ? forceRenderAsVNode : undefined'
	]
};

const tagBind = {
	bind: [
		...tagNameBind.bind,
		'TPL_NAME',
		'$i++'
	]
};

Snakeskin.importFilters({
	tagFilter: Snakeskin.setFilterParams(tagFilter, tagBind),
	tagNameFilter: Snakeskin.setFilterParams(tagNameFilter, tagNameBind),
	bemFilter: Snakeskin.setFilterParams(bemFilter, bemBind),
	line: Snakeskin.setFilterParams((_, line) => line, {bind: [(o) => o.i]})
});

function tagFilter({name: tag, attrs = {}}, _, rootTag, forceRenderAsVNode, tplName, cursor) {
	Object.entries(attrs).forEach(([key, attr]) => {
		if (isStaticV4Prop.test(key)) {
			// Do not change any attrs name for web components
			if (isWebComponent.test(tag)) {
				return;
			}

			// Since HTML is not case-sensitive, the name can be written differently.
			// We will explicitly normalize the name to the most popular format for HTML notation.
			const tmp = key.dasherize(key.startsWith(':'));

			if (tmp !== key) {
				delete attrs[key];
				attrs[tmp] = attr;
			}
		}
	});

	let componentName;

	if (attrs[TYPE_OF]) {
		componentName = attrs[TYPE_OF];

	} else if (tag === 'component') {
		if (attrs[':instance-of']) {
			componentName = attrs[':instance-of'][0].camelize(false);
			delete attrs[':instance-of'];

		} else {
			componentName = 'iBlock';
		}

	} else {
		componentName = tag.camelize(false);
	}

	const component = componentParams[componentName];

	if (isSmartComponent(component)) {
		attrs[SMART_PROPS] = component.functional;
	}

	const isSimpleTag =
		tag !== 'component' &&
		!attrs[TYPE_OF] &&
		!validators.blockName(tag);

	const vFuncDir = attrs['v-func']?.[0];
	delete attrs['v-func'];

	let isFunctional = false;

	if (component) {
		if (component.functional === true) {
			isFunctional = true;

		} else if (!vFuncDir && attrs[SMART_PROPS] != null) {
			isFunctional = Object.entries(attrs[SMART_PROPS]).every(([propName, propVal]) => {
				propName = propName.dasherize(true);

				// In the component descriptor @component for smart components,
				// props can be specified that make the component functional when set to certain values.
				// However, since the contract requires all component props to start with ":",
				// we explicitly add this prefix to the name and check for its presence in the attributes.
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
		tplName,
		forceRenderAsVNode,

		tag,
		rootTag,
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

	if (component.inheritMods !== false && !attrs[':mods'] && !attrs[':modsProp']) {
		attrs[':mods'] = ['provide.mods()'];
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
			attrs['data-has-v-on-directives'] = [];
		}
	});

	attrs[':getRoot'] = ['$getRoot(self)'];
	attrs[':getParent'] = ["$getParent(self, typeof $restArgs !== 'undefined' ? $restArgs : undefined)"];

	if (isFunctional && webpack.ssr) {
		attrs[':canFunctional'] = [true];
	}

	if (isSmartFunctional) {
		if (vFuncDir == null || vFuncDir === 'true') {
			appendSmartFunctionalAttrs(attrs, true);

		} else if (vFuncDir !== 'false') {
			appendSmartFunctionalAttrs(attrs, vFuncDir, false);
		}
	}
}

function appendSmartFunctionalAttrs(attrs, condition, isStaticCondition = true) {
	if (webpack.ssr) {
		attrs[':canFunctional'] = [condition];
		return;
	}

	if (attrs[':is']) {
		attrs[':is'] = [`${attrs[':is'][0]} + (${condition} ? '-functional' : '')`];

	} else if (!isStaticCondition) {
		attrs[':is'] = [`'${attrs['is'][0]}' + (${condition} ? '-functional' : '')`];
		delete attrs['is'];

	} else if (attrs['is']) {
		attrs['is'] = [`${attrs['is'][0]}${condition ? '-functional' : ''}`];
	}
}

function tagNameFilter(tag, attrs, rootTag, forceRenderAsVNode) {
	attrs ??= {};
	tag = tagNameFilters.reduce((tag, filter) => filter({tag, attrs, rootTag, forceRenderAsVNode}), tag);

	const
		componentName = tag.camelize(false),
		component = componentParams[componentName];

	if (isSmartComponent(component)) {
		attrs.is = [tag];

		attrs[TYPE_OF] = componentName.camelize(false);

		return 'component';
	}

	return tag;
}

function bemFilter(block, attrs, rootTag, value) {
	attrs ??= {};
	return bemFilters.reduce((res, filter) => res + filter(block, attrs, rootTag, value), '');
}

function isSmartComponent(component) {
	return component != null && !Object.isBoolean(component.functional);
}
