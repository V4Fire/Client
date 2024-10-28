/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ElementSize, Watcher, WatchLink } from 'core/dom/intersection-watcher/interface';

export interface ScrollPosition {
	top: number;
	left: number;
}

export interface ElementPosition extends ElementSize {
	top: number;
	left: number;
}

export interface WatcherPosition extends ElementPosition {
	watcher: Watcher;
}

export type RegisteredWatchers = Map<WatchLink, Writable<Watcher> | Set<Writable<Watcher>>>;
export type ObservableElements = Map<Element, RegisteredWatchers>;

export type PartialIOEntry = Pick<IntersectionObserverEntry, 'time'>;
