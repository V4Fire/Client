/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export type InferEvents<I extends Array<[string, ...any[]]>, R extends Dictionary = {}> = {
	0: InferEvents<TB.Tail<I>, (TB.Head<I> extends [infer E, ...infer A] ?
		E extends string ? {
			Args: {[K in E]: A};

			on(event: E, cb: (...args: A) => void): void;
			once(event: E, cb: (...args: A) => void): void;
			promisifyOnce(event: E): Promise<CanUndef<TB.Head<A>>>;

			off(event: E | string, handler?: Function): void;

			strictEmit(event: E, ...args: A): void;
			emit(event: E, ...args: A): void;
			emit(event: string, ...args: unknown[]): void;
		} : {} : {}) & R>;

	1: R;
}[TB.Length<I> extends 0 ? 1 : 0];

export type GetComponentEvents<R extends {Args: Record<string, any[]>}> =
	R extends {Args: Record<infer K, any[]>} ? K : never;

export type InferComponentEvents<
	C,
	I extends Array<[string, ...any[]]>,
	P extends Dictionary = {},
	R extends Dictionary = {}
> = {
	0: InferComponentEvents<C, TB.Tail<I>, P, (TB.Head<I> extends [infer E, ...infer A] ? E extends string ? {
		Args: {[K in E]: A};

		on(event: `on${Capitalize<E>}`, cb: (...args: A) => void): void;
		on(event: E | `${E}:component`, cb: (component: C, ...args: A) => void): void;

		once(event: `on${Capitalize<E>}`, cb: (...args: A) => void): void;
		once(event: E | `${E}:component`, cb: (component: C, ...args: A) => void): void;

		promisifyOnce(event: `on${Capitalize<E>}`): Promise<CanUndef<TB.Head<A>>>;
		promisifyOnce(event: E | `${E}:component`): Promise<CanUndef<C>>;

		off(event: E | `${E}:component` | `on${Capitalize<E>}` | string, handler?: Function): void;

		strictEmit(event: E | `${E}:component` | `on${Capitalize<E>}`, ...args: A): void;
		emit(event: E | `${E}:component` | `on${Capitalize<E>}`, ...args: A): void;
		emit(event: string, ...args: unknown[]): void;
	} : {} : {}) & R>;

	1: R & OverrideParentComponentEvents<C, P>;
}[TB.Length<I> extends 0 ? 1 : 0];

export type OverrideParentComponentEvents<C, P extends Dictionary, A = P['Args']> = A extends Record<string, any[]> ? {
	[E in keyof A]: E extends string ? {
		Args: A;

		on(event: `on${Capitalize<E>}`, cb: (...args: A[E]) => void): void;
		on(event: E | `${E}:component`, cb: (component: C, ...args: A[E]) => void): void;

		once(event: `on${Capitalize<E>}`, cb: (...args: A[E]) => void): void;
		once(event: E | `${E}:component`, cb: (component: C, ...args: A[E]) => void): void;

		promisifyOnce(event: `on${Capitalize<E>}`): Promise<CanUndef<TB.Head<A[E]>>>;
		promisifyOnce(event: E | `${E}:component`): Promise<CanUndef<C>>;

		off(event: E | `${E}:component` | `on${Capitalize<E>}` | string, handler?: Function): void;

		strictEmit(event: E | `${E}:component` | `on${Capitalize<E>}`, ...args: A[E]): void;
		emit(event: E | `${E}:component` | `on${Capitalize<E>}`, ...args: A[E]): void;
		emit(event: string, ...args: unknown[]): void;
	} : {};
}[keyof A] : {};
