/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { LogLevel } from 'core/log';

export type InferEvents<
	Scheme extends Array<[string, ...any[]]>,
	Parent extends Dictionary = {},
	Result extends Dictionary = {}
> = {
	0: InferEvents<TB.Tail<Scheme>, Parent, (TB.Head<Scheme> extends [infer E, ...infer A] ? E extends string ? {
		on(event: E, cb: (...args: A) => void): void;
		once(event: E, cb: (...args: A) => void): void;
		promisifyOnce(event: E): Promise<CanUndef<TB.Head<A>>>;

		off(event: E | string, handler?: Function): void;

		strictEmit(event: E, ...args: A): void;
		emit(event: E, ...args: A): void;
		emit(event: string, ...args: unknown[]): void;
	} : {} : {}) & Result>;

	1: Result & Parent;
}[TB.Length<Scheme> extends 0 ? 1 : 0];

export interface ComponentEvent<E extends string = string> {
	event: E;
	logLevel?: LogLevel;
}

type UnionToIntersection<T> = (T extends any ? (k: T) => void : never) extends (k: infer R) => void ? R : never;

type EventToTuple<Event, Result extends any[] = []> =
	UnionToIntersection<Event extends any ? () => Event : never> extends (() => infer T) ?
		[...EventToTuple<Exclude<Event, T>, Result>, [T, ...Result]] :
		[];

export type FlatEvents<Events extends any[], Result extends any[] = []> = {
	0: TB.Head<Events> extends [infer E, ...infer A] ?
		FlatEvents<TB.Tail<Events>, [...EventToTuple<E, A>, ...Result]> :
		[];

	1: Result;
}[TB.Length<Events> extends 0 ? 1 : 0];

export type InferComponentEvents<
	Ctx,
	Scheme extends Array<[string, ...any[]]>,
	Parent extends Dictionary = {}
> = _InferComponentEvents<Ctx, FlatEvents<Scheme>, Parent>;

export type _InferComponentEvents<
	Ctx,
	Scheme extends any[],
	Parent extends Dictionary = {},
	Events extends any[] = [],
	Result extends Dictionary = {}
> = {
	0: _InferComponentEvents<
		Ctx,

		TB.Tail<Scheme>,

		Parent,

		TB.Head<Scheme> extends [infer E, ...infer A] ? [...Events, [E, ...A]] : Events,

		(TB.Head<Scheme> extends [infer E, ...infer A] ? E extends string ? {
			on(event: `on${Capitalize<E>}`, cb: (...args: A) => void): void;
			on(event: E | `${E}:component`, cb: (component: Ctx, ...args: A) => void): void;

			once(event: `on${Capitalize<E>}`, cb: (...args: A) => void): void;
			once(event: E | `${E}:component`, cb: (component: Ctx, ...args: A) => void): void;

			promisifyOnce(event: `on${Capitalize<E>}`): Promise<CanUndef<TB.Head<A>>>;
			promisifyOnce(event: E | `${E}:component`): Promise<CanUndef<Ctx>>;

			off(event: E | `${E}:component` | `on${Capitalize<E>}` | string, handler?: Function): void;

			strictEmit(event: E | ComponentEvent<E>, ...args: A): void;
			emit(event: E | ComponentEvent<E>, ...args: A): void;
			emit(event: string | ComponentEvent, ...args: unknown[]): void;
		} : {} : {}) & Result>;

	1: Parent extends {Events: infer ParentEvents} ? ParentEvents extends any[] ?
		Overwrite<
			Result & OverrideParentComponentEvents<Ctx, Parent, ParentEvents>,
			{Events: [...ParentEvents, ...Events]}
		> :

		Result & {Events: Events} : Result & {Events: Events};

}[TB.Length<Scheme> extends 0 ? 1 : 0];

export type OverrideParentComponentEvents<
	Ctx,
	Parent extends Dictionary,
	Events extends any[],
	Result extends Dictionary = {}
> = {
	0: TB.Head<Events> extends [infer E, ...infer A] ? E extends string ?
		OverrideParentComponentEvents<Ctx, Parent, TB.Tail<Events>, Result & {
			on(event: `on${Capitalize<E>}`, cb: (...args: A) => void): void;
			on(event: E | `${E}:component`, cb: (component: Ctx, ...args: A) => void): void;

			once(event: `on${Capitalize<E>}`, cb: (...args: A) => void): void;
			once(event: E | `${E}:component`, cb: (component: Ctx, ...args: A) => void): void;

			promisifyOnce(event: `on${Capitalize<E>}`): Promise<CanUndef<TB.Head<A>>>;
			promisifyOnce(event: E | `${E}:component`): Promise<CanUndef<Ctx>>;

			off(event: E | `${E}:component` | `on${Capitalize<E>}` | string, handler?: Function): void;

			strictEmit(event: E | ComponentEvent<E>, ...args: A): void;
			emit(event: E | ComponentEvent<E>, ...args: A): void;
			emit(event: string | ComponentEvent, ...args: unknown[]): void;
		}> : Result : Result;

	1: Result;
}[TB.Length<Events> extends 0 ? 1 : 0];
