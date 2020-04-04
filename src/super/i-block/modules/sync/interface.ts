/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { AsyncOptions } from 'core/async';
import { WatchOptions } from 'core/component';

export type AsyncWatchOptions =
	WatchOptions & AsyncOptions;

export interface LinkWrapper<V = unknown, R = unknown> {
	(value: V, oldValue?: V): R;
}

export type ModValueConverter<V = unknown, R = unknown> =
	LinkWrapper<V, CanUndef<R>> |
	Function;

export type Link = string;
export type LinkContainer = string;

export type LinkDecl =
	Link |
	[LinkContainer, Link];

export type ObjectLink =
	Link |
	[Link] |
	[LinkContainer, Link] |
	[Link, LinkWrapper] |
	[LinkContainer, Link, LinkWrapper];

export type ObjectLinksDecl = ObjectLink[];
