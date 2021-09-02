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
	escaper = require('escaper'),
	camelize = require('camelize'),
	fs = require('fs');

const {
	componentRgxp,
	componentClassRgxp,
	propRgxp,
	genericRgxp,
	extendsRgxp,
	componentFiles
} = include('build/snakeskin/const');

const
	componentsMap = module.exports;

Object.assign(componentsMap, {
	getParentParameters,

	/**
	 * Returns a map of component prop attributes
	 *
	 * @param name - component name
	 * @returns {!Object}
	 *
	 * @example
	 * ```js
	 * getComponentPropAttrs('b-foo') // {':bla': 'bla'}
	 * ```
	 */
	getComponentPropAttrs(name) {
		name = camelize(name);

		if (!this[name]) {
			throw new ReferenceError(`The specified component "${name}" is not defined`);
		}

		return $C(this[name].props)
			.object(true)
			.to({})
			.reduce((map, el, key) => {
				map[`:${key}`] = key;
				return map;
			});
	}
});

/**
 * Load component runtime parameters to a map
 */
$C(componentFiles).forEach((el) => {
	const
		escapedFragments = [],
		file = escaper.replace(fs.readFileSync(el).toString(), escapedFragments),
		componentClass = componentClassRgxp.exec(file);

	const p = ((v) => {
		if (v) {
			// eslint-disable-next-line no-new-func
			return Function(`return ${escaper.paste(v[1], escapedFragments) || '{}'}`)();
		}
	})(componentClass && componentRgxp.exec(file));

	if (!p) {
		return;
	}

	const
		component = componentClass[2].replace(genericRgxp, ''),
		parent = componentClass[1].split(extendsRgxp).slice(-1)[0].replace(genericRgxp, '');

	componentsMap[component] = componentsMap[component] || {
		props: {},
		parent
	};

	const
		obj = componentsMap[component];

	obj.model = p.model;
	obj.deprecatedProps = p.deprecatedProps || {};

	if (p.functional != null) {
		obj.functional = p.functional;
	}

	if (p.inheritMods != null) {
		obj.inheritMods = p.inheritMods;
	}

	let s;

	// eslint-disable-next-line no-cond-assign
	while (s = propRgxp.exec(file)) {
		obj.props[s[2].split(' ').slice(-1)[0]] = true;
	}
});

/**
 * Inherit parameters from parent components
 */
$C(componentsMap).forEach((el, key, data) => {
	Object.assign(el, getParentParameters(el));

	const
		parent = el.parent && data[el.parent];

	if (parent) {
		Object.setPrototypeOf(el, parent);
		Object.setPrototypeOf(el.props, parent.props);
	}
});

/**
 * Returns runtime parameters of the specified component
 *
 * @param component - component object
 * @returns {!Object}
 */
function getParentParameters(component) {
	if (!component || !component.parent) {
		return {};
	}

	const fields = [
		['model'],
		['deprecatedProps'],
		['functional', false]
	];

	const
		res = {},
		parent = getParentParameters(componentsMap[component.parent]);

	for (let i = 0; i < fields.length; i++) {
		const
			[key, def] = fields[i];

		const
			val = component[key],
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
