/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import extend from '/core/prelude/extend';

/**
 * Returns a position of the element relative to the document
 */
extend(Element.prototype, 'getPosition', function getPosition(this: Element): ElementPosition {
	const
		box = this.getBoundingClientRect();

	return {
		top: box.top + pageYOffset,
		left: box.left + pageXOffset
	};
});

/**
 * Returns an element index relative to the parent
 */
extend(Element.prototype, 'getIndex', function getIndex(this: Element): number | null {
	const
		els = this.parentElement?.children;

	if (!els) {
		return null;
	}

	for (let i = 0; i < els.length; i++) {
		if (els[i] === this) {
			return i;
		}
	}

	return null;
});

/**
 * Returns a position of the element relative to the parent
 * @param [parent]
 */
extend(HTMLElement.prototype, 'getOffset', function getOffset(
	this: HTMLElement,
	parent?: Element | string
): ElementPosition {
	const res = {
		top: this.offsetTop,
		left: this.offsetLeft
	};

	if (parent == null) {
		return res;
	}

	let
		{offsetParent} = this;

	while (matcher()) {
		if (offsetParent == null || !(offsetParent instanceof HTMLElement)) {
			break;
		}

		res.top += offsetParent.offsetTop;
		res.left += offsetParent.offsetLeft;

		({offsetParent} = offsetParent);
	}

	return res;

	function matcher(): boolean {
		if (offsetParent === document.documentElement) {
			return false;
		}

		return Object.isString(parent) ? !offsetParent?.matches(parent) : offsetParent !== parent;
	}
});
