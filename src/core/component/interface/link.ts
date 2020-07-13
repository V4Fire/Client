/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface SyncLink<T = unknown> {
	path: string;
	sync(value?: T): void;
}

export type SyncLinkCache<T = unknown> = Dictionary<
	Dictionary<SyncLink<T>>
>;
