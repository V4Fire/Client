'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { statuses } from 'super/i-block/modules/block';
import { initEvent, props } from 'core/component';

export const
	binds = new WeakMap(),
	watchers = new WeakMap(),
	locals = new WeakMap(),
	blockProps = new WeakMap(),
	mixins = new WeakMap();

/**
 * Sets the specified parameters to a Vue property
 *
 * @decorator
 * @param params - property parameters
 */
export function params(params) {
	return (target, key, desc) => {
		Object.assign(params, {field: key});
		initEvent.once('component', (comp) => {
			const
				a = desc.get || desc.set;

			if (a) {
				Object.assign(a, params);
				return;
			}

			if (key.slice(0, 2) === '$$' && desc.value) {
				Object.assign(desc.value, params);
				return;
			}

			Object.assign(props.get(comp)[key], params);
		});
	};
}

/**
 * Sets a Vue property as abstract
 * @decorator
 */
export const abstract = params({abstract: true});

/**
 * Sets a Vue property as data
 *
 * @decorator
 * @param [initializer] - initializer function
 */
export function field(initializer?: (o: iBlock) => any | any) {
	return params({data: true, initializer});
}

/**
 * Defines a property as block
 *
 * @decorator
 * @param [name] - property name
 * @param [keyName] - key name
 */
export function blockProp(name?: string, keyName?: string) {
	return (target, key) => {
		initEvent.once('component', (comp) => {
			blockProps.set(comp, (blockProps.get(comp) || []).concat([[name || key, keyName || key]]));
		});
	};
}

/**
 * Binds a modifier to the specified parameter
 *
 * @decorator
 * @param param
 * @param [fn] - converter function
 * @param [opts] - additional options
 */
export function bindModTo(param: string, fn?: Function = Boolean, opts?: Object) {
	return (target, key) => {
		initEvent.once('component', (comp) => {
			binds.set(comp, (binds.get(comp) || []).concat(function () {
				this.bindModTo(key, param, fn, opts);
			}));
		});
	};
}

/**
 * Marks a static property as mixin
 * @decorator
 */
export function mixin(target, key, desc) {
	initEvent.once('component', (comp) => {
		mixins.set(comp, mixins.get(comp) || {});
		mixins.get(comp)[key] = desc.initializer ? desc.initializer() : desc.value;
	});
}

/**
 * Adds watcher for the specified property
 *
 * @decorator
 * @param handler
 * @param [params] - additional parameters for $watch
 */
export function watch(handler: (value: any, oldValue: any) => void | string, params?: Object) {
	return (target, key) => {
		initEvent.once('component', (comp) => {
			watchers.set(comp, (watchers.get(comp) || []).concat(function () {
				this.$watch(key, Object.isFunction(handler) ? handler : this[handler], params);
			}));
		});
	};
}

/**
 * Decorates a method as a modifier handler
 *
 * @decorator
 * @param name
 * @param [value]
 * @param [method]
 */
export function mod(name: string, value?: any = '*', method?: string = 'on') {
	return (target, key, descriptor) => {
		initEvent.once('component', (comp) => {
			locals.set(comp, (locals.get(comp) || []).concat(function () {
				this.localEvent[method](`block.mod.set.${name}.${value}`, descriptor.value.bind(this));
			}));
		});
	};
}

/**
 * Decorates a method as a remove modifier handler
 *
 * @decorator
 * @param name
 * @param [value]
 * @param [method]
 */
export function removeMod(name: string, value?: any = '*', method?: string = 'on') {
	return (target, key, descriptor) => {
		initEvent.once('component', (comp) => {
			locals.set(comp, (locals.get(comp) || []).concat(function () {
				this.localEvent[method](`block.mod.remove.${name}.${value}`, descriptor.value.bind(this));
			}));
		});
	};
}

/**
 * Decorates a method as an element modifier handler
 *
 * @decorator
 * @param elName
 * @param modName
 * @param [value]
 * @param [method]
 */
export function elMod(elName: string, modName: string, value?: any = '*', method?: string = 'on') {
	return (target, key, descriptor) => {
		initEvent.once('component', (comp) => {
			locals.set(comp, (locals.get(comp) || []).concat(function () {
				this.localEvent[method](`el.mod.set.${elName}.${modName}.${value}`, descriptor.value.bind(this));
			}));
		});
	};
}

/**
 * Decorates a method as an element remove modifier handler
 *
 * @decorator
 * @param elName
 * @param modName
 * @param [value]
 * @param [method]
 */
export function removeElMod(elName: string, modName: string, value?: any = '*', method?: string = 'on') {
	return (target, key, descriptor) => {
		initEvent.once('component', (comp) => {
			locals.set(comp, (locals.get(comp) || []).concat(function () {
				this.localEvent[method](`el.mod.remove.${elName}.${modName}.${value}`, descriptor.value.bind(this));
			}));
		});
	};
}

/**
 * Decorates a method as a state handler
 *
 * @decorator
 * @param state
 * @param [method]
 */
export function state(state: number, method?: string = 'on') {
	return (target, key, descriptor) => {
		initEvent.once('component', (comp) => {
			locals.set(comp, (locals.get(comp) || []).concat(function () {
				this.localEvent[method](`block.status.${state}`, descriptor.value.bind(this));
			}));
		});
	};
}

/**
 * Decorates a method or a function for using with the specified init status
 *
 * @decorator
 * @param status
 * @param [fn]
 * @param [defer] - if true, then the function will always return a promise
 * @param [join]
 * @param [label]
 * @param [group]
 */
export function wait(
	status: number | string,
	{fn, defer, join, label, group}?: {
		fn?: Function,
		defer?: boolean | number,
		join?: boolean | 'replace',
		label?: string | Symbol,
		group?: string | Symbol
	} | Function = {}

) {
	if (Object.isString(status)) {
		status = statuses[status];
	}

	let
		handler = fn || arguments[1];

	/** @this {iBlock} */
	function wrapper() {
		if (join === undefined) {
			join = handler.length ? 'replace' : true;
		}

		const
			{async: $a, block: $b} = this,
			p = {join, label, group};

		function reject(err) {
			if (err.type !== 'clear') {
				throw err;
			}
		}

		if ($b) {
			if (status > 0 && $b.status < 0) {
				return;
			}

			if ($b.status >= status) {
				if (defer) {
					return $a.promise(
						(async () => {
							await $a.nextTick();
							return handler.apply(this, arguments);
						})(),

						p
					).catch(reject);
				}

				return handler.apply(this, arguments);
			}
		}

		return $a.promise(
			new Promise((resolve) =>
				this.localEvent.once(`block.status.${statuses[status]}`, () => resolve(handler.apply(this, arguments)))
			),

			p
		).catch(reject);
	}

	if (Object.isFunction(handler)) {
		return wrapper;
	}

	return (target, key, descriptors) => {
		handler = descriptors.value;
		descriptors.value = wrapper;
	};
}
