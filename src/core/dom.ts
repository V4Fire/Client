/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Delegates the specified event
 *
 * @decorator
 * @param selector - selector for delegating the element
 * @param [handler]
 */
export function delegate(selector: string, handler?: Function): Function {
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
			handler && handler.call(this, e);
			return true;
		}

		return false;
	}

	if (handler) {
		return wrapper;
	}

	return (target, key, descriptors) => {
		handler = descriptors.value;
		descriptors.value = wrapper;
	};
}
