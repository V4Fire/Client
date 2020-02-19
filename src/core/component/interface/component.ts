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
import { ComponentMeta, Hook, SyncLinkCache, WatchExpr, RawWatchHandler } from 'core/component/interface';

import {

	ComponentDriver,
	ComponentOptions,
	FunctionalComponentOptions,

	WatchOptions,
	WatchOptionsWithHandler,

	CreateElement,
	VNode,
	ScopedSlot

} from 'core/component/engines';

/**
 * Component render function
 */
export type RenderFunction = ComponentOptions<ComponentDriver>['render'] | FunctionalComponentOptions['render'];

/**
 * Base context of a functional component
 */
export interface FunctionalCtx {
	componentName: string;
	meta: ComponentMeta;
	instance: Dictionary;
	$options: Dictionary;
}

/**
 * DOM Element that is tied with a component
 */
export type ComponentElement<T = unknown> = Element & {
	component?: T;
};

/**
 * Abstract class that represents Vue compatible component API
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
	 * True if the component shouldn't destroyed after removal from DOM
	 * (only for functional components)
	 */
	readonly keepAlive!: boolean;

	/**
	 * Name of an active render group
	 * (using with async rendering)
	 */
	readonly renderGroup?: string;

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
	 * True if the component is rendered using SSR
	 */
	readonly $isServer!: boolean;

	/**
	 * True if the component can attach to a parent render function
	 */
	readonly $isFlyweight?: boolean;

	/**
	 * Link to the component meta object
	 */
	protected readonly meta!: ComponentMeta;

	/**
	 * Cache table for virtual nodes
	 */
	protected readonly renderTmp!: Dictionary<VNode>;

	/**
	 * Link to a parent component
	 * (using with async rendering)
	 */
	protected readonly $$parent?: C;

	/**
	 * Special symbol that is tied with async rendering
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
	protected readonly $listeners!: Dictionary<Function | Function[]>;

	/**
	 * Map of references to elements that have a "ref" attribute
	 */
	protected readonly $refs!: Dictionary;

	/**
	 * Map of handlers that wait appearing of references to elements that have a "ref" attribute
	 */
	protected readonly $$refs!: Dictionary<Function[]>;

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
	 * Raw map of component fields that can force re-rendering
	 */
	protected readonly $$data!: Dictionary;

	/**
	 * Cache object for component fields
	 */
	protected readonly $dataCache!: Dictionary;

	/**
	 * Name of an active field to initialize
	 */
	protected readonly $activeField?: string;

	/**
	 * Cache for component links
	 */
	protected readonly $syncLinkCache!: SyncLinkCache;

	/**
	 * Context for SSR rendering
	 */
	protected readonly $ssrContext!: unknown;

	/**
	 * Link to a virtual node that is tied with the component
	 */
	protected readonly $vnode!: VNode;

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
	$nextTick(cb: Function | ((this: this) => void)): void;

	// @ts-ignore (abstract)
	$nextTick(): Promise<void>;
	$nextTick() {}

	/**
	 * Mounts the component to a DOM element
	 *
	 * @param elementOrSelector - link to an element or a selector to an element
	 * @param [hydrating]
	 */
	// @ts-ignore (abstract)
	protected $mount(elementOrSelector?: Element | string, hydrating?: boolean): this;
	protected $mount() {}

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
	protected $set<T = unknown>(object: object, key: string, value: T): T;

	/**
	 * Sets a new reactive value to the specified index of an array
	 *
	 * @param array
	 * @param key
	 * @param value
	 */
	protected $set<T = unknown>(array: T[], key: number, value: T): T;
	protected $set() {}

	/**
	 * Deletes the specified reactive property from an object
	 *
	 * @param object
	 * @param key
	 */
	protected $delete(object: object, key: string): void;

	/**
	 * Deletes the specified reactive value from an array
	 *
	 * @param array
	 * @param key
	 */
	protected $delete<T = unknown>(array: T[], key: number): void;
	protected $delete() {}

	/**
	 * Sets a watcher to specified expression
	 *
	 * @param exprOrFn
	 * @param cb
	 * @param opts
	 */
	// @ts-ignore (abstract)
	protected $watch<T = unknown>(
		exprOrFn: WatchExpr<this>,
		cb: RawWatchHandler<this, T>,
		opts?: WatchOptions
	): Function;

	protected $watch<T = unknown>(
		exprOrFn: WatchExpr<this>,
		opts: WatchOptionsWithHandler<T>
	): Function;

	protected $watch() {}

	/**
	 * Sets a watcher to specified expression.
	 * The method wraps the "native" $watch and added some extra features.
	 *
	 * @param exprOrFn
	 * @param opts
	 */
	// @ts-ignore (abstract)
	protected $$watch?<T = unknown>(
		exprOrFn: WatchExpr<this>,
		opts: WatchOptionsWithHandler<T>
	): Function;

	protected $$watch() {}

	/**
	 * Attaches an event listener to the specified component event
	 *
	 * @param event
	 * @param cb
	 */
	// @ts-ignore (abstract)
	protected $on(event: CanArray<string>, cb: Function): this;
	protected $on() {}

	/**
	 * Attaches a single event listener to the specified component event
	 *
	 * @param event
	 * @param cb
	 */
	// @ts-ignore (abstract)
	protected $once(event: string, cb: Function): this;
	protected $once() {}

	/**
	 * Detaches the specified event listeners from the component
	 *
	 * @param [event]
	 * @param [cb]
	 */
	// @ts-ignore (abstract)
	protected $off(event?: CanArray<string>, cb?: Function): this;
	protected $off() {}

	/**
	 * Emits a component event
	 *
	 * @param event
	 * @param args
	 */
	// @ts-ignore (abstract)
	protected $emit(event: string, ...args: unknown[]): this;
	protected $emit() {}
}
