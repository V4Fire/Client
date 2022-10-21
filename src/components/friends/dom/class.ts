/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend, { fakeMethods } from 'components/friends/friend';

import type * as wrappers from 'components/friends/dom/wrappers';
import type * as modifications from 'components/friends/dom/modification';
import type * as component from 'components/friends/dom/component';
import type * as helpers from 'components/friends/dom/helpers';

interface DOM {
	delegate: typeof wrappers.delegate;
	delegateElement: typeof wrappers.delegateElement;

	watchForIntersection: typeof wrappers.watchForIntersection;
	watchForResize: typeof wrappers.watchForResize;

	appendChild: typeof modifications.appendChild;
	replaceWith: typeof modifications.replaceWith;

	getComponent: typeof component.getComponent;
	renderTemporarily: typeof helpers.renderTemporarily;
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
