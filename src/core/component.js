'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import config from 'config';
import * as defTpls from 'core/block.ss';

const
	Vue = require('vue');

Vue.config.errorHandler = (err, vm) => {
	console.error(err, vm);
};

if (process.env.NODE_ENV === 'production') {
	if (config.sentry) {
		require('raven-js')
			.config(config.sentry.url)
			.addPlugin(require('raven-js/plugins/vue'), Vue)
			.install();
	}
}

const
	EventEmitter2 = require('eventemitter2').EventEmitter2;

export const
	initEvent = new EventEmitter2({maxListeners: 1e3}),
	rootComponents = {},
	staticComponents = new WeakMap(),
	localComponents = new WeakMap(),
	components = new WeakMap(),
	props = new WeakMap();

/**
 * Returns a component name
 * @param constr
 */
export function getComponentName(constr: Function): string {
	return constr.name.dasherize();
}

/**
 * Adds a root component to the global cache
 * @decorator
 */
export function rootComponent(target) {
	rootComponents[getComponentName(target)] = target;
	props.set(target, props.get(target) || {});
	initEvent.emit('component', target);
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
		initEvent.once('component', (comp) => {
			let def = desc.initializer();
			if (Object.isObject(def) || Object.isArray(def)) {
				def = new Function(`return ${def.toSource()}`);

			} else if (Object.isDate(def)) {
				def = def.clone();
			}

			props.get(comp)[key] = {
				type,
				default: def,
				required
			};
		});
	};
}

const
	isAbstract = /^[iv]-/;

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
			parent = Object.getPrototypeOf(target).constructor;

		const p = {
			props: {},
			data: {}
		};

		const opts = {
			functional
		};

		{
			const
				obj = props.get(target),
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
			parentComp = components.get(parent),
			parentCompStatic = staticComponents.get(parent);

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

		comp.component = clone;
		staticComponents.set(target, clone);
		components.set(target, comp);

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
				if (localComponents.has(target)) {
					comp.components = Object.assign(comp.components || {}, localComponents.get(target));
					clone.components = {...comp.components};
				}

				resolve(comp);
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
			localComponents.set(comp.with, localComponents.get(comp.with) || {});
			localComponents.get(comp.with)[name] = () => new Promise(loader);

		} else {
			Vue.component(name, loader);
		}

		return target;
	};
}
