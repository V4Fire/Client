/* eslint-disable max-lines,@typescript-eslint/unified-signatures */

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-block/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';
import SyncPromise from 'core/promise/sync';

import config from 'config';

import type {

	AsyncOptions,
	BoundFn

} from 'core/async';

import type bRouter from 'base/b-router/b-router';
import type iStaticPage from 'super/i-static-page/i-static-page';

import {

	component,
	PARENT,


	UnsafeGetter

} from 'core/component';

import 'super/i-block/directives';
import { statuses } from 'super/i-block/const';

import type { Classes } from 'friends/provide';
import type { ConverterCallType } from 'friends/state';
import type { Module } from 'friends/module-loader';


import type {

	Stage,
	ComponentStatus,

	ComponentStatuses,

	InitLoadOptions,
	InitLoadCb,

	ParentMessage,
	UnsafeIBlock

} from 'super/i-block/interface';

import {

	ModVal,
	ModsDecl,
	ModsProp,
	ModsDict

} from 'super/i-block/modules/mods';

import {

	field,
	system,
	computed,

	watch,
	hook,
	wait,

	WaitDecoratorOptions

} from 'super/i-block/modules/decorators';

import iBlockEvent from 'super/i-block/event';

export * from 'core/component';
export * from 'super/i-block/const';
export * from 'super/i-block/interface';

export { prop, field, system, computed, hook, watch, wait } from 'super/i-block/modules/decorators';

export { default as Friend } from 'friends/friend';

export {

	Classes,

	ModVal,
	ModsDecl,
	ModsProp,
	ModsDict

};

export const
	$$ = symbolGenerator();

/**
 * Superclass for all components
 */
@component()
export default abstract class iBlock extends iBlockEvent {
	override readonly Component!: iBlock;
	override readonly Root!: iStaticPage;

	// @ts-ignore (override)
	override readonly $root!: this['Root'];

	/**
	 * Dictionary with additional attributes for the component' root tag
	 */
	get rootAttrs(): Dictionary {
		return this.field.get<Dictionary>('rootAttrsStore')!;
	}

	/**
	 * List of additional dependencies to load
	 * @see [[iBlock.dependenciesProp]]
	 */
	@system((o) => o.sync.link((val) => {
		const componentStaticDependencies = config.componentStaticDependencies[o.componentName];
		return Array.concat([], componentStaticDependencies, val);
	}))

	dependencies!: Module[];

	/** @see [[iBlock.dontWaitRemoteProvidersProp]] */
	@system((o) => o.sync.link((val) => {
		if (val == null) {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (o.dontWaitRemoteProviders != null) {
				return o.dontWaitRemoteProviders;
			}

			const isRemote = /\bremote-provider\b/;
			return !config.components[o.componentName]?.dependencies.some((dep) => isRemote.test(dep));
		}

		return val;
	}))

	dontWaitRemoteProviders!: boolean;

	/**
	 * Link to an application router
	 */
	get router(): CanUndef<bRouter> {
		return this.field.get('routerStore', this.r);
	}

	/**
	 * Link to an application route object
	 */
	get route(): CanUndef<this['r']['CurrentPage']> {
		return this.field.get('route', this.r);
	}

	override get unsafe(): UnsafeGetter<UnsafeIBlock<this>> {
		return Object.cast(this);
	}

	/**
	 * The special link to a parent component.
	 * This parameter is used with the static declaration of modifiers to refer to parent modifiers.
	 *
	 * @example
	 * ```js
	 * @component()
	 * class Foo extends iBlock {
	 *   static mods = {
	 *     theme: [
	 *       ['light']
	 *     ]
	 *   };
	 * }
	 *
	 * @component()
	 * class Bar extends Foo {
	 *   static mods = {
	 *     theme: [
	 *       Bar.PARENT,
	 *       ['dark']
	 *     ]
	 *   };
	 * }
	 * ```
	 */
	static readonly PARENT: object = PARENT;

	static readonly mods: ModsDecl = {
		diff: [
			'true',
			'false'
		],

		theme: [],
		exterior: [],
		stage: []
	};

	/**
	 * Internal dictionary with additional attributes for the component' root tag
	 * @see [[iBlock.rootAttrsStore]]
	 */
	@field()
	protected rootAttrsStore: Dictionary = {};

	/** @inheritDoc */
	getComponentInfo(): Dictionary {
		return {
			name: this.componentName,
			hook: this.hook,
			componentStatus: this.componentStatus
		};
	}

	/**
	 * Returns a promise that will be resolved when the component is toggled to the specified status
	 *
	 * @see [[Async.promise]]
	 * @param status
	 * @param [opts] - additional options
	 */
	waitStatus(status: ComponentStatus, opts?: WaitDecoratorOptions): Promise<void>;

	/**
	 * Executes a callback when the component is toggled to the specified status.
	 * The method returns a promise resulting from invoking the function or raw result without wrapping
	 * if the component is already in the specified status.
	 *
	 * @see [[Async.promise]]
	 * @param status
	 * @param cb
	 * @param [opts] - additional options
	 */
	waitStatus<F extends BoundFn<this>>(
		status: ComponentStatus,
		cb: F,
		opts?: WaitDecoratorOptions
	): CanPromise<ReturnType<F>>;

	waitStatus<F extends BoundFn<this>>(
		status: ComponentStatus,
		cbOrOpts?: F | WaitDecoratorOptions,
		opts?: WaitDecoratorOptions
	): CanPromise<undefined | ReturnType<F>> {
		let
			needWrap = true;

		let
			cb;

		if (Object.isFunction(cbOrOpts)) {
			cb = cbOrOpts;
			needWrap = false;

		} else {
			opts = cbOrOpts;
		}

		opts = {...opts, join: false};

		if (!needWrap) {
			return wait(status, {...opts, fn: cb}).call(this);
		}

		let
			isResolved = false;

		const promise = new SyncPromise((resolve) => wait(status, {
			...opts,
			fn: () => {
				isResolved = true;
				resolve();
			}
		}).call(this));

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (isResolved) {
			return promise;
		}

		return this.async.promise<undefined>(promise);
	}

	/**
	 * Loads initial data to the component
	 *
	 * @param [data] - data object (for events)
	 * @param [opts] - additional options
	 * @emits `initLoadStart(options: CanUndef<InitLoadOptions>)`
	 * @emits `initLoad(data: CanUndef<unknown>, options: CanUndef<InitLoadOptions>)`
	 */
	@hook('beforeDataCreate')
	initLoad(data?: unknown | InitLoadCb, opts: InitLoadOptions = {}): CanPromise<void> {
		if (!this.isActivated) {
			return;
		}

		this.beforeReadyListeners = 0;

		const
			{async: $a} = this;

		const label = <AsyncOptions>{
			label: $$.initLoad,
			join: 'replace'
		};

		const done = () => {
			const get = () => {
				if (Object.isFunction(data)) {
					try {
						return data.call(this);

					} catch (err) {
						stderr(err);
						return;
					}
				}

				return data;
			};

			this.componentStatus = 'beforeReady';

			void this.lfc.execCbAfterBlockReady(() => {
				this.isReadyOnce = true;
				this.componentStatus = 'ready';

				if (this.beforeReadyListeners > 1) {
					this.nextTick()
						.then(() => {
							this.beforeReadyListeners = 0;
							this.emit('initLoad', get(), opts);
						})

						.catch(stderr);

				} else {
					this.emit('initLoad', get(), opts);
				}
			});
		};

		const doneOnError = (err) => {
			stderr(err);
			done();
		};

		try {
			if (opts.emitStartEvent !== false) {
				this.emit('initLoadStart', opts);
			}

			if (!opts.silent) {
				this.componentStatus = 'loading';
			}

			const tasks = <Array<CanPromise<unknown>>>Array.concat(
				[],

				// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
				this.state.globalName != null && this.state.initFromStorage() || []
			);

			if (this.dependencies.length > 0) {
				tasks.push(this.moduleLoader.load(...this.dependencies));
			}

			if (
				(this.isNotRegular || this.dontWaitRemoteProviders) &&
				!this.$renderEngine.supports.ssr
			) {
				if (tasks.length > 0) {
					const res = $a.promise(SyncPromise.all(tasks), label).then(done, doneOnError);
					this.$initializer = res;
					return res;
				}

				done();
				return;
			}

			const res = this.nextTick(label).then((() => {
				const
					{$children: childComponents} = this;

				if (childComponents) {
					for (let i = 0; i < childComponents.length; i++) {
						const
							component = childComponents[i],
							status = component.componentStatus;

						if (component.remoteProvider && Object.isTruly(statuses[status])) {
							if (status === 'ready') {
								if (opts.recursive) {
									component.reload({silent: opts.silent === true, ...opts}).catch(stderr);

								} else {
									continue;
								}
							}

							let
								isLoaded = false;

							tasks.push(Promise.race([
								component.waitStatus('ready').then(() => isLoaded = true),

								$a.sleep((10).seconds(), {}).then(() => {
									if (isLoaded) {
										return;
									}

									this.log(
										{
											logLevel: 'warn',
											context: 'initLoad:remoteProviders'
										},

										{
											message: 'The component is waiting too long a remote provider',
											waitFor: {
												globalName: component.globalName,
												component: component.componentName,
												dataProvider: Object.get(component, 'dataProvider')
											}
										}
									);
								})
							]));
						}
					}
				}

				return $a.promise(SyncPromise.all(tasks), label).then(done, doneOnError);
			}));

			this.$initializer = res;
			return res;

		} catch (err) {
			doneOnError(err);
		}
	}

	/**
	 * Reloads component data
	 * @param [opts] - additional options
	 */
	reload(opts?: InitLoadOptions): Promise<void> {
		const
			res = this.initLoad(undefined, {silent: true, ...opts});

		if (Object.isPromise(res)) {
			return res;
		}

		return Promise.resolve();
	}

	/**
	 * Returns true if the specified object is a component
	 *
	 * @param obj
	 * @param [constructor] - component constructor
	 */
	isComponent<T extends iBlock>(obj: unknown, constructor?: {new(): T} | Function): obj is T {
		return Object.isTruly(obj) && (<Dictionary>obj).instance instanceof (constructor ?? iBlock);
	}

	/**
	 * This method works as a two-way connector between the component and its storage.
	 *
	 * When the component initializes, it requests the storage for data associated with it by using a global name
	 * as a namespace to search. When the local storage is ready to provide data to the component,
	 * it passes data to this method. After this, the method returns a dictionary mapped to the component as properties
	 * (you can specify a complex path with dots, like `'foo.bla.bar'` or `'mods.hidden'`).
	 *
	 * Also, the component will watch for changes of every property in that dictionary.
	 * When at least one of these properties is changed, the whole butch of data will be sent to the local storage
	 * by using this method. When the component provides local storage data, the method's second argument
	 * is equal to `'remote'`.
	 *
	 * @param [data] - advanced data
	 * @param [type] - call type
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
	protected syncStorageState(data?: Dictionary, type: ConverterCallType = 'component'): Dictionary {
		return {...data};
	}

	/**
	 * Returns a dictionary with default component properties to reset a local storage state
	 * @param [data] - advanced data
	 */
	protected convertStateToStorageReset(data?: Dictionary): Dictionary {
		const
			stateFields = this.syncStorageState(data),
			res = {};

		if (Object.isDictionary(stateFields)) {
			for (let keys = Object.keys(stateFields), i = 0; i < keys.length; i++) {
				res[keys[i]] = undefined;
			}
		}

		return res;
	}

	/**
	 * This method works as a two-way connector between the global router and a component.
	 *
	 * When the component initializes, it asks the router for data. The router provides the data by using this method.
	 * After this, the method returns a dictionary mapped to the
	 * component as properties (you can specify a complex path with dots, like `'foo.bla.bar'` or `'mods.hidden'`).
	 *
	 * Also, the component will watch for changes of every property that was in that dictionary.
	 * When at least one of these properties is changed, the whole butch of data will be sent to the router
	 * by using this method (the router will produce a new transition by using `push`).
	 * When the component provides router data, the method's second argument is equal to `'remote'`.
	 *
	 * Mind that the router is global for all components, i.e., a dictionary that this method passes to the router
	 * will extend the current route data but not override (`router.push(null, {...route, ...componentData}})`).
	 *
	 * @param [data] - advanced data
	 * @param [type] - call type
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
	protected syncRouterState(data?: Dictionary, type: ConverterCallType = 'component'): Dictionary {
		return {};
	}

	/**
	 * Returns a dictionary with default component properties to reset a router state
	 * @param [data] - advanced data
	 */
	protected convertStateToRouterReset(data?: Dictionary): Dictionary {
		const
			stateFields = this.syncRouterState(data),
			res = {};

		if (Object.isDictionary(stateFields)) {
			for (let keys = Object.keys(stateFields), i = 0; i < keys.length; i++) {
				res[keys[i]] = undefined;
			}
		}

		return res;
	}

	/**
	 * Waits until the specified reference won't be available and returns it.
	 * The method returns a promise.
	 *
	 * @see [[Async.wait]]
	 * @param ref - ref name
	 * @param [opts] - additional options
	 */
	protected waitRef<T = CanArray<iBlock | Element>>(ref: string, opts?: AsyncOptions): Promise<T> {
		let
			that = <iBlock>this;

		if (this.isNotRegular) {
			ref += `:${this.componentId}`;
			that = this.$normalParent ?? that;
		}

		const
			refVal = that.$refs[ref];

		return this.async.promise<T>(() => new SyncPromise((resolve) => {
			if (refVal != null && (!Object.isArray(refVal) || refVal.length > 0)) {
				resolve(<T>refVal);

			} else {
				this.once(`[[REF:${ref}]]`, resolve, opts);
			}
		}), opts);
	}

	/**
	 * Initializes the core component API
	 */
	@hook({beforeRuntime: {functional: false}})
	protected initBaseAPI(): void {
		const
			i = this.instance;

		this.syncStorageState = i.syncStorageState.bind(this);
		this.syncRouterState = i.syncRouterState.bind(this);
		this.watch = i.watch.bind(this);

		this.on = i.on.bind(this);
		this.once = i.once.bind(this);
		this.off = i.off.bind(this);
		this.emit = i.emit.bind(this);
	}

	/**
	 * Initializes the `callChild` event listener
	 */
	@watch({field: 'proxyCall', immediate: true})
	protected initCallChildListener(value: boolean): void {
		if (!value) {
			return;
		}

		this.parentEmitter.on('onCallChild', this.onCallChild.bind(this));
	}

	/**
	 * Handler: `callChild` event
	 * @param e
	 */
	protected onCallChild(e: ParentMessage<this>): void {
		if (
			e.check[0] !== 'instanceOf' && e.check[1] === this[e.check[0]] ||
			e.check[0] === 'instanceOf' && this.instance instanceof <Function>e.check[1]
		) {
			return e.action.call(this);
		}
	}

	/**
	 * Hook handler: component will be destroyed
	 */
	protected beforeDestroy(): void {
		this.componentStatus = 'destroyed';

		try {
			delete classesCache.dict.els?.[this.componentId];
		} catch {}
	}
}
