/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import Vue, { ComponentOptions, WatchOptions, WatchOptionsWithHandler, VNode, CreateElement } from 'vue';
import { ScopedSlot } from 'vue/types/vnode';
import { ComponentMeta, Hooks } from 'core/component';

// tslint:disable:no-empty
// tslint:disable:typedef

export type VueElement<T = unknown> = Element & {vueComponent?: T};
export default class VueInterface<
	C extends VueInterface = VueInterface<any, any>,
	R extends VueInterface = VueInterface<any, any>
> {
	readonly hook!: Hooks;
	readonly instance!: this;
	readonly componentName!: string;
	readonly keepAlive!: boolean;
	readonly $el!: VueElement<C>;
	readonly $options!: ComponentOptions<Vue>;
	readonly $props!: Dictionary;
	readonly $children?: C[];
	readonly $parent?: C;
	readonly $normalParent?: C;
	readonly $root!: R | any;
	readonly $isServer!: boolean;
	protected readonly $async!: Async<VueInterface>;
	protected readonly meta!: ComponentMeta;
	protected readonly $refs!: Dictionary;
	protected readonly $slots!: Dictionary<VNode>;
	protected readonly $scopedSlots!: Dictionary<ScopedSlot>;
	protected readonly $data!: Dictionary;
	protected readonly $$data!: Dictionary;
	protected readonly $ssrContext!: unknown;
	protected readonly $vnode!: VNode;
	protected readonly $attrs!: Dictionary<string>;
	protected readonly $listeners!: Dictionary<Function | Function[]>;
	protected readonly $activeField!: string;
	protected $createElement!: CreateElement;

	protected log?(key: string, ...details: unknown[]): void;

	// @ts-ignore
	protected $mount(elementOrSelector?: Element | string, hydrating?: boolean): this;
	protected $mount() {}

	protected $forceUpdate(): void {}
	protected $destroy(): void {}

	protected $set<T = unknown>(object: object, key: string, value: T): T;
	protected $set<T = unknown>(array: T[], key: number, value: T): T;
	protected $set() {}

	protected $delete(object: object, key: string): void;
	protected $delete<T = unknown>(array: T[], key: number): void;
	protected $delete() {}

	// @ts-ignore
	protected $watch<T = unknown>(
		exprOrFn: string | ((this: this) => string),
		cb: (this: this, n: T, o?: T) => void,
		opts?: WatchOptions
	): Function;

	// @ts-ignore
	protected $watch<T = unknown>(
		exprOrFn: string | ((this: this) => string),
		opts: WatchOptionsWithHandler<T>
	): Function;

	protected $watch() {}

	// @ts-ignore
	protected $on(event: CanArray<string>, cb: Function): this;
	protected $on() {}

	// @ts-ignore
	protected $once(event: string, cb: Function): this;
	protected $once() {}

	// @ts-ignore
	protected $off(event?: CanArray<string>, cb?: Function): this;
	protected $off() {}

	// @ts-ignore
	protected $emit(event: string, ...args: unknown[]): this;
	protected $emit() {}

	protected $nextTick(cb: Function | ((this: this) => void)): void;
	// @ts-ignore
	protected $nextTick(): Promise<void>;
	protected $nextTick() {}
}
