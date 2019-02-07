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
	paramsFromQuery?: boolean;
	paramsFromRoot?: boolean;
};

export type PageSchema<M extends Dictionary = Dictionary> = Dictionary<
	string |
	BasePageMeta<M>
>;

export type PageMeta<M extends Dictionary = Dictionary> = BasePageMeta<M> & {
	index: boolean;
	page: string;
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

export interface PageOpts<
	P extends Dictionary = Dictionary,
	Q extends Dictionary = Dictionary,
	M extends Dictionary = Dictionary
> extends CurrentPage<P, Q, M> {
	toPath(params?: Dictionary): string;
}

export interface Router<
	P extends Dictionary = Dictionary,
	Q extends Dictionary = Dictionary,
	M extends Dictionary = Dictionary
> extends EventEmitter {
	page?: CanUndef<CurrentPage<P, Q, M>>;
	routes: PageSchema<M>;
	id(page: string): string;
	push(page: string, info?: PageOpts<P, Q, M>): Promise<void>;
	replace(page: string, info?: PageOpts<P, Q, M>): Promise<void>;
	back(): void;
	forward(): void;
	go(pos: number): void;
}
