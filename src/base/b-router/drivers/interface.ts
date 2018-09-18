/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { Key } from 'path-to-regexp';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

export interface BasePageMeta extends Dictionary {
	page?: string;
	path?: string;
	paramsFromQuery?: boolean;
}

export type PageSchema = Dictionary<
	string |
	BasePageMeta
>;

export interface PageMeta extends BasePageMeta {
	page: string;
	params: Key[];
}

export interface CurrentPage extends Dictionary {
	page: string;
	meta: PageMeta;
	params: Dictionary;
	query: Dictionary;
}

export interface PageInfo extends CurrentPage {
	toPath(params?: Dictionary): string;
}

export interface Router extends EventEmitter {
	page?: CurrentPage | undefined;
	routes: PageSchema;
	id(page: string): string;
	push(page: string, info?: PageInfo): Promise<void>;
	replace(page: string, info?: PageInfo): Promise<void>;
	back(): void;
	forward(): void;
	go(pos: number): void;
}
