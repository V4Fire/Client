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
	toPath(params?: Dictionary): string;
};

export type PageSchema<M extends Dictionary = Dictionary> = string | M & {
	path?: string;
};

export interface Router extends EventEmitter {
	page: string;
	routes: Dictionary<PageSchema>;
	id(page: string): string;
	push(page: string, info?: PageInfo): Promise<void>;
	replace(page: string, info?: PageInfo): Promise<void>;
	back(): void;
	forward(): void;
	go(pos: number): void;
}
