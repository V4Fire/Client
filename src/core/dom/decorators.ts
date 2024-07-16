/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Wraps the specified function as an event handler with delegation.
 * In simple terms, the wrapped function will be executed only if the event happened on the element by the given
 * selector or in its descendant node.
 * Also, the function adds to the event object a reference to the element to which the selector is specified.
 *
 * @param selector - a selector to the elements on which you want to catch the event
 * @param fn - the original function
 *
 * @example
 * ```js
 * // Attaches the event listener to the document,
 * // but the event will only be caught on `h1` tags
 * document.addEventListener('click', wrapAsDelegateHandler('h1', (e) => {
 *   console.log('Boom!');
 *   console.log(e.delegateTarget);
 * }));
 * ```
 */
export function wrapAsDelegateHandler<T extends Function>(
	selector: string,
	fn: T
): T;

/**
 * Wraps the specified function as an event handler with delegation.
 * In simple terms, the wrapped function will be executed only if the event happened on the element by the given
 * selector or in its descendant node.
 * Also, the function adds to the event object a reference to the element to which the selector is specified.
 * This overload should be used as a decorator.
 *
 * @param selector - a selector to the elements on which you want to catch the event
 *
 * @example
 * ```js
 * class Foo {
 *   // Using the function as a decorator
 *   @wrapAsDelegateHandler('h1')
 *   onH1Click(e) {
 *     console.log('Boom!');
 *     console.log(e.delegateTarget);
 *   }
 * }
 * ```
 */
export function wrapAsDelegateHandler(selector: string): Function;
export function wrapAsDelegateHandler(selector: string, fn?: Function): Function {
	function wrapper(this: unknown, e: Event): boolean {
		const
			t = <CanUndef<Element>>e.target;

		// eslint-disable-next-line @v4fire/unbound-method
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

	return (_target: object, _key: string, descriptors: PropertyDescriptor) => {
		fn = descriptors.value;
		descriptors.value = wrapper;
	};
}
