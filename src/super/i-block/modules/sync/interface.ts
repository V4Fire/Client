/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
import { AsyncOptions } from 'core/async';
import { WatchOptions } from 'core/component';

export type AsyncWatchOptions =
	WatchOptions & AsyncOptions;

export interface LinkWrapper<CTX extends iBlock = iBlock, V = unknown, R = unknown> {
	(this: CTX, value: V, oldValue?: V): R;
}

export type ModValueConverter<CTX extends iBlock = iBlock, V = unknown, R = unknown> =
	LinkWrapper<CTX, V, CanUndef<R>> |
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
