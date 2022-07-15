/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { AsyncOptions } from 'core/async';
import type { WatchOptions, WatchPath } from 'core/component';

import type iBlock from 'super/i-block/i-block';

export type AsyncWatchOptions =
	WatchOptions & AsyncOptions;

export interface LinkGetter<CTX extends iBlock = iBlock, V = unknown, R = unknown> {
	(this: CTX, value: V, oldValue?: V): R;
}

export type ModValueConverter<CTX extends iBlock = iBlock, V = unknown, R = unknown> =
	LinkGetter<CTX, V, CanUndef<R>> |
	Function;

export type Link = string;
export type ObjectLink = WatchPath | object;
export type LinkContainer = string;

export type LinkDecl =
	ObjectLink |
	[LinkContainer, ObjectLink];

export type PropLink =
	Link |
	[Link] |
	[LinkContainer, ObjectLink] |
	[Link, LinkGetter] |
	[LinkContainer, ObjectLink, LinkGetter];

export type PropLinks = PropLink[];
