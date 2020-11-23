/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface Module extends Dictionary {
	id?: unknown;
	status?: 'pending' | 'loaded' | 'failed';
	import?: unknown;
	promise?: CanArray<Promise<unknown>>;
	load(): Array<Promise<unknown>>;
}
