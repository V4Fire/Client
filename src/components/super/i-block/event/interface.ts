/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export type InferComponentEvents<C, I extends Array<[string, ...any[]]>, R extends Dictionary = {}> = {
	0: InferComponentEvents<C, TB.Tail<I>, Omit<R, 'Events'> &
		(TB.Head<I> extends [infer E, ...infer A] ? E extends string ? {
			Args: {[K in E]: A};

			on(event: `on${Capitalize<E>}`, cb: (...args: A) => void): void;
			on(event: E | `${E}:component`, cb: (component: C, ...args: A) => void): void;

			once(event: `on${Capitalize<E>}`, cb: (...args: A) => void): void;
			once(event: E | `${E}:component`, cb: (component: C, ...args: A) => void): void;

			promisifyOnce(event: `on${Capitalize<E>}`): Promise<CanUndef<TB.Head<A>>>;
			promisifyOnce(event: E | `${E}:component`): Promise<CanUndef<C>>;

			off(event: E | `${E}:component` | `on${Capitalize<E>}` | string, handler?: Function): void;

			emit(event: E | `${E}:component` | `on${Capitalize<E>}`, ...args: A): void;
			emit(event: string, ...args: unknown[]): void;
		} : {} : {})>;

	1: Omit<R, 'Events'> & {Events: keyof R['Args']};
}[TB.Length<I> extends 0 ? 1 : 0];

export type InferEvents<C, I extends Array<[string, ...any[]]>, R extends Dictionary = {}> = {
	0: InferComponentEvents<C, TB.Tail<I>, Omit<R, 'Events'> & (TB.Head<I> extends [infer E, ...infer A] ?
		E extends string ? {
			Args: {[K in E]: A};

			on(event: E, cb: (component: C, ...args: A) => void): void;
			once(event: E, cb: (component: C, ...args: A) => void): void;
			promisifyOnce(event: E): Promise<CanUndef<C>>;

			off(event: E | string, handler?: Function): void;

			emit(event: E, ...args: A): void;
			emit(event: string, ...args: unknown[]): void;
		} : {} : {})>;

	1: Omit<R, 'Events'> & {Events: keyof R['Args']};
}[TB.Length<I> extends 0 ? 1 : 0];
