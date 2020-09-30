/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface KeyGetter<K = unknown, D = unknown> {
	(key: unknown, data: NonNullable<D>): K;
}

export interface ValueGetter<R = unknown, D = unknown> {
	(key: unknown, data: NonNullable<D>): R;
}
