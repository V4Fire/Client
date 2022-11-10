/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend, { fakeMethods } from 'components/friends/friend';

import type * as api from 'components/friends/dom/api';

interface DOM {
	delegate: typeof api.delegate;
	delegateElement: typeof api.delegateElement;

	watchForIntersection: typeof api.watchForIntersection;
	watchForResize: typeof api.watchForResize;

	appendChild: typeof api.appendChild;
	replaceWith: typeof api.replaceWith;

	getComponent: typeof api.getComponent;
	renderTemporarily: typeof api.renderTemporarily;
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
}

export default DOM;
