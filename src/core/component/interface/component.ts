/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// tslint:disable:no-empty
// tslint:disable:typedef

import Async from 'core/async';
import { LogMessageOptions } from 'core/log';

import {

	ComponentMeta,
	Hook,
	SyncLinkCache,

	WatchPath,
	WatchOptions,
	RawWatchHandler

} from 'core/component/interface';

import {

	ComponentDriver,

	ComponentOptions,
	FunctionalComponentOptions,

	CreateElement,
	ScopedSlot,
	VNode

} from 'core/component/engines';

/**
 * Component render function
 */
export type RenderFunction =
	ComponentOptions<ComponentDriver>['render'] |
	FunctionalComponentOptions['render'];

/**
 * Base context of a functional component
 */
export interface FunctionalCtx {
	componentName: string;
	meta: ComponentMeta;
	instance: Dictionary;
	$options: Dictionary;
}

export interface ComponentConstructor<T = unknown> {
	new(): T;
}

/**
 * DOM Element that is tied with a component
 */
export type ComponentElement<T = unknown> = Element & {
	component?: T;
};

export interface BindedFn<CTX extends ComponentInterface = ComponentInterface> {
	(this: CTX): any;
}

export interface RenderReason {
	value: unknown;
	oldValue: CanUndef<unknown>;
	path: unknown[];
}

export interface UnsafeComponentInterface<CTX extends ComponentInterface = ComponentInterface> {
	renderCounter: number;
	lastSelfReasonToRender?: Nullable<RenderReason>;
	lastTimeOfRender?: DOMHighResTimeStamp;
	renderTmp: Dictionary<VNode>;

	$asyncLabel: symbol;
	$activeField: CanUndef<string>;

	// @ts-ignore (access)
	meta: CTX['meta'];

	// @ts-ignore (access)
	$async: CTX['$async'];

	// @ts-ignore (access)
	$attrs: CTX['$attrs'];

	// @ts-ignore (access)
	$fields: CTX['$fields'];

	// @ts-ignore (access)
	$systemFields: CTX['$fields'];

	// @ts-ignore (access)
	$modifiedFields: CTX['$modifiedFields'];

	// @ts-ignore (access)
	$unregisteredHooks: CTX['$unregisteredHooks'];

	// @ts-ignore (access)
	$syncLinkCache: CTX['$syncLinkCache'];

	// @ts-ignore (access)
	$refs: CTX['$refs'];

	// @ts-ignore (access)
	$remoteParent: CTX['$remoteParent'];

	// @ts-ignore (access)
	$watch: CTX['$watch'];

	// @ts-ignore (access)
	$on: CTX['$on'];

	// @ts-ignore (access)
	$once: CTX['$once'];

	// @ts-ignore (access)
	$off: CTX['$off'];

	// @ts-ignore (access)
	$emit: CTX['$emit'];

	// @ts-ignore (access)
	$set: CTX['$set'];

	// @ts-ignore (access)
	$delete: CTX['$delete'];

	// @ts-ignore (access)
	$createElement: CTX['$createElement'];

	// @ts-ignore (access)
	$destroy: CTX['$destroy'];

	// Internal render helpers

	// @ts-ignore (access)
	_c: CTX['$createElement'];

	_o: Function;
	_q: Function;
	_s: Function;
	_v: Function;
	_e: Function;
	_f: Function;
	_n: Function;
	_i: Function;
	_m: Function;
	_l: Function;
	_g: Function;
	_k: Function;
	_b: Function;
	_t: Function;
	_u: Function;
}

export type UnsafeGetter<U extends UnsafeComponentInterface> = U extends UnsafeComponentInterface<infer CTX> ?
	U & {-readonly [K in keyof CTX]: K extends 'unsafe' ? never : CTX[K]} : U;

/**
 * Abstract class represents Vue compatible component API
 */
export abstract class ComponentInterface<
	C extends ComponentInterface = ComponentInterface<any, any>,
	R extends ComponentInterface = ComponentInterface<any, any>
> {
	/**
	 * Unique component string identifier
	 */
	readonly componentId!: string;

	/**
	 * Name of the component without special postfixes
	 */
	readonly componentName!: string;

	/**
	 * Link to a component instance
	 */
	readonly instance!: this;

	/**
	 * Name of an active component hook
	 */
	readonly hook!: Hook;

	/**
	 * True if the component shouldn't be destroyed after removal from DOM
	 * (only for functional components)
	 */
	readonly keepAlive!: boolean;

	/**
	 * Name of an active render group
	 * (it is used with async rendering)
	 */
	readonly renderGroup?: string;

	/**
	 * API to unsafe invoke of internal properties of the component.
	 * It can be useful to create friendly classes for a component.
	 */
	// @ts-ignore
	readonly unsafe!: UnsafeGetter<UnsafeComponentInterface<this>>;

	/**
	 * Link to a DOM element that is tied with the component
	 */
	readonly $el!: ComponentElement<C>;

	/**
	 * Map of raw component options
	 */
	readonly $options!: ComponentOptions<ComponentDriver>;

	/**
	 * Map of initialized component input properties
	 */
	readonly $props!: Dictionary;

	/**
	 * List of child components
	 */
	readonly $children?: C[];

	/**
	 * Link to a parent component
	 */
	readonly $parent?: C;

	/**
	 * Link to the closest non functional parent component
	 */
	readonly $normalParent?: C;

	/**
	 * Link to the root component
	 */
	readonly $root!: R;

	/**
	 * True if the component can attach to a parent render function
	 */
	readonly isFlyweight?: boolean;

	/**
	 * Link to the component meta object
	 */
	protected readonly meta!: ComponentMeta;

	/**
	 * Value that increments on every re-rendering of the component
	 */
	protected renderCounter!: number;

	/**
	 * Last reason why the component was re-rendered.
	 * The null value is means that the component was re-rendered by using $forceUpdate.
	 */
	protected lastSelfReasonToRender?: Nullable<RenderReason>;

	/**
	 * Timestamp of last component rendering
	 */
	protected lastTimeOfRender?: DOMHighResTimeStamp;

	/**
	 * Cache table for virtual nodes
	 */
	protected readonly renderTmp!: Dictionary<VNode>;

	/**
	 * Link to a parent component
	 * (using with async rendering)
	 */
	protected readonly $remoteParent?: C;

	/**
	 * The special symbol that is tied with async rendering
	 */
	protected readonly $asyncLabel!: symbol;

	/**
	 * Internal API for async operations
	 */
	protected readonly $async!: Async<ComponentInterface>;

	/**
	 * Map of component attributes that isn't recognised as an input property
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
	protected readonly $slots!: Dictionary<VNode>;

	/**
	 * Map of available scoped render slots
	 */
	protected readonly $scopedSlots!: Dictionary<ScopedSlot>;

	/**
	 * Map of component fields that can force re-rendering
	 */
	protected readonly $data!: Dictionary;

	/**
	 * The raw map of component fields that can force re-rendering
	 */
	protected readonly $fields!: Dictionary;

	/**
	 * @deprecated
	 * @see [[ComponentInterface.$fields]]
	 */
	protected readonly $$data!: Dictionary;

	/**
	 * The raw map of component fields that can force re-rendering
	 */
	protected readonly $systemFields!: Dictionary;

	/**
	 * Map of fields and system fields that were modified and need to synchronize
	 * (only for functional components)
	 */
	protected readonly $modifiedFields!: Dictionary;

	/**
	 * Map of hook listeners that were already unregistered
	 * (only for functional components)
	 */
	protected readonly $unregisteredHooks!: Dictionary<boolean>;

	/**
	 * Name of an active field to initialize
	 */
	protected readonly $activeField?: string;

	/**
	 * Cache for component links
	 */
	protected readonly $syncLinkCache!: SyncLinkCache;

	/**
	 * Link to a function that creates virtual nodes
	 */
	protected $createElement!: CreateElement;

	/**
	 * Logs an event with the specified context
	 *
	 * @param ctxOrOpts - logging context or logging options (logLevel, context)
	 * @param [details] - event details
	 */
	log?(ctxOrOpts: string | LogMessageOptions, ...details: unknown[]): void;

	/**
	 * Forces the component to re-render
	 */
	$forceUpdate(): void {}

	/**
	 * Executes the specified function on a next render tick
	 * @param cb
	 */
	$nextTick(cb: Function | BindedFn<this>): void;

	/**
	 * Returns a promise that will be resolved on a next render tick
	 */
	$nextTick(): Promise<void>;
	$nextTick(): CanPromise<void> {}

	/**
	 * Mounts the component to a DOM element
	 * @param elementOrSelector - link to an element or a selector to an element
	 */
	protected $mount(elementOrSelector?: Element | string) {
		return this;
	}

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
	 * Sets a watcher to a component property by the specified path
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
	 * Sets a watcher to a component property by the specified path
	 *
	 * @param path
	 * @param handler
	 */
	protected $watch<T = unknown>(
		path: WatchPath,
		handler: RawWatchHandler<this, T>
	): Nullable<Function>;

	protected $watch() {
		return null;
	}

	/**
	 * Attaches an event listener to the specified component event
	 *
	 * @param event
	 * @param cb
	 */
	protected $on(event: CanArray<string>, cb: Function): this {
		return this;
	}

	/**
	 * Attaches a single event listener to the specified component event
	 *
	 * @param event
	 * @param cb
	 */
	protected $once(event: string, cb: Function): this {
		return this;
	}

	/**
	 * Detaches an event listeners from the component
	 *
	 * @param [event]
	 * @param [cb]
	 */
	protected $off(event?: CanArray<string>, cb?: Function): this {
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
}
