/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Vue, { ComponentOptions, WatchOptions, VNode, CreateElement } from 'vue';
import { ScopedSlot } from 'vue/types/vnode';
import { ComponentMeta } from 'core/component';

// tslint:disable:no-empty
// tslint:disable:typedef

export default class VueInterface<B = VueInterface<any, any>, R = VueInterface<any, any>> {
	readonly instance!: this;
	readonly selfName!: string;
	readonly $el!: HTMLElement;
	readonly $options!: ComponentOptions<Vue>;
	readonly $props!: Dictionary;
	readonly $children!: B[];
	readonly $parent!: B;
	readonly $root!: R;
	readonly $isServer!: boolean;
	protected readonly meta!: ComponentMeta;
	protected readonly $refs!: Dictionary<B | HTMLElement | B[] | HTMLElement[]>;
	protected readonly $slots!: Dictionary<VNode[]>;
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
		expOrFn: string,
		callback: (this: this, n: any, o: any) => void,
		options?: WatchOptions
	): (() => void);

	protected $watch<T>(
		expOrFn: (this: this) => T,
		callback: (this: this, n: T, o: T) => void,
		options?: WatchOptions
	): (() => void);

	protected $watch() {}

	// @ts-ignore
	protected $on(event: string | string[], callback: Function): this;
	protected $on() {}

	// @ts-ignore
	protected $once(event: string, callback: Function): this;
	protected $once() {}

	// @ts-ignore
	protected $off(event?: string | string[], callback?: Function): this;
	protected $off() {}

	// @ts-ignore
	protected $emit(event: string, ...args: any[]): this;
	protected $emit() {}

	protected $nextTick(callback: (this: this) => void): void;
	// @ts-ignore
	protected $nextTick(): Promise<void>;
	protected $nextTick() {}
}
