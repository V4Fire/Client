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
	escaper = require('escaper');

const
	fs = require('node:fs');

const {
	componentRgxp,
	componentClassRgxp,

	propRgxp,
	genericRgxp,
	extendsRgxp,

	componentFiles
} = include('build/graph/const');

/**
 * Map with component runtime parameters
 */
const componentParams = module.exports;

Object.assign(componentParams, {
	getParentParameters,

	/**
	 * Return a dictionary containing the prop attributes for a component by the specified name
	 *
	 * @param {string} name - the component name
	 * @returns {object}
	 * @throws {ReferenceError} if no component with the specified name exists
	 *
	 * @example
	 * ```js
	 * getComponentPropAttrs('b-foo') // {':bla': 'bla'}
	 * ```
	 */
	getComponentPropAttrs(name) {
		name = name.camelize(false);

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
componentFiles.forEach((el) => {
	const
		escapedFragments = [];

	const
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

	componentParams[component] = componentParams[component] ?? {
		props: {},
		parent
	};

	const
		obj = componentParams[component];

	obj.deprecatedProps = p.deprecatedProps ?? {};

	if (p.functional != null) {
		obj.functional = p.functional;
	}

	if (p.inheritMods != null) {
		obj.inheritMods = p.inheritMods;
	}

	let s;

	const forceUpdateRgxp = /\bforceUpdate\s*:\s*(true|false)/;

	// eslint-disable-next-line no-cond-assign
	while (s = propRgxp.exec(file)) {
		const
			name = s.groups.name.split(' ').slice(-1)[0],
			forceUpdate = forceUpdateRgxp.exec(s.groups.params);

		obj.props[name] = {
			...forceUpdate ? {forceUpdate: forceUpdate[1] !== 'false'} : {}
		};
	}
});

/**
 * Inherit parameters from parent components
 */
Object.values(componentParams).forEach((component) => {
	Object.assign(component, getParentParameters(component));

	const parent = component.parent && componentParams[component.parent];

	if (parent) {
		Object.setPrototypeOf(component, parent);

		Object.entries(parent.props).forEach(([name, params]) => {
			component.props[name] = {...params, ...component.props[name]};
		});
	}
});

/**
 * Return the runtime parameters of the specified component
 *
 * @param {object} component - component object
 * @returns {object}
 */
function getParentParameters(component) {
	if (!component || !component.parent) {
		return {};
	}

	const fields = [
		['deprecatedProps'],
		['functional', false]
	];

	const
		params = {},
		parent = getParentParameters(componentParams[component.parent]);

	fields.forEach(([key, def]) => {
		const
			val = component[key],
			isObj = Object.isDictionary(val);

		if (val === undefined || isObj) {
			const
				parentVal = parent[key];

			if (Object.isDictionary(parentVal)) {
				params[key] = {...parentVal, ...val};
				return;
			}

			if (isObj) {
				params[key] = val;
				return;
			}

			params[key] = parentVal !== undefined ? parentVal : def;
			return;
		}

		params[key] = val;
	});

	return params;
}
