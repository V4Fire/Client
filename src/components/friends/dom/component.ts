/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock, { ComponentElement } from 'components/super/i-block/i-block';

/**
 * Returns a component instance that is associated with the given DOM element
 *
 * @param el
 * @param [selector] - an additional CSS selector that the component root element must match
 *
 * @example
 * ```js
 * console.log(this.dom.getComponent(someElement)?.componentName);
 * console.log(this.dom.getComponent(someElement, '.b-form')?.componentName);
 * ```
 */
export function getComponent<T extends iBlock>(el: Element | ComponentElement<T>, selector?: string): CanNull<T>;

/**
 * Returns a component instance that is associated with a DOM element by the passed selector
 *
 * @param selector
 * @param [rootSelector] - an additional CSS selector that the component root element must match
 *
 * @example
 * ```js
 * console.log(this.dom.getComponent('.foo')?.componentName);
 * console.log(this.dom.getComponent('.foo__bar', '.b-form')?.componentName);
 * ```
 */
// eslint-disable-next-line @typescript-eslint/unified-signatures
export function getComponent<T extends iBlock>(selector: string, rootSelector?: string): CanNull<T>;

export function getComponent<T extends iBlock>(
	query: string | ComponentElement<T>,
	rootSelector: string = ''
): CanNull<T> {
	const q = Object.isString(query) ?
		document.body.querySelector<ComponentElement<T>>(query) :
		query;

	if (q != null) {
		if (rootSelector === '' && q.component?.instance instanceof iBlock) {
			return q.component;
		}

		const
			el = q.closest<ComponentElement<T>>(`.i-block-helper${rootSelector}`);

		if (el != null) {
			return el.component ?? null;
		}
	}

	return null;
}
