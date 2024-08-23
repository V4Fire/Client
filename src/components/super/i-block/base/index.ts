/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/super/i-block/components/base/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';

import log, { LogMessageOptions } from 'core/log';

import type Async from 'core/async';

import {

	wrapWithSuspending,

	IdObject,
	AsyncOptions,
	BoundFn

} from 'core/async';

import config from 'config';

import {

	component,
	getComponentName,

	bindRemoteWatchers,
	customWatcherRgxp,

	RawWatchHandler,
	WatchPath,

	SetupContext

} from 'core/component';

import type iBlock from 'components/super/i-block/i-block';
import type iStaticPage from 'components/super/i-static-page/i-static-page';

import { field, system, computed, hook, wait } from 'components/super/i-block/decorators';
import { activate, deactivate } from 'components/super/i-block/modules/activation';
import { initRemoteWatchers } from 'components/super/i-block/modules/listeners';

import Block from 'components/friends/block';
import type { AsyncWatchOptions } from 'components/friends/sync';

import iBlockFriends from 'components/super/i-block/friends';

const
	$$ = symbolGenerator(),
	i18nKeysets = new Map<Function, string[]>();

const $propIds = Symbol('propIds');

@component({partial: 'iBlock'})
export default abstract class iBlockBase extends iBlockFriends {
	/** @inheritDoc */
	declare readonly Component: iBlock;

	/** @inheritDoc */
	declare readonly Root: iStaticPage;

	/** @inheritDoc */
	declare readonly $root: this['Root'];

	@system({
		atom: true,

		unique: (ctx, oldCtx) =>
			!ctx.$el?.classList.contains(oldCtx.componentId),

		init: (o) => {
			const {r} = o;

			let id = o.componentIdProp;

			if (id != null) {
				if (!($propIds in r)) {
					r[$propIds] = Object.createDict();
				}

				const
					propId = id,
					propIds = r[$propIds];

				if (propIds[propId] != null) {
					id += `-${propIds[propId]++}`;
				}

				propIds[propId] ??= 0;
			}

			id ??= o.randomGenerator.next().value;
			return `u${Object.fastHash(id)}`;
		}
	})

	override readonly componentId!: string;

	/**
	 * True if the component is already activated.
	 * A deactivated component will not retrieve data from providers during initialization.
	 *
	 * {@link iBlock.activatedProp}
	 */
	@system((o) => {
		if (!o.isFunctional || o.forceActivation) {
			void o.lfc.execCbAtTheRightTime(() => {
				if (o.isActivated) {
					o.activate(true);

				} else {
					o.deactivate();
				}
			});
		}

		if (!o.isFunctional) {
			o.watch('activatedProp', (val: CanUndef<boolean>) => {
				val = val !== false;

				if (o.hook !== 'beforeDataCreate') {
					if (val) {
						o.activate();

					} else {
						o.deactivate();
					}
				}

				o.isActivated = val;
			});
		}

		return o.activatedProp;
	})

	isActivated!: boolean;

	/**
	 * True if the component is a functional component
	 */
	get isFunctional(): boolean {
		return this.meta.params.functional === true;
	}

	/**
	 * True if all component watchers are operating in functional mode
	 */
	@computed()
	get isFunctionalWatchers(): boolean {
		return SSR || this.isFunctional;
	}

	/**
	 * A dictionary containing additional attributes for the component's root element
	 */
	@computed({dependencies: []})
	get rootAttrs(): Dictionary {
		return this.field.getFieldsStore().rootAttrsStore;
	}

	/**
	 * An iterator for generating pseudo-random numbers.
	 * It is used for generating identical component IDs during SSR and hydration.
	 */
	get randomGenerator(): IterableIterator<number> {
		return this.r.randomGenerator;
	}

	/**
	 * True if the component context is based on another component via `vdom.getRenderFn`
	 */
	@system()
	protected readonly isVirtualTpl: boolean = false;

	/**
	 * Number of listeners for the `beforeReady` event.
	 * This is used to optimize component initialization.
	 */
	@system({unique: true})
	protected beforeReadyListeners: number = 0;

	/**
	 * A list of `blockReady` listeners.
	 * This is used to optimize component initialization.
	 */
	@system({unique: true, init: () => []})
	protected readonly blockReadyListeners!: Function[];

	/**
	 * A temporary cache dictionary.
	 * Mutation of this object does not cause the component to re-render.
	 */
	@system({
		merge: true,
		init: () => Object.createDict()
	})

	protected tmp!: Dictionary;

	/**
	 * A temporary cache dictionary.
	 * Mutation of this object can cause the component to re-render.
	 */
	@field({merge: true, init: () => ({})})
	protected reactiveTmp!: Dictionary;

	/**
	 * A cache dictionary of watched values
	 */
	@system({
		merge: true,
		init: () => Object.createDict()
	})

	protected watchCache!: Dictionary;

	/**
	 * A dictionary containing additional attributes for the component's root element
	 * {@link iBlock.rootAttrsStore}
	 */
	@field({init: () => ({})})
	protected rootAttrsStore!: Dictionary;

	/**
	 * A list of keyset names used to internationalize the component
	 */
	@computed({cache: 'forever'})
	protected get componentI18nKeysets(): string[] {
		const {constructor} = this.meta;

		let keysets: CanUndef<string[]> = i18nKeysets.get(constructor);

		if (keysets == null) {
			keysets = [];
			i18nKeysets.set(constructor, keysets);

			let keyset: CanUndef<string> = getComponentName(constructor);

			while (keyset != null) {
				keysets.push(keyset);
				keyset = config.components[keyset]?.parent;
			}
		}

		return keysets;
	}

	/**
	 * A link to the component itself
	 */
	protected get self(): this {
		return this;
	}

	/**
	 * {@link iBlock.activatedProp}
	 * @param [force]
	 */
	override activate(force?: boolean): void {
		activate(Object.cast(this), force);
	}

	/** {@link iBlock.activatedProp} */
	override deactivate(): void {
		deactivate(Object.cast(this));
	}

	/**
	 * Sets a watcher to the component/object property or event at the specified path.
	 *
	 * When you observe changes to certain properties,
	 * the event handler function can accept a second argument that references the old value of the property.
	 * If the observed value is not a primitive type, the old value will be cloned from the original old value to
	 * avoid having two references to the same object.
	 *
	 * ```typescript
	 * @component()
	 * import iBlock, { component, field, watch } from 'components/super/i-block/i-block';
	 *
	 * @component()
	 * class bExample extends iBlock {
	 *   @field()
	 *   list: Dictionary[] = [];
	 *
	 *   @watch('list')
	 *   onListChange(value: Dictionary[], oldValue: Dictionary[]): void {
	 *     // true
	 *     console.log(value !== oldValue);
	 *     console.log(value[0] !== oldValue[0]);
	 *   }
	 *
	 *   // When you don't declare a second argument in the watcher,
	 *   // the previous value isn't cloned
	 *   @watch('list')
	 *   onListChangeWithoutCloning(value: Dictionary[]): void {
	 *     // true
	 *     console.log(value === arguments[1]);
	 *     console.log(value[0] === oldValue[0]);
	 *   }
	 *
	 *   // When you watch a property deeply and declare a second argument in the watcher,
	 *   // the previous value is deeply cloned
	 *   @watch({path: 'list', deep: true})
	 *   onListChangeWithDeepCloning(value: Dictionary[], oldValue: Dictionary[]): void {
	 *     // true
	 *     console.log(value !== oldValue);
	 *     console.log(value[0] !== oldValue[0]);
	 *   }
	 *
	 *   created() {
	 *     this.list.push({});
	 *     this.list[0].foo = 1;
	 *   }
	 * }
	 * ```
	 *
	 * You need to use the special ":" delimiter within a path to listen to an event.
	 * Also, you can specify an event emitter to listen for by writing a reference before the ":" character.
	 * For instance:
	 *
	 * 1. `':onChange'` - will listen to the component `onChange` event;
	 * 2. `'localEmitter:onChange'` - will listen to the `onChange` event from `localEmitter`;
	 * 3. `'$parent.localEmitter:onChange'` - will listen to the `onChange` event from `$parent.localEmitter`;
	 * 4. `'document:scroll'` - will listen to the `scroll` event from `window.document`.
	 *
	 * A link to the event emitter is taken from the component properties or the global object.
	 * An empty reference '' is a reference to the component itself.
	 *
	 * Also, if you are listening to an event, you can control when to start listening to the event by using special
	 * characters at the beginning of the path string:
	 *
	 * 1. `'!'` - start listening to an event on the "beforeCreate" hook, e.g., `'!rootEmitter:reset'`;
	 * 2. `'?'` - start listening to an event on the "mounted" hook, e.g., `'?$el:click'`.
	 *
	 * By default, all events start listening on the "created" hook.
	 *
	 * To listen for changes to another observable, you need to specify the watch path as an object:
	 *
	 * ```
	 * {
	 *   ctx: linkToWatchObject,
	 *   path?: pathToWatch
	 * }
	 * ```
	 *
	 * @param path - a path to the component property to watch or an event to listen
	 * @param opts - additional options
	 * @param handler
	 *
	 * @example
	 * ```js
	 * // Watch for changes of `foo`
	 * this.watch('foo', (val, oldVal) => {
	 *   console.log(val, oldVal);
	 * });
	 *
	 * // Watch for changes of another watchable object
	 * this.watch({ctx: anotherObject, path: 'foo'}, (val, oldVal) => {
	 *   console.log(val, oldVal);
	 * });
	 *
	 * // Deep watch for changes of `foo`
	 * this.watch('foo', {deep: true}, (val, oldVal) => {
	 *   console.log(val, oldVal);
	 * });
	 *
	 * // Watch for changes of `foo.bla`
	 * this.watch('foo.bla', (val, oldVal) => {
	 *   console.log(val, oldVal);
	 * });
	 *
	 * // Listen to the `onChange` event of the component
	 * this.watch(':onChange', (val, oldVal) => {
	 *   console.log(val, oldVal);
	 * });
	 *
	 * // Listen to the `onChange` event of `parentEmitter`
	 * this.watch('parentEmitter:onChange', (val, oldVal) => {
	 *   console.log(val, oldVal);
	 * });
	 * ```
	 */
	watch<T = unknown>(
		path: WatchPath,
		opts: AsyncWatchOptions,
		handler: RawWatchHandler<this, T>
	): void;

	/**
	 * Sets a watcher to the component property/event at the specified path
	 *
	 * @param path - a path to the component property to watch or an event to listen
	 * @param handler
	 * @param [opts] - additional options
	 */
	watch<T = unknown>(
		path: WatchPath,
		handler: RawWatchHandler<this, T>,
		opts?: AsyncWatchOptions
	): void;

	/**
	 * Sets a watcher to the specified observable object
	 *
	 * @param obj
	 * @param opts - additional options
	 * @param handler
	 *
	 * @example
	 * ```js
	 * this.watch(anotherObject, {deep: true}, (val, oldVal) => {
	 *   console.log(val, oldVal);
	 * });
	 * ```
	 */
	watch<T = unknown>(
		// eslint-disable-next-line @typescript-eslint/unified-signatures
		obj: object,
		opts: AsyncWatchOptions,
		handler: RawWatchHandler<this, T>
	): void;

	/**
	 * Sets a watcher to the specified observable object
	 *
	 * @param obj
	 * @param handler
	 * @param [opts] - additional options
	 *
	 * @example
	 * ```js
	 * this.watch(anotherObject, (val, oldVal) => {
	 *   console.log(val, oldVal);
	 * });
	 * ```
	 */
	watch<T = unknown>(
		// eslint-disable-next-line @typescript-eslint/unified-signatures
		obj: object,
		handler: RawWatchHandler<this, T>,
		opts?: AsyncWatchOptions
	): void;

	watch<T = unknown>(
		path: WatchPath | object,
		optsOrHandler: AsyncWatchOptions | RawWatchHandler<this, T>,
		handlerOrOpts?: RawWatchHandler<this, T> | AsyncWatchOptions
	): void {
		if (SSR) {
			return;
		}

		const {async: $a} = this;

		let
			handler: RawWatchHandler<this, T>,
			opts: AsyncWatchOptions;

		if (Object.isFunction(optsOrHandler)) {
			handler = optsOrHandler;
			opts = Object.isDictionary(handlerOrOpts) ? handlerOrOpts : {};

		} else {
			handler = Object.cast(handlerOrOpts);
			opts = Object.isDictionary(optsOrHandler) ? optsOrHandler : {};
		}

		if (Object.isString(path) && RegExp.test(customWatcherRgxp, path)) {
			bindRemoteWatchers(this, {
				async: $a,
				watchers: {
					[path]: [
						{
							handler: (_: unknown, ...args: unknown[]) => handler.call(this, ...args),
							...opts
						}
					]
				}
			});

			return;
		}

		void this.lfc.execCbAfterComponentCreated(() => {
			let
				// eslint-disable-next-line prefer-const
				link: Nullable<CanArray<IdObject>>,

				// eslint-disable-next-line prefer-const
				unwatch: Nullable<Function>;

			const emitter: Function = (_: any, wrappedHandler: RawWatchHandler<this, T>) => {
				wrappedHandler['originalLength'] = handler['originalLength'] ?? handler.length;
				handler = wrappedHandler;

				$a.worker(() => {
					if (link != null) {
						$a.off(link);
					}
				}, opts);

				return () => unwatch?.();
			};

			link = $a.on(emitter, 'mutation', handler, wrapWithSuspending(opts, 'watchers'));
			unwatch = this.$watch(Object.cast(path), opts, handler);
		});
	}

	/**
	 * Executes the specified function on the next render tick
	 * {@link Async.proxy}
	 *
	 * @param fn
	 * @param [opts] - additional options
	 */
	nextTick(fn: BoundFn<this>, opts?: AsyncOptions): void;

	/**
	 * Returns a promise that will be resolved on the next render tick
	 * {@link Async.promise}
	 *
	 * @param [opts] - additional options
	 */
	nextTick(opts?: AsyncOptions): Promise<void>;
	nextTick(fnOrOpts?: BoundFn<this> | AsyncOptions, opts?: AsyncOptions): CanPromise<void> {
		const {async: $a} = this;

		if (Object.isFunction(fnOrOpts)) {
			this.$nextTick($a.proxy(Object.cast<BoundFn<any>>(fnOrOpts), opts));
			return;
		}

		return $a.promise(this.$nextTick(), fnOrOpts);
	}

	/**
	 * Forces the component to re-render
	 */
	@wait({defer: true, label: $$.forceUpdate})
	forceUpdate(): Promise<void> {
		this.$forceUpdate();
		return Promise.resolve();
	}

	/**
	 * Logs the given message on behalf of the component.
	 * The `core/log` module is used for logging, so see the documentation for this module for details.
	 *
	 * All component messages are prefixed with `component:` and also contain the component name itself.
	 * For example, `log('fBar')` from the `bExample` component will create a logging message: `component:fBar:b-example`.
	 * If the component has the `globalName` prop specified, then the message will be as follows (for example,
	 * `globalName` is equal to `myExample`): `component:global:myExample:fBar:b-example`.
	 *
	 * By default, all messages have a logging level of `info`. Such messages will not be logged unless the component has
	 * the `verbose` prop set to true. It is allowed to set the logging level explicitly.
	 *
	 * @param ctxOrOpts - the logging context or logging options
	 * @param [details] - the event details
	 *
	 * @example
	 * ```js
	 * // Enable logging
	 * setEnv('log', {patterns: ['myMessage']});
	 *
	 * this.log('myMessage', 'some', 'parameters', () => 'the function will be called dynamically');
	 * this.log({context: 'myMessage', logLevel: 'error'});
	 * ```
	 */
	log(ctxOrOpts: string | LogMessageOptions, ...details: unknown[]): void {
		let
			context = ctxOrOpts,
			logLevel: CanUndef<LogMessageOptions['logLevel']>;

		if (!Object.isString(ctxOrOpts)) {
			logLevel = ctxOrOpts.logLevel;
			context = ctxOrOpts.context;
		}

		if (!this.verbose && (logLevel == null || logLevel === 'info')) {
			return;
		}

		let resolvedContext: Array<string | LogMessageOptions>;

		if (this.globalName != null) {
			resolvedContext = ['component:global', this.globalName, context, this.componentName];

		} else {
			resolvedContext = ['component', context, this.componentName];
		}

		log(
			{
				context: resolvedContext.join(':'),
				logLevel
			},

			...details,
			this
		);
	}

	protected override setup(props: Dictionary, _ctx: SetupContext): CanPromise<CanUndef<Dictionary>> {
		if (props.wait != null) {
			return Promise.resolve(props.wait).then(() => undefined);
		}
	}

	/**
	 * Initializes an instance of the `Block` class for the component
	 */
	@hook('mounted')
	protected initBlockInstance(): void {
		if (this.block != null) {
			const {node} = this.block;

			if (node == null || node === this.$el) {
				return;
			}

			// @ts-ignore (unsafe)
			if (node.component === this) {
				delete node.component;
			}
		}

		this.block = new Block(Object.cast(this));

		if (this.blockReadyListeners.length > 0) {
			this.blockReadyListeners.splice(0, this.blockReadyListeners.length).forEach((listener) => listener());
		}
	}

	/**
	 * Initializes remote watchers from the `watchProp` prop
	 */
	@hook({beforeDataCreate: {functional: false}})
	protected initRemoteWatchers(): void {
		initRemoteWatchers(Object.cast(this));
	}

	/**
	 * Initializes the core component API
	 */
	@hook('beforeRuntime')
	protected initBaseAPI(): void {
		this.watch = this.instance.watch.bind(this);

		if (this.getParent != null) {
			const {$parent} = this;

			Object.defineProperty(this, '$parent', {
				enumerable: true,
				configurable: true,
				get: () => this.getParent?.() ?? $parent
			});
		}

		if (!this.meta.params.root) {
			Object.defineProperty(this, 'app', {
				enumerable: true,
				configurable: true,
				get: () => 'app' in this.r ? this.r['app'] : undefined
			});
		}
	}
}
