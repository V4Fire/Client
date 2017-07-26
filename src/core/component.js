'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import * as defTpls from 'core/block.ss';

const
	Vue = require('vue'),
	uuid = require('uuid');

Vue.config.errorHandler = (err, vm) => {
	console.error(err, vm);
};

if (process.env.NODE_ENV === 'production') {
	require('raven-js')
		.config(require('config').sentry.url)
		.addPlugin(require('raven-js/plugins/vue'), Vue)
		.install();
}

const
	EventEmitter2 = require('eventemitter2').EventEmitter2,
	componentName = Symbol('componentName');

export const
	rootComponents = {},
	staticComponents = {},
	localComponents = {},
	components = {},
	props = {},
	initEvent = new EventEmitter2({maxListeners: 1e3});

/**
 * Returns a component name
 * @param constr
 */
export function getComponentName(constr: Function): string {
	return constr[componentName] = constr[componentName] || `${constr.name}__${uuid()}`.dasherize();
}

/**
 * Returns a public component name from the specified
 * @param name
 */
export function getPublicComponentName(name: string): string {
	return name.replace(/--.*/, '');
}

/**
 * Adds a root component to the global cache
 * @decorator
 */
export function rootComponent(target) {
	const lastBlock = getComponentName(target);
	rootComponents[lastBlock] = target;
	props[lastBlock] = props[lastBlock] || {};
	initEvent.emit('component', lastBlock);
}

/**
 * Defines the specified Vue property
 *
 * @decorator
 * @param type - property type
 * @param required - true if the property is required
 */
export function prop(type: any, required: boolean) {
	return (target, key, desc) => {
		initEvent.once('component', (name) => {
			let def = desc.initializer();
			if (Object.isObject(def) || Object.isArray(def)) {
				def = new Function(`return ${def.toSource()}`);

			} else if (Object.isDate(def)) {
				def = def.clone();
			}

			props[name][key] = {
				type,
				default: def,
				required
			};
		});
	};
}

const
	isAbstract = /^i-/;

/**
 * Creates new Vue.js component
 *
 * @decorator
 * @param [functional] - if true, then the component will be created as functional
 * @param [tpl] - if false, then will be used the default template
 */
export function component(
	{functional, tpl}: {
		functional?: boolean,
		tpls?: boolean
	} = {}
) {
	return (target) => {
		rootComponent(target);

		const
			name = getComponentName(target),
			publicName = getPublicComponentName(name),
			parent = getComponentName(Object.getPrototypeOf(target));

		const p = {
			props: {},
			data: {}
		};

		const opts = {
			functional
		};

		const whitelist = {
			with: true,
			model: true,
			provide: true,
			inject: true,
			components: true,
			transitions: true,
			filters: true,
			directives: true,
			delimiters: true,
			inheritAttrs: true,
			comments: true
		};

		{
			const
				obj = props[name],
				keys = Object.keys(obj);

			for (let i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					el = obj[key];

				if (el.abstract) {
					continue;
				}

				if (whitelist[key]) {
					opts[key] = el;

				} else {
					p[el.data ? 'data' : 'props'][key] = el;
				}
			}
		}

		const comp = new target({
			name,
			parent,
			opts,
			props: p.props,
			fields: p.data
		});

		if (comp.model) {
			comp.model.event = comp.model.event.dasherize();
		}

		const
			parentComp = components[parent],
			parentCompStatic = staticComponents[parent];

		if (parentComp) {
			comp.mixins = comp.mixins || [];
			comp.mixins.push(parentComp);
			comp.parentComponent = parentCompStatic;
		}

		const
			clone = {};

		{
			const
				keys = Object.keys(comp);

			for (let i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					el = comp[key];

				clone[key] = Object.isObject(el) ? {...el} : el;
			}
		}

		staticComponents[name] = comp.component = clone;
		components[name] = comp;

		if (parentComp) {
			const
				keys = Object.keys(parentCompStatic);

			for (let i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					el = parentCompStatic[key];

				if (Object.isTable(el) && Object.isTable(clone[key])) {
					Object.setPrototypeOf(clone[key], el);

				} else if (key in clone === false) {
					clone[key] = el;
				}
			}
		}

		function loader(resolve) {
			const success = () => {
				if (localComponents[publicName]) {
					comp.components = Object.assign(comp.components || {}, localComponents[publicName]);
					clone.components = {...comp.components};
				}

				resolve(comp);
				ModuleDependencies.event.emit(`component.${name}`, {comp, name, publicName});
			};

			const addRenderAndResolve = (tpls) => {
				Object.assign(comp, tpls.index());
				success();
			};

			if ('render' in comp || functional) {
				success();

			} else if (isAbstract.test(name) || tpl === false) {
				addRenderAndResolve(defTpls.block);

			} else {
				const f = () => {
					if (TPLS[name]) {
						addRenderAndResolve(TPLS[name]);

					} else {
						setImmediate(f);
					}
				};

				f();
			}
		}

		if (comp.with) {
			const l = comp.with.dasherize();
			localComponents[l] = localComponents[l] || {};
			localComponents[l][publicName] = () => new Promise(loader);

		} else {
			Vue.component(name, loader);
			Vue.component(publicName, loader);
		}

		return target;
	};
}
