/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import log from 'core/log';
import { GLOBAL } from 'core/const/links';
import { PropOptions } from 'core/component/engines';

import {

	SystemField,
	ComponentElement,
	ComponentInterface,
	ComponentField,
	ComponentMeta

} from 'core/component/interface';

export const
	defaultWrapper = Symbol('defaultWrapper'),
	customWatcherRgxp = /^([!?]?)([^!?:]*):(.*)/;

const watcherHooks = {
	beforeCreate: true,
	created: true,
	mounted: true
};

/**
 * Binds watchers to the specified component
 *
 * @param ctx - component context
 * @param [eventCtx] - event component context
 */
export function bindWatchers(ctx: ComponentInterface, eventCtx: ComponentInterface = ctx): void {
	const
		// @ts-ignore
		{meta, hook, $async: $a} = ctx;

	if (!watcherHooks[hook]) {
		return;
	}

	const
		isBeforeCreate = hook === 'beforeCreate',
		isCreated = hook === 'created',
		isMounted = hook === 'mounted';

	for (let o = meta.watchers, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		let
			key = keys[i],
			onBeforeCreate = false,
			onMounted = false,
			root = <any>ctx;

		const
			watchers = o[key],
			customWatcher = customWatcherRgxp.exec(key);

		if (customWatcher) {
			const
				m = customWatcher[1],
				l = customWatcher[2];

			onBeforeCreate = m === '!';
			onMounted = m === '?';

			root = l ? Object.get(eventCtx, l) || Object.get(GLOBAL, l) || ctx : ctx;
			key = l ? customWatcher[3].toString() : customWatcher[3].dasherize();
		}

		if (
			isBeforeCreate && !onBeforeCreate ||
			isCreated && (onMounted || onBeforeCreate) ||
			isMounted && !onMounted ||
			!watchers
		) {
			continue;
		}

		for (let i = 0; i < watchers.length; i++) {
			const
				el = watchers[i],
				handlerIsStr = Object.isString(el.handler);

			const label = `[[WATCHER:${key}:${
				el.method != null ? el.method : handlerIsStr ? el.handler : (<Function>el.handler).name
				}]]`;

			const
				group = {group: el.group || 'watchers', label},
				eventParams = {...group, options: el.options, single: el.single};

			let handler: CanPromise<(...args: unknown[]) => void> = (...args) => {
				args = el.provideArgs === false ? [] : args;

				if (handlerIsStr) {
					const
						method = <string>el.handler;

					if (!Object.isFunction(ctx[method])) {
						throw new ReferenceError(`The specified method (${method}) for watching is not defined`);
					}

					// @ts-ignore
					$a.setImmediate(() => ctx[method](...args), group);

				} else {
					const
						fn = <Function>el.handler;

					if (el.method) {
						fn.call(ctx, ...args);

					} else {
						fn(ctx, ...args);
					}
				}
			};

			if (el.wrapper) {
				handler = <typeof handler>el.wrapper(ctx, handler);
			}

			(async () => {
				if (Object.isPromise(handler)) {
					handler = <typeof handler>await $a.promise(handler, group);
				}

				if (customWatcher) {
					const
						needDefEmitter = root === ctx && !Object.isFunction(root.on) && !Object.isFunction(root.addListener);

					if (needDefEmitter) {
						// @ts-ignore
						ctx.$on(key, handler);

					} else {
						$a.on(root, key, handler, eventParams, ...<unknown[]>el.args);
					}

					return;
				}

				// @ts-ignore
				const unwatch = ctx.$watch(key, {
					deep: el.deep,
					immediate: el.immediate,
					handler
				});

				$a.worker(unwatch, group);
			})();
		}
	}
}

/**
 * Initializes the specified fields to a data object and returns it
 *
 * @param fields
 * @param ctx - component context
 * @param instance - component class instance
 * @param [data] - data object
 */
export function initDataObject(
	fields: Dictionary<ComponentField>,
	ctx: Dictionary,
	instance: Dictionary,
	data: Dictionary = {}
): Dictionary {
	const
		queue = new Set(),
		atomQueue = new Set();

	const
		fieldList = <string[]>[];

	// Sorting atoms
	for (let keys = Object.keys(fields), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			el = <NonNullable<SystemField>>fields[key];

		if (el.atom || !el.init && (el.default !== undefined || key in instance)) {
			fieldList.unshift(key);

		} else {
			fieldList.push(key);
		}
	}

	while (true) {
		for (let i = 0; i < fieldList.length; i++) {
			const
				key = fieldList[i];

			if (data[key] !== undefined) {
				continue;
			}

			const
				el = <NonNullable<SystemField>>fields[key];

			if (!el) {
				continue;
			}

			let
				canInit = el.atom || atomQueue.size === 0;

			if (el.after.size) {
				for (let o = el.after.values(), val = o.next(); !val.done; val = o.next()) {
					const
						waitFieldKey = val.value,
						waitField = fields[waitFieldKey];

					if (!waitField) {
						throw new ReferenceError(`Field "${waitFieldKey}" is not defined`);
					}

					if (el.atom && !waitField.atom) {
						throw new Error(`Atom field "${key}" can't wait the non atom field "${waitFieldKey}"`);
					}

					if (data[waitFieldKey] === undefined) {
						queue.add(key);

						if (el.atom) {
							atomQueue.add(key);
						}

						canInit = false;
						break;
					}
				}
			}

			if (canInit) {
				ctx.$activeField = key;

				queue.delete(key);
				atomQueue.delete(key);

				let
					val;

				if (el.init) {
					val = el.init(<any>ctx, data);
				}

				if (val === undefined) {
					if (data[key] === undefined) {
						val = el.default !== undefined ? el.default : Object.fastClone(instance[key]);
						data[key] = val;
					}

				} else {
					data[key] = val;
				}
			}
		}

		if (!atomQueue.size && !queue.size) {
			break;
		}
	}

	return data;
}

/**
 * Initializes props to the specified data object and returns it
 *
 * @param fields
 * @param ctx - component context
 * @param instance - component class instance
 * @param [data] - data object
 * @param [forceInit] - if true, then prop values will be force initialize
 */
export function initPropsObject(
	fields: Dictionary<PropOptions>,
	ctx: Dictionary,
	instance: Dictionary,
	data: Dictionary = {},
	forceInit?: boolean
): Dictionary {
	for (let keys = Object.keys(fields), i = 0; i < keys.length; i++) {
		const
			key = ctx.$activeField = keys[i],
			el = fields[key];

		if (!el) {
			continue;
		}

		let
			val = ctx[key];

		if (val === undefined) {
			val = el.default !== undefined ? el.default : Object.fastClone(instance[key]);
		}

		if (Object.isFunction(val)) {
			if (forceInit || !val[defaultWrapper]) {
				data[key] = el.type === Function ? val.bind(ctx) : val.call(ctx);
			}

		} else if (forceInit) {
			data[key] = val;
		}
	}

	return data;
}

/**
 * Runs a hook from the specified meta object
 *
 * @param hook
 * @param meta
 * @param ctx - link to context
 * @param args - event arguments
 */
export function runHook(
	hook: string,
	meta: ComponentMeta,
	ctx: Dictionary<any>,
	...args: unknown[]
): Promise<void> {
	ctx.hook = hook;

	if (Object.isFunction(ctx.log)) {
		ctx.log(`hook:${hook}`, ...args);

	} else {
		log(`component:hook:${meta.componentName}:${hook}`, ...args, ctx);
	}

	if (!meta.hooks[hook].length) {
		return createSyncPromise();
	}

	const event = {
		queue: [] as Function[],
		events: {} as Dictionary<{event: Set<string>; cb: Function}[]>,

		on(event: CanUndef<Set<string>>, cb: Function): void {
			if (event && event.size) {
				for (let v = event.values(), el = v.next(); !el.done; el = v.next()) {
					this.events[el.value] = this.events[el.value] || [];
					this.events[el.value].push({event, cb});
				}

				return;
			}

			this.queue.push(cb);
		},

		emit(event: string): CanPromise<void> {
			if (!this.events[event]) {
				return;
			}

			const
				tasks = <CanPromise<unknown>[]>[];

			for (let o = this.events[event], i = 0; i < o.length; i++) {
				const
					el = o[i];

				if (!el.event.delete(event).size) {
					const
						task = el.cb();

					if (Object.isPromise(task)) {
						tasks.push(task);
					}
				}
			}

			if (tasks.length) {
				return Promise.all(tasks).then(() => undefined);
			}
		},

		fire(): CanPromise<void> {
			const
				tasks = <Promise<unknown>[]>[];

			for (let i = 0; i < this.queue.length; i++) {
				const
					task = this.queue[i]();

				if (Object.isPromise(task)) {
					tasks.push(task);
				}
			}

			if (tasks.length) {
				return Promise.all(tasks).then(() => undefined);
			}
		}
	};

	for (let hooks = meta.hooks[hook], i = 0; i < hooks.length; i++) {
		const
			el = hooks[i];

		event.on(el.after, () => {
			const
				res = el.fn.apply(ctx, args),
				emit = () => event.emit(el.name || Math.random().toString());

			if (Object.isPromise(res)) {
				return res.then(emit);
			}

			const
				tasks = emit();

			if (Object.isPromise(tasks)) {
				return tasks;
			}
		});
	}

	const
		tasks = event.fire();

	if (Object.isPromise(tasks)) {
		return tasks;
	}

	return createSyncPromise();
}

/**
 * Creates new meta object with the specified parent
 * @param parent
 */
export function createMeta(parent: ComponentMeta): ComponentMeta {
	const meta = Object.assign(Object.create(parent), {
		params: Object.create(parent.params),
		watchers: {},
		hooks: {}
	});

	for (let o = meta.hooks, p = parent.hooks, keys = Object.keys(p), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			v = p[key];

		if (v) {
			o[key] = v.slice();
		}
	}

	for (let o = meta.watchers, p = parent.watchers, keys = Object.keys(p), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			v = p[key];

		if (v) {
			o[key] = v.slice();
		}
	}

	return meta;
}

/**
 * Iterates the specified constructor prototype and adds methods/accessors to the meta object
 *
 * @param constructor
 * @param meta
 */
export function addMethodsToMeta(constructor: Function, meta: ComponentMeta): void {
	const
		proto = constructor.prototype,
		ownProps = Object.getOwnPropertyNames(proto);

	for (let i = 0; i < ownProps.length; i++) {
		const
			key = ownProps[i];

		if (key === 'constructor') {
			continue;
		}

		const
			desc = <PropertyDescriptor>Object.getOwnPropertyDescriptor(proto, key);

		if ('value' in desc) {
			const
				fn = desc.value;

			if (!Object.isFunction(fn)) {
				continue;
			}

			// tslint:disable-next-line:prefer-object-spread
			meta.methods[key] = Object.assign(meta.methods[key] || {watchers: {}, hooks: {}}, {fn});

		} else {
			const
				field = meta.props[key] ? meta.props : meta.fields[key] ? meta.fields : meta.systemFields,
				metaKey = key in meta.accessors ? 'accessors' : 'computed',
				obj = meta[metaKey];

			if (field[key]) {
				Object.defineProperty(proto, key, {
					writable: true,
					configurable: true,
					value: undefined
				});

				delete field[key];
			}

			const
				old = obj[key],
				set = desc.set || old && old.set,
				get = desc.get || old && old.get;

			if (set) {
				const
					k = `${key}Setter`;

				proto[k] = set;
				meta.methods[k] = {
					fn: set,
					watchers: {},
					hooks: {}
				};
			}

			if (get) {
				const
					k = `${key}Getter`;

				proto[k] = get;
				meta.methods[k] = {
					fn: get,
					watchers: {},
					hooks: {}
				};
			}

			Object.assign(obj, {
				[key]: {
					get: desc.get || old && old.get,
					set
				}
			});
		}
	}
}

/**
 * Adds methods from a meta object to the specified context
 *
 * @param meta
 * @param ctx
 * @param [safe] - if true, then will be using safe access to properties
 */
export function addMethodsFromMeta(meta: ComponentMeta, ctx: Dictionary<any>, safe?: boolean): void {
	const list = [
		meta.accessors,
		meta.computed,
		meta.methods
	];

	for (let i = 0; i < list.length; i++) {
		const
			o = list[i];

		for (let keys = Object.keys(o), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				el = <StrictDictionary<any>>o[key];

			if ((safe ? Object.getOwnPropertyDescriptor(ctx, key) : ctx[key]) !== undefined && el.replace !== false) {
				continue;
			}

			if ('fn' in el) {
				if (safe) {
					Object.defineProperty(ctx, key, {
						configurable: true,
						writable: true,
						value: el.fn.bind(ctx)
					});

				} else {
					ctx[key] = el.fn.bind(ctx);
				}

			} else {
				Object.defineProperty(ctx, key, el);
			}
		}
	}
}

/**
 *
 * @param ctx
 */
export function addElAccessor(elId: symbol, ctx: ComponentInterface): void {
	let
		staticEl;

	Object.defineProperty(ctx, '$el', {
		set(val: Element): void {
			staticEl = val;
		},

		get(): CanUndef<ComponentElement<any>> {
			if (staticEl) {
				return staticEl;
			}

			const
				el = <Element>ctx[elId];

			if (el && el.closest('html')) {
				return el;
			}

			return (ctx[elId] = document.querySelector(`.i-block-helper.${ctx.componentId}`) || undefined);
		}
	});
}

function createSyncPromise<R = unknown>(val?: R, err?: unknown): Promise<R> {
	return <any>{
		then: (resolve, reject) => {
			try {
				if (err !== undefined) {
					return createSyncPromise(undefined, reject ? reject(err) : err);
				}

				return createSyncPromise(resolve ? resolve(val) : val);

			} catch (err) {
				return createSyncPromise(undefined, reject ? reject(err) : err);
			}
		},

		catch: (cb) => createSyncPromise(undefined, cb(err)),
		finally: (cb) => createSyncPromise(cb())
	};
}
