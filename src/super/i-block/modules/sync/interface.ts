/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { AsyncOptions } from 'core/async';
import { WatchOptions, WatchPath } from 'core/component';

import iBlock from 'super/i-block/i-block';

export type AsyncWatchOptions =
	WatchOptions & AsyncOptions;

export interface LinkWrapper<CTX extends iBlock = iBlock, V = unknown, R = unknown> {
	(this: CTX, value: V, oldValue?: V): R;
}

export type ModValueConverter<CTX extends iBlock = iBlock, V = unknown, R = unknown> =
	LinkWrapper<CTX, V, CanUndef<R>> |
	Function;

export type Link = string;
export type ObjectLink = WatchPath | object;
export type LinkContainer = string;

export type LinkDecl =
	Link |
	[LinkContainer, Link];

export type ObjectLinkDecl =
	ObjectLink |
	[LinkContainer, ObjectLink];

export type ObjectPropLink =
	Link |
	[Link] |
	[LinkContainer, ObjectLink] |
	[Link, LinkWrapper] |
	[LinkContainer, ObjectLink, LinkWrapper];

export type ObjectPropLinksDecl = ObjectPropLink[];
