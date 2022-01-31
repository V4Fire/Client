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

import type { LogMessageOptions } from '/core/log';

import type Async from '/core/async';
import type { BoundFn, ProxyCb } from '/core/async';

import type {

	ComponentEngine,

	ComponentOptions,
	FunctionalComponentOptions,

	VNode,
	ScopedSlot,
	CreateElement

} from '/core/component/engines';

import type {

	Hook,
	ComponentMeta,
	SyncLinkCache,

	WatchPath,
	WatchOptions,
	RawWatchHandler,

	RenderEngine

} from '/core/component/interface';

/**
 * Component render function
 */
export type RenderFunction =
	ComponentOptions<ComponentEngine>['render'] | FunctionalComponentOptions['render'];

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

export interface RenderReason {
	value: unknown;
	oldValue: CanUndef<unknown>;
	path: unknown[];
}

/**
 * A helper structure to pack the unsafe interface:
 * it fixes some ambiguous TS warnings
 */
export type UnsafeGetter<U extends UnsafeComponentInterface = UnsafeComponentInterface> =
	Dictionary & U['CTX'] & U & {unsafe: any};

/**
 * Abstract class that represents Vue compatible component API
 */
export abstract class ComponentInterface {
	/**
	 * Type: base component
	 */
	readonly Component!: ComponentInterface;

	/**
	 * Type: root component
	 */
	readonly Root!: ComponentInterface;

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
	 * Name of the active rendering group
	 * (it's used with async rendering)
	 */
	readonly renderGroup?: string;

	/**
	 * API for unsafe invoking of internal properties of the component.
	 * It can be useful to create component' friendly classes.
	 */
	get unsafe(): UnsafeGetter<UnsafeComponentInterface<this>> {
		return Object.cast(this);
	}

	/**
	 * Link to a DOM element that is tied with the component
	 */
	// @ts-ignore (ts error)
	readonly $el?: ComponentElement<this['Component']>;

	/**
	 * Raw component options
	 */
	readonly $options!: ComponentOptions<ComponentEngine>;

	/**
	 * Dictionary with initialized input properties of the component
	 */
	readonly $props!: Dictionary;

	/**
	 * List of child components
	 */
	// @ts-ignore (ts error)
	readonly $children?: Array<this['Component']>;

	/**
	 * Link to the parent component
	 */
	// @ts-ignore (ts error)
	readonly $parent?: this['Component'];

	/**
	 * Link to the closest non-functional parent component
	 */
	readonly $normalParent?: this['Component'];

	/**
	 * Link to the root component
	 */
	readonly $root!: this['Root'];

	/**
	 * Description object of the used rendering engine
	 */
	readonly $renderEngine!: RenderEngine<any>;

	/**
	 * True if the component can be attached to a parent render function
	 */
	readonly isFlyweight?: boolean;

	/**
	 * Temporary unique component' string identifier
	 * (only for functional components)
	 */
	protected readonly $componentId?: string;

	/**
	 * Link to a component meta object
	 */
	protected readonly meta!: ComponentMeta;

	/**
	 * Value that increments on every re-rendering of the component
	 */
	protected renderCounter!: number;

	/**
	 * The last reason why the component was re-rendered.
	 * The `null` value is means that the component was re-rendered by using $forceUpdate.
	 */
	protected lastSelfReasonToRender?: Nullable<RenderReason>;

	/**
	 * Timestamp of the last component rendering
	 */
	protected lastTimeOfRender?: DOMHighResTimeStamp;

	/**
	 * Cache table for virtual nodes
	 */
	protected readonly renderTmp!: Dictionary<VNode>;

	/**
	 * The special symbol that is tied with async rendering
	 */
	protected readonly $asyncLabel!: symbol;

	/**
	 * Link to the parent component
	 * (using with async rendering)
	 */
	// @ts-ignore (ts error)
	protected readonly $remoteParent?: this['Component'];

	/**
	 * Internal API for async operations
	 */
	protected readonly $async!: Async<ComponentInterface>;

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
	 * The raw map of component fields that can't force re-rendering
	 */
	protected readonly $systemFields!: Dictionary;

	/**
	 * Map of fields and system fields that were modified and need to synchronize
	 * (only for functional components)
	 */
	protected readonly $modifiedFields!: Dictionary;

	/**
	 * Name of the active field to initialize
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
	 * The deactivated component won't load data from providers on initializing.
	 *
	 * Basically, you don't need to think about a component activation,
	 * because it's automatically synchronized with `keep-alive` or the special input property.
	 *
	 * @param [force] - if true, then the component will be forced to activate, even if it is already activated
	 */
	activate(force?: boolean): void {}

	/**
	 * Deactivates the component.
	 * The deactivated component won't load data from providers on initializing.
	 *
	 * Basically, you don't need to think about a component activation,
	 * because it's automatically synchronized with `keep-alive` or the special input property.
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
	 * Mounts the component to a DOM element
	 * @param elementOrSelector - link to an element or selector to an element
	 */
	protected $mount(elementOrSelector?: Element | string): this {
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
	 * Attaches an event listener to the specified component event
	 *
	 * @param event
	 * @param handler
	 */
	protected $on<E = unknown, R = unknown>(event: CanArray<string>, handler: ProxyCb<E, R, this>): this {
		return this;
	}

	/**
	 * Attaches a single event listener to the specified component event
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
	 * Hook handler: the component has been created
	 * (only for flyweight components)
	 */
	protected onCreatedHook(): void {
		// Loopback
	}

	/**
	 * Hook handler: the component has been bound
	 * (only for functional and flyweight components)
	 */
	protected onBindHook(): void {
		// Loopback
	}

	/**
	 * Hook handler: the component has been mounted
	 * (only for functional and flyweight components)
	 */
	protected onInsertedHook(): void {
		// Loopback
	}

	/**
	 * Hook handler: the component has been updated
	 * (only for functional and flyweight components)
	 */
	protected onUpdateHook(): void {
		// Loopback
	}

	/**
	 * Hook handler: the component has been unbound
	 * (only for functional and flyweight components)
	 */
	protected onUnbindHook(): void {
		// Loopback
	}
}

/**
 * A special interface to provide access to protected properties and methods outside the component.
 * It's used to create the "friendly classes" feature.
 */
export interface UnsafeComponentInterface<CTX extends ComponentInterface = ComponentInterface> {
	/**
	 * Type: context type
	 */
	readonly CTX: CTX;

	// Don't use referring from CTX for primitive types, because it breaks TS

	componentId: string;

	// @ts-ignore (access)
	$componentId: CTX['$componentId'];

	componentName: string;
	instance: this;

	// @ts-ignore (access)
	meta: CTX['meta'];
	hook: Hook;

	renderGroup: string;
	renderCounter: number;
	renderTmp: Dictionary<VNode>;

	lastSelfReasonToRender?: Nullable<RenderReason>;
	lastTimeOfRender?: DOMHighResTimeStamp;

	$asyncLabel: symbol;
	$activeField: CanUndef<string>;

	// @ts-ignore (access)
	$initializer: CTX['$initializer'];

	// @ts-ignore (access)
	$renderEngine: CTX['$renderEngine'];

	// @ts-ignore (access)
	$parent: CTX['$parent'];

	// @ts-ignore (access)
	$remoteParent: CTX['$remoteParent'];

	// @ts-ignore (access)
	$children: CTX['$children'];

	// @ts-ignore (access)
	$async: CTX['$async'];

	// @ts-ignore (access)
	$attrs: CTX['$attrs'];

	// @ts-ignore (access)
	$listeners: CTX['$listeners'];

	// @ts-ignore (access)
	$refs: CTX['$refs'];

	// @ts-ignore (access)
	$refHandlers: CTX['$refHandlers'];

	// @ts-ignore (access)
	$slots: CTX['$slots'];

	// @ts-ignore (access)
	$scopedSlots: CTX['$scopedSlots'];

	// @ts-ignore (access)
	$data: CTX['$data'];

	// @ts-ignore (access)
	$fields: CTX['$fields'];

	// @ts-ignore (access)
	$systemFields: CTX['$fields'];

	// @ts-ignore (access)
	$modifiedFields: CTX['$modifiedFields'];

	// @ts-ignore (access)
	$syncLinkCache: CTX['$syncLinkCache'];

	// @ts-ignore (access)
	$createElement: CTX['$createElement'];

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
	$forceUpdate: CTX['$forceUpdate'];

	// @ts-ignore (access)
	$nextTick: CTX['$nextTick'];

	// @ts-ignore (access)
	$destroy: CTX['$destroy'];

	// @ts-ignore (access)
	log: CTX['log'];

	// @ts-ignore (access)
	activate: CTX['activate'];

	// @ts-ignore (access)
	deactivate: CTX['deactivate'];

	// @ts-ignore (access)
	onCreatedHook: CTX['onCreatedHook'];

	// @ts-ignore (access)
	onBindHook: CTX['onBindHook'];

	// @ts-ignore (access)
	onInsertedHook: CTX['onInsertedHook'];

	// @ts-ignore (access)
	onUpdateHook: CTX['onUpdateHook'];

	// @ts-ignore (access)
	onUnbindHook: CTX['onUnbindHook'];

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
