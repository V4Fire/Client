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
	Parent extends Dictionary = {}
> = _InferEvents<FlatEvents<Scheme>, Parent>;

export type _InferEvents<
	Scheme extends any[],
	Parent extends Dictionary = {},
	Result extends Dictionary = {}
> = {
	0: _InferEvents<TB.Tail<Scheme>, Parent, (TB.Head<Scheme> extends [infer E, ...infer A] ? E extends string ? {
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

export type InferComponentEvents<
	Ctx,
	Scheme extends Array<[string, ...any[]]>,
	Parent extends Dictionary = {}
> = _InferComponentEvents<Ctx, FlatEvents<Scheme>, Parent>;

export type _InferComponentEvents<
	Ctx,
	Scheme extends any[],
	Parent extends Dictionary = {},
	Result extends Dictionary = {}
> = {
	0: _InferComponentEvents<
		Ctx,

		TB.Tail<Scheme>,

		Parent,

		(TB.Head<Scheme> extends [infer E, ...infer A] ? E extends string ? {
			on(event: `on${Capitalize<E>}`, cb: (...args: A) => void): void;
			on<T>(this: T, event: E | `${E}:component`, cb: (component: T, ...args: A) => void): void;

			once(event: `on${Capitalize<E>}`, cb: (...args: A) => void): void;
			once<T>(this: T, event: E | `${E}:component`, cb: (component: T, ...args: A) => void): void;

			promisifyOnce(event: `on${Capitalize<E>}`): Promise<CanUndef<TB.Head<A>>>;
			promisifyOnce<T>(this: T, event: E | `${E}:component`): Promise<CanUndef<T>>;

			off(event: E | `${E}:component` | `on${Capitalize<E>}` | string, handler?: Function): void;

			strictEmit(event: E | ComponentEvent<E>, ...args: A): void;
			emit(event: E | ComponentEvent<E>, ...args: A): void;
			emit(event: string | ComponentEvent, ...args: unknown[]): void;
		} : {} : {}) & Result>;

	1: Parent & Result;
}[TB.Length<Scheme> extends 0 ? 1 : 0];

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
