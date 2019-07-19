/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { Key, RegExpOptions, ParseOptions } from 'path-to-regexp';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

export type BasePageMeta<M extends object = Dictionary> = M & {
	page?: string;
	path?: string;
	pathOpts?: RegExpOptions & ParseOptions;
	index?: boolean;
	alias?: string;
	redirect?: string;
	paramsFromRoot?: boolean;
	paramsFromQuery?: boolean;
	autoScroll?: boolean;
	scroll?: {
		x?: number;
		y?: number;
	};
};

export type PageSchema<M extends object = Dictionary> = Dictionary<
	string |
	BasePageMeta<M>
>;

export type PageMeta<M extends object = Dictionary> = BasePageMeta<M> & {
	page: string;
	index: boolean;
	params: Key[];
};

export interface CurrentPage<
	P extends object = Dictionary,
	Q extends object = Dictionary,
	M extends object = Dictionary
> extends Dictionary {
	url?: string;
	page: string;
	index: boolean;
	params: P;
	query: Q;
	meta: PageMeta<M>;
}

export interface PageInfo extends Dictionary {
	url?: string;
	page?: string;
	index?: boolean;
	params?: Dictionary;
	query?: Dictionary;
	meta?: Dictionary;
}

export interface HistoryClearFilter {
	(page: PageInfo): unknown;
}

export interface Router<
	P extends object = Dictionary,
	Q extends object = Dictionary,
	M extends object = Dictionary
> extends EventEmitter {
	readonly page?: CanUndef<CurrentPage<P, Q, M>>;
	readonly history: PageInfo[];
	readonly routes?: PageSchema<M>;
	id(page: string): string;
	push(page: string, info?: PageInfo): Promise<void>;
	replace(page: string, info?: PageInfo): Promise<void>;
	go(pos: number): void;
	forward(): void;
	back(): void;
	clear(filter?: HistoryClearFilter): Promise<void>;
	clearTmp(): Promise<void>;
}
