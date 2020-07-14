/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// eslint-disable-next-line @typescript-eslint/unbound-method
if (!Object.isFunction(Element.prototype.closest)) {
	Element.prototype.closest = function closest(this: Nullable<Element>, selector: string): Element | null {
		if (this == null) {
			return null;
		}

		if (this.matches(selector)) {
			return this;
		}

		if (!this.parentElement) {
			return null;
		}

		return this.parentElement.closest(selector);
	};
}
