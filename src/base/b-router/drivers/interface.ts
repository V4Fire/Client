/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { Key, RegExpOptions, ParseOptions } from 'path-to-regexp';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

export type BasePageMeta<M extends Dictionary = Dictionary> = M & {
	page?: string;
	path?: string;
	pathOpts?: RegExpOptions & ParseOptions;
	index?: boolean;
	alias?: string;
	redirect?: string;
	paramsFromRoot?: boolean;
	paramsFromQuery?: boolean;
};

export type PageSchema<M extends Dictionary = Dictionary> = Dictionary<
	string |
	BasePageMeta<M>
>;

export type PageMeta<M extends Dictionary = Dictionary> = BasePageMeta<M> & {
	page: string;
	index: boolean;
	params: Key[];
};

export interface CurrentPage<
	P extends Dictionary = Dictionary,
	Q extends Dictionary = Dictionary,
	M extends Dictionary = Dictionary
> extends Dictionary {
	page: string;
	url?: string;
	index: boolean;
	params: P;
	query: Q;
	meta: PageMeta<M>;
}

export interface PageInfo extends Dictionary {
	page?: string;
	url?: string;
	index?: boolean;
	params?: Dictionary;
	query?: Dictionary;
	meta?: Dictionary;
}

export interface Router<
	P extends Dictionary = Dictionary,
	Q extends Dictionary = Dictionary,
	M extends Dictionary = Dictionary
> extends EventEmitter {
	page?: CanUndef<CurrentPage<P, Q, M>>;
	routes: PageSchema<M>;
	id(page: string): string;
	push(page: string, info?: PageInfo): Promise<void>;
	replace(page: string, info?: PageInfo): Promise<void>;
	go(pos: number): void;
	forward(): void;
	back(): void;
}
