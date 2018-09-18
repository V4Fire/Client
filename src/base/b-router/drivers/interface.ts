/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { Key } from 'path-to-regexp';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

export type PageMeta<M extends Dictionary = Dictionary> = M & {
	page: string;
	path?: string;
	params: [Key];
	paramsFromQuery?: boolean;
};

export type PageSchema<M extends Dictionary = Dictionary> =
	string |
	PageMeta<M>;

export interface CurrentPage<
	P extends Dictionary = Dictionary,
	Q extends Dictionary = Dictionary,
	M extends Dictionary = Dictionary
> extends Dictionary {
	page: string;
	meta: PageMeta<M>;
	params: P;
	query: Q;
}

export interface PageInfo<
	P extends Dictionary = Dictionary,
	Q extends Dictionary = Dictionary,
	M extends Dictionary = Dictionary
> extends CurrentPage {
	toPath(params?: Dictionary): string;
}

export interface Router extends EventEmitter {
	page?: CurrentPage | undefined;
	routes: Dictionary<PageSchema>;
	id(page: string): string;
	push(page: string, info?: PageInfo): Promise<void>;
	replace(page: string, info?: PageInfo): Promise<void>;
	back(): void;
	forward(): void;
	go(pos: number): void;
}
