/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { EventEmitter2 as EventEmitter } from 'eventemitter2';

export type PageInfo<
	P extends Dictionary = Dictionary,
	Q extends Dictionary = Dictionary,
	M extends Dictionary = Dictionary
> = Dictionary & {
	page: string;
	params: P;
	query: Q;
	meta: M;
};

export type PageSchema<M extends Dictionary = Dictionary> = string | M & {
	path?: string;
};

export interface Router extends EventEmitter {
	page: string;
	routes: Dictionary<PageSchema>;
	id(page: string): string;
	load(page: string, info?: PageInfo): Promise<void>;
}
