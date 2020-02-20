/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ComponentInterface } from 'core/component/interface';

export type Prop<T = unknown> =
	{(): T} |
	{new(...args: any[]): T & object} |
	{new(...args: string[]): Function};

export type PropType<T = unknown> = CanArray<
	Prop<T>
>;

export interface PropOptions<T = unknown> {
	type?: PropType<T>;
	required?: boolean;
	default?: T | null | undefined | (() => T | null | undefined);
	functional?: boolean;
	validator?(value: T): boolean;
}

export interface InitFieldFn<CTX extends ComponentInterface = ComponentInterface> {
	(ctx: CTX, data: Dictionary): unknown;
}

export interface MergeFieldFn<CTX extends ComponentInterface = ComponentInterface> {
	(ctx: CTX, oldCtx: CTX, field: string, link?: string): unknown;
}

export interface UniqueFieldFn<CTX extends ComponentInterface = ComponentInterface> {
	(ctx: CTX, oldCtx: CTX): unknown;
}

export interface SyncLink<T = unknown> {
	path: string;
	sync(value?: T): void;
}

export type SyncLinkCache<T = unknown> = Dictionary<
	Dictionary<SyncLink<T>>
>;
