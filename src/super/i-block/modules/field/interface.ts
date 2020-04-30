/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface FieldGetter<R = unknown, D = unknown> {
	(key: string, data: NonNullable<D>): R;
}
