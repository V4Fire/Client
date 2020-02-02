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

import {

	ComponentDriver,
	ComponentOptions,

	WatchOptions,
	WatchOptionsWithHandler,

	CreateElement,
	VNode,
	ScopedSlot

} from 'core/component/engines';

import { ComponentMeta } from 'core/component/interface/meta';
import { Hook, SyncLinkCache } from 'core/component/interface/other';

export type ComponentElement<T = unknown> = Element & {
	component?: T;
};

export abstract class ComponentInterface<
	C extends ComponentInterface = ComponentInterface<any, any>,
	R extends ComponentInterface = ComponentInterface<any, any>
> {
	readonly componentId!: string;
	readonly componentName!: string;
	readonly globalName?: string;

	readonly instance!: this;
	readonly hook!: Hook;
	readonly keepAlive!: boolean;
	readonly renderGroup?: string;

	readonly $el!: ComponentElement<C>;
	readonly $options!: ComponentOptions<ComponentDriver>;
	readonly $props!: Dictionary;
	readonly $children?: C[];
	readonly $parent?: C;
	readonly $normalParent?: C;
	readonly $root!: R | any;

	readonly $isServer!: boolean;
	readonly $isFlyweight?: boolean;

	protected readonly meta!: ComponentMeta;
	protected readonly renderTmp!: Dictionary<VNode>;

	protected readonly $$parent?: C;
	protected readonly $asyncLabel!: symbol;
	protected readonly $async!: Async<ComponentInterface>;

	protected readonly $refs!: Dictionary;
	protected readonly $$refs!: Dictionary<Function[]>;
	protected readonly $slots!: Dictionary<VNode>;
	protected readonly $scopedSlots!: Dictionary<ScopedSlot>;

	protected readonly $data!: Dictionary;
	protected readonly $$data!: Dictionary;
	protected readonly $dataCache!: Dictionary;

	protected readonly $attrs!: Dictionary<string>;
	protected readonly $listeners!: Dictionary<Function | Function[]>;

	protected readonly $activeField?: string;
	protected readonly $syncLinkCache!: SyncLinkCache;

	protected readonly $ssrContext!: unknown;
	protected readonly $vnode!: VNode;
	protected $createElement!: CreateElement;

	protected log?(key: string, ...details: unknown[]): void;

	// @ts-ignore (abstract)
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

	// @ts-ignore (abstract)
	protected $watch<T = unknown>(
		exprOrFn: string | ((this: this) => string),
		cb: (this: this, n: T, o?: T) => void,
		opts?: WatchOptions
	): Function;

	protected $watch<T = unknown>(
		exprOrFn: string | ((this: this) => string),
		opts: WatchOptionsWithHandler<T>
	): Function;

	protected $watch() {}

	// @ts-ignore (abstract)
	protected $$watch?<T = unknown>(
		exprOrFn: string | ((this: this) => string),
		opts: WatchOptionsWithHandler<T>
	): Function;

	protected $$watch() {}

	// @ts-ignore (abstract)
	protected $on(event: CanArray<string>, cb: Function): this;
	protected $on() {}

	// @ts-ignore (abstract)
	protected $once(event: string, cb: Function): this;
	protected $once() {}

	// @ts-ignore (abstract)
	protected $off(event?: CanArray<string>, cb?: Function): this;
	protected $off() {}

	// @ts-ignore (abstract)
	protected $emit(event: string, ...args: unknown[]): this;
	protected $emit() {}

	protected $nextTick(cb: Function | ((this: this) => void)): void;

	// @ts-ignore (abstract)
	protected $nextTick(): Promise<void>;
	protected $nextTick() {}
}
