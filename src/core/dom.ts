/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import $C = require('collection.js');

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

/**
 * Returns a position of the element relative to the document
 */
Element.prototype.getPosition = function (): {top: number; left: number} {
	const box = this.getBoundingClientRect();
	return {
		top: box.top + pageYOffset,
		left: box.left + pageXOffset
	};
};

/**
 * Returns an element index relative to the parent
 */
Element.prototype.getIndex = function (): number | null {
	return $C(this.parentElement && <HTMLCollection>this.parentElement.children)
		.one.search((el) => el === this);
};

/**
 * Returns a position of the element relative to the parent
 * @param [parent]
 */
Node.prototype.getOffset = function (parent?: Element | string): {top: number; left: number} {
	const res = {
		top: this.offsetTop,
		left: this.offsetLeft
	};

	if (!parent) {
		return res;
	}

	let
		{offsetParent} = this;

	const matcher = () =>
		offsetParent && offsetParent !== document.documentElement &&
		(Object.isString(parent) ? !offsetParent.matches(parent) : offsetParent !== parent);

	while (matcher()) {
		res.top += offsetParent.offsetTop;
		res.left += offsetParent.offsetLeft;
		({offsetParent} = offsetParent);
	}

	return res;
};

if (!Element.prototype.matches) {
	// tslint:disable:no-string-literal

	Element.prototype.matches =
		Element.prototype['matchesSelector'] ||
		Element.prototype['mozMatchesSelector'] ||
		Element.prototype['msMatchesSelector'] ||
		Element.prototype['oMatchesSelector'] ||
		Element.prototype['webkitMatchesSelector'] ||
		function (selector: string): boolean {
			const
				matches = (this.document || this.ownerDocument).querySelectorAll(selector);

			let
				i = matches.length;

			while (--i >= 0 && matches.item(i) !== this) {
				// Do nothing
			}

			return i > -1;
		};

	// tslint:enable:no-string-literal
}

if (!Element.prototype.closest) {
	// @ts-ignore
	Element.prototype.closest = function (selector: string): Element | null {
		if (!this) {
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
