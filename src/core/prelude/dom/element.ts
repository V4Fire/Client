/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import extend from 'core/prelude/extend';

/**
 * Returns a position of the element relative to the document
 */
extend(Element.prototype, 'getPosition', function (this: Element): ElementPosition {
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
extend(Element.prototype, 'getIndex', function (): number | null {
	const
		els = this.parentElement && <HTMLCollection>this.parentElement.children;

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
extend(Node.prototype, 'getOffset', function (parent?: Element | string): ElementPosition {
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
});
