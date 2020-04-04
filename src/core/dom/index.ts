/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { deprecate } from 'core/functools';

/**
 * [[include:core/dom/README.md]]
 * @packageDocumentation
 */

/**
 * Wraps the specified function as an event handler with delegation.
 * This function can be used as a decorator or like a simple function.
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
export function wrapAsDelegateHandler(selector: string, fn?: Function): Function {
	function wrapper(e: Event): boolean {
		const
			t = <Element>e.target;

		if (!t || !Object.isFunction(t.closest)) {
			return false;
		}

		const
			link = t.closest(selector);

		if (link) {
			e.delegateTarget = link;
			fn && fn.call(this, e);
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
