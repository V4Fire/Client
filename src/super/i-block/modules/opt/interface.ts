/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export type MemoizedLiteral<T = unknown> =
	Readonly<Dictionary<T>> |
	ReadonlyArray<T>;

export type IfOnceValue = 0 | 1 | 2;
