/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { AsyncOptions } from 'core/async';

import type * as ResizeWatcher from 'core/dom/resize-watcher';
import type * as IntersectionWatcher from 'core/dom/intersection-watcher';

import Friend, { fakeMethods } from 'components/friends/friend';

import type iBlock from 'components/super/i-block/i-block';
import type { ComponentElement } from 'components/super/i-block/i-block';

import type { DOMModificationOptions, ElCb } from 'components/friends/dom/interface';

//#if runtime has dummyComponents
import('components/friends/dom/test/b-friends-dom-dummy');
//#endif

interface DOM {
	delegate<T extends Function>(selector: string, fn: T): T;
	delegateElement<T extends Function>(name: string, fn: T): T;

	watchForIntersection(el: Element, handler: IntersectionWatcher.WatchHandler): Function;
	watchForIntersection(
		el: Element,
		opts: IntersectionWatcher.WatchOptions & AsyncOptions,
		handler: IntersectionWatcher.WatchHandler
	): Function;

	watchForResize(el: Element, handler: ResizeWatcher.WatchHandler): Function;
	watchForResize(
		el: Element,
		opts: ResizeWatcher.WatchOptions & AsyncOptions,
		handler: ResizeWatcher.WatchHandler
	): Function;

	appendChild(
		parent: string | Node | DocumentFragment,
		node: Node,
		groupOrOptions?: string | DOMModificationOptions
	): Function | false;

	replaceWith(
		el: string | Element,
		newNode: Node,
		groupOrOptions?: string | DOMModificationOptions
	): Function | false;

	getComponent<T extends iBlock>(el: Element | ComponentElement<T>, selector?: string): CanNull<T>;

	// eslint-disable-next-line @typescript-eslint/unified-signatures
	getComponent<T extends iBlock>(selector: string, rootSelector?: string): CanNull<T>;

	renderTemporarily<T extends Friend['C']>(el: Element | string, cb: ElCb<T>): Promise<void>;
	renderTemporarily<T extends Friend['C']>(cb: ElCb<T>): Promise<void>;
}

@fakeMethods(
	'delegate',
	'delegateElement',

	'watchForIntersection',
	'watchForResize',

	'appendChild',
	'replaceWith',

	'getComponent',
	'renderTemporarily'
)

class DOM extends Friend {
	/**
	 * Takes a string identifier and returns a new identifier associated with the component.
	 * This method should use to generate id attributes for DOM nodes.
	 *
	 * @param id
	 *
	 * @example
	 * ```
	 * < div :id = dom.getId('bla')
	 * ```
	 */
	getId(id: string): string;
	getId(id: undefined | null): undefined;
	getId(id: Nullable<string>): CanUndef<string> {
		if (id == null) {
			return undefined;
		}

		return `${this.ctx.componentId}-${id}`;
	}

	/**
	 * Takes an identifier associated with the component and returns the original identifier
	 *
	 * @param componentAssociatedId
	 *
	 * @example
	 * ```
	 * dom.unwrapId(dom.getId('bla')) // 'bla'
	 * ```
	 */
	unwrapId(componentAssociatedId: string | null | undefined): CanUndef<string> {
		if (componentAssociatedId == null) {
			return undefined;
		}

		return componentAssociatedId.replace(`${this.ctx.componentId}-`, '');
	}
}

export default DOM;
