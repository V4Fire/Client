/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Vue, { ComponentOptions, WatchOptions, VNode, CreateElement } from 'vue';
import { ScopedSlot } from 'vue/types/vnode';
import { ComponentMeta, Hooks } from 'core/component';

// tslint:disable:no-empty
// tslint:disable:typedef

export type VueElement<T> = Element & {vueComponent?: T};
export default class VueInterface<B = VueInterface<any, any>, R = VueInterface<any, any>, C extends B = B> {
	readonly hook!: Hooks;
	readonly instance!: this;
	readonly componentName!: string;
	readonly $el!: VueElement<C>;
	readonly $options!: ComponentOptions<Vue>;
	readonly $props!: Dictionary;
	readonly $children!: C[];
	readonly $parent!: C;
	readonly $root!: R;
	readonly $isServer!: boolean;
	protected readonly meta!: ComponentMeta;
	protected readonly $refs!: Dictionary<C | Element | C[] | Element[] | undefined>;
	protected readonly $slots!: Dictionary<VNode>;
	protected readonly $scopedSlots!: Dictionary<ScopedSlot>;
	protected readonly $data!: Dictionary;
	protected readonly $ssrContext!: any;
	protected readonly $vnode!: VNode;
	protected readonly $attrs!: Dictionary<string>;
	protected readonly $listeners!: Dictionary<Function | Function[]>;
	protected readonly $activeField!: string;
	protected $createElement!: CreateElement;

	// @ts-ignore
	protected $mount(elementOrSelector?: Element | string, hydrating?: boolean): this;
	protected $mount() {}

	protected $forceUpdate(): void {}
	protected $destroy(): void {}

	protected $set<T>(object: object, key: string, value: T): T;
	protected $set<T>(array: T[], key: number, value: T): T;
	protected $set() {}

	protected $delete(object: object, key: string): void;
	protected $delete<T>(array: T[], key: number): void;
	protected $delete() {}

	// @ts-ignore
	protected $watch(
		expr: string,
		cb: (this: this, n: any, o: any) => void,
		opts?: WatchOptions
	): (() => void);

	protected $watch<T>(
		fn: (this: this) => T,
		cb: (this: this, n: T, o: T) => void,
		opts?: WatchOptions
	): (() => void);

	protected $watch() {}

	// @ts-ignore
	protected $on(event: string | string[], cb: Function): this;
	protected $on() {}

	// @ts-ignore
	protected $once(event: string, cb: Function): this;
	protected $once() {}

	// @ts-ignore
	protected $off(event?: string | string[], cb?: Function): this;
	protected $off() {}

	// @ts-ignore
	protected $emit(event: string, ...args: any[]): this;
	protected $emit() {}

	protected $nextTick(cb: (this: this) => void): void;
	// @ts-ignore
	protected $nextTick(): Promise<void>;
	protected $nextTick() {}
}
