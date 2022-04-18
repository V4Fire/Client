/*
eslint-disable
@typescript-eslint/no-unused-vars-experimental,
@typescript-eslint/no-empty-function,
@typescript-eslint/unified-signatures
*/

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { LogMessageOptions } from 'core/log';

import type Async from 'core/async';
import type { BoundFn, ProxyCb } from 'core/async';

import type { Slots, ComponentOptions } from 'core/component/engines';

import type {

	Hook,
	ComponentMeta,
	SyncLinkCache,

	WatchPath,
	WatchOptions,
	RawWatchHandler,

	RenderEngine

} from 'core/component/interface';

import type { ComponentElement } from 'core/component/interface/component/types';
import type { UnsafeGetter, UnsafeComponentInterface } from 'core/component/interface/component/unsafe';

/**
 * An abstract class that represents Vue compatible component API
 */
export abstract class ComponentInterface {
	/**
	 * Type: root component
	 */
	readonly Root!: ComponentInterface;

	/**
	 * Type: base super class for all components
	 */
	readonly Component!: ComponentInterface;

	/**
	 * Unique component string identifier
	 */
	readonly componentId!: string;

	/**
	 * Name of the component without special postfixes like `-functional`
	 */
	readonly componentName!: string;

	/**
	 * Link to a class instance that is used to describe the component.
	 * Basically, this parameter is used for `instanceof` checks and to get default values of properties.
	 * Mind, every kind of components has only the one instance of that kind,
	 * i.e. one instance is shared between components of the same type.
	 */
	readonly instance!: this;

	/**
	 * Name of the active component hook
	 */
	get hook(): Hook {
		return 'beforeRuntime';
	}

	/**
	 * Switches the component to a new hook
	 *
	 * @param value
	 * @emits `componentHook:{$value}(value: Hook, oldValue: Hook)`
	 * @emits `componentHookChange(value: Hook, oldValue: Hook)
	 */
	protected set hook(value: Hook) {
		// Loopback
	}

	/**
	 * Name of the active rendering group to use with async rendering
	 */
	readonly renderGroup?: string;

	/**
	 * API to invoke unsafely of internal properties of the component.
	 * This parameter helps to avoid TS errors of using protected properties and methods outside from the component class.
	 * It's useful to create component’ friendly classes.
	 */
	get unsafe(): UnsafeGetter<UnsafeComponentInterface<this>> {
		return Object.cast(this);
	}

	/**
	 * Link to a DOM element that is the root for the component
	 */
	readonly $el?: ComponentElement<this['Component']>;

	/**
	 * Raw parameters of the component with which it was created by an engine
	 */
	readonly $options!: ComponentOptions;

	/**
	 * Map of initialized input properties of the component
	 */
	readonly $props!: Dictionary;

	/**
	 * Link to the root component of the application
	 */
	readonly $root!: this['Root'];

	/**
	 * Link to a parent component of the current component
	 */
	readonly $parent?: this['Component'];

	/**
	 * Link to the closest non-functional parent component of the current component
	 */
	readonly $normalParent?: this['Component'];

	/**
	 * Link to a parent component if the current component was dynamically created and mounted
	 */
	readonly $remoteParent?: this['Component'];

	/**
	 * API of the used rendering engine
	 */
	readonly $renderEngine!: RenderEngine<any>;

	/**
	 * A link to the component meta object.
	 * This object contains all information of component properties, methods and other stuff.
	 * It's used to create a "real" component by the used engine and some optimizations based on reflect.
	 */
	protected readonly meta!: ComponentMeta;

	/**
	 * Number that increments on every re-rendering of the component
	 */
	protected renderCounter!: number;

	/**
	 * Temporary unique component string identifier for functional components
	 */
	protected readonly $componentId?: string;

	/**
	 * Map of watchable component properties that can force re-rendering
	 */
	protected readonly $fields!: Dictionary;

	/**
	 * Map of watchable component properties that can't force re-rendering
	 */
	protected readonly $systemFields!: Dictionary;

	/**
	 * Map of component properties that were modified and need to synchronize
	 * (only for functional components)
	 */
	protected readonly $modifiedFields!: Dictionary;

	/**
	 * Map of component attributes that aren't recognized as input properties
	 */
	protected readonly $attrs!: Dictionary<string>;

	/**
	 * Map of external listeners of component events
	 */
	protected readonly $listeners!: Dictionary<CanArray<Function>>;

	/**
	 * Map of references to elements that have a "ref" attribute
	 */
	protected readonly $refs!: Dictionary;

	/**
	 * Map of handlers that wait appearing of references to elements that have a "ref" attribute
	 */
	protected readonly $refHandlers!: Dictionary<Function[]>;

	/**
	 * Map of available render slots
	 */
	protected readonly $slots!: Slots;

	/**
	 * Name of the active property to initialize
	 */
	protected readonly $activeField?: string;

	/**
	 * Cache for component links
	 */
	protected readonly $syncLinkCache!: SyncLinkCache;

	/**
	 * API to tie and control async operations
	 */
	protected readonly $async!: Async<ComponentInterface>;

	/**
	 * Promise of the component initializing
	 */
	protected $initializer?: Promise<unknown>;

	/**
	 * Logs an event with the specified context
	 *
	 * @param ctxOrOpts - logging context or logging options (logLevel, context)
	 * @param [details] - event details
	 */
	log?(ctxOrOpts: string | LogMessageOptions, ...details: unknown[]): void;

	/**
	 * Activates the component.
	 * The deactivated component won't load data from providers during initializing.
	 *
	 * Basically, you don't need to think about the component activation,
	 * because it's automatically synchronized with `keep-alive` or the component prop.
	 *
	 * @param [force] - if true, then the component will be forced to activate, even if it is already activated
	 */
	activate(force?: boolean): void {}

	/**
	 * Deactivates the component.
	 * The deactivated component won't load data from providers during initializing.
	 *
	 * Basically, you don't need to think about the component activation,
	 * because it's automatically synchronized with `keep-alive` or the component prop.
	 */
	deactivate(): void {}

	/**
	 * Forces the component to re-render
	 */
	$forceUpdate(): void {}

	/**
	 * Executes the specified function on the next render tick
	 * @param cb
	 */
	$nextTick(cb: Function | BoundFn<this>): void;

	/**
	 * Returns a promise that will be resolved on the next render tick
	 */
	$nextTick(): Promise<void>;
	$nextTick(): CanPromise<void> {}

	/**
	 * Destroys the component
	 */
	protected $destroy(): void {}

	/**
	 * Sets a new reactive value to the specified property of an object
	 *
	 * @param object
	 * @param key
	 * @param value
	 */
	protected $set<T = unknown>(object: object, key: unknown, value: T): T {
		return value;
	}

	/**
	 * Deletes the specified reactive property from an object
	 *
	 * @param object
	 * @param key
	 */
	protected $delete(object: object, key: unknown): void {}

	/**
	 * Sets a watcher to a component/object property by the specified path
	 *
	 * @param path
	 * @param handler
	 * @param opts
	 */
	protected $watch<T = unknown>(
		path: WatchPath,
		opts: WatchOptions,
		handler: RawWatchHandler<this, T>
	): Nullable<Function>;

	/**
	 * Sets a watcher to a component/object property by the specified path
	 *
	 * @param path
	 * @param handler
	 */
	protected $watch<T = unknown>(
		path: WatchPath,
		handler: RawWatchHandler<this, T>
	): Nullable<Function>;

	/**
	 * Sets a watcher to the specified watchable object
	 *
	 * @param obj
	 * @param handler
	 */
	protected $watch<T = unknown>(
		obj: object,
		handler: RawWatchHandler<this, T>
	): Nullable<Function>;

	/**
	 * Sets a watcher to the specified watchable object
	 *
	 * @param obj
	 * @param handler
	 * @param opts
	 */
	protected $watch<T = unknown>(
		obj: object,
		opts: WatchOptions,
		handler: RawWatchHandler<this, T>
	): Nullable<Function>;

	protected $watch(): Nullable<Function> {
		return null;
	}

	/**
	 * Attaches a listener to the specified component event
	 *
	 * @param event
	 * @param handler
	 */
	protected $on<E = unknown, R = unknown>(event: CanArray<string>, handler: ProxyCb<E, R, this>): this {
		return this;
	}

	/**
	 * Attaches a disposable listener to the specified component event
	 *
	 * @param event
	 * @param handler
	 */
	protected $once<E = unknown, R = unknown>(event: string, handler: ProxyCb<E, R, this>): this {
		return this;
	}

	/**
	 * Detaches an event listeners from the component
	 *
	 * @param [event]
	 * @param [handler]
	 */
	protected $off(event?: CanArray<string>, handler?: Function): this {
		return this;
	}

	/**
	 * Emits a component event
	 *
	 * @param event
	 * @param args
	 */
	protected $emit(event: string, ...args: unknown[]): this {
		return this;
	}

	/**
	 * Hook handler: the component has been bound
	 * (only for functional components)
	 */
	protected onBindHook(): void {
		// Loopback
	}

	/**
	 * Hook handler: the component has been mounted
	 * (only for functional components)
	 */
	protected onInsertedHook(): void {
		// Loopback
	}

	/**
	 * Hook handler: the component has been updated
	 * (only for functional components)
	 */
	protected onUpdateHook(): void {
		// Loopback
	}

	/**
	 * Hook handler: the component has been unbound
	 * (only for functional components)
	 */
	protected onUnbindHook(): void {
		// Loopback
	}
}
