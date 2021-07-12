/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/dom/README.md]]
 * @packageDocumentation
 */

import { deprecate } from 'core/functools/deprecation';

/**
 * Wraps the specified function as an event handler with delegation.
 * This function can be used as a decorator or as a simple function.
 *
 * The event object will contain a link to the element to which we are delegating the handler
 * by a property `delegateTarget`.
 *
 * @param selector - selector to delegate
 * @param [fn]
 *
 * @example
 * ```js
 * // Attaches an event listener to the document,
 * // but the event will be caught only on h1 tags
 * document.addEventListener('click', wrapAsDelegateHandler('h1', () => {
 *   console.log('Boom!');
 * }));
 *
 * class Foo {
 *   // Using the function as a decorator
 *   @wrapAsDelegateHandler('h1')
 *   onH1Click() {
 *     console.log('Boom!');
 *   }
 * }
 * ```
 */
export function wrapAsDelegateHandler<T extends Function>(selector: string, fn: T): T;
export function wrapAsDelegateHandler(selector: string): Function;
export function wrapAsDelegateHandler(selector: string, fn?: Function): Function {
	function wrapper(this: unknown, e: Event): boolean {
		const
			t = <CanUndef<Element>>e.target;

		// eslint-disable-next-line @typescript-eslint/unbound-method
		if (t == null || !Object.isFunction(t.closest)) {
			return false;
		}

		const
			link = t.closest(selector);

		if (link) {
			e.delegateTarget = link;
			fn?.call(this, e);
			return true;
		}

		return false;
	}

	if (fn) {
		return wrapper;
	}

	return (target, key, descriptors) => {
		fn = descriptors.value;
		descriptors.value = wrapper;
	};
}

/**
 * @deprecated
 * @see [[wrapAsDelegateHandler]]
 */
export const delegate = deprecate({name: 'delegate', renamedTo: 'wrapAsDelegateHandler'}, wrapAsDelegateHandler);
