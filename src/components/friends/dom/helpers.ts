/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Friend from 'components/friends/friend';
import type { ElCb } from 'components/friends/dom/interface';

/**
 * Forces the given element to be rendered into the DOM so that its geometry and other properties can be retrieved.
 * After rendering, the specified callback function will be called, and then the element will return to its original
 * state.
 *
 * @param el - the DOM node to render (or the component element name)
 * @param cb - the callback function
 *
 * * @example
 * ```js
 * this.dom.renderTemporarily(this.$el.querySelector('.foo'), () => {
 *   console.log(this.$el.clientHeight);
 * })
 * ```
 */
export function renderTemporarily<T extends Friend['C']>(
	this: Friend,
	el: Element | string,
	cb: ElCb<T>
): Promise<void>;

/**
 * Forces the given element to be rendered into the DOM so that its geometry and other properties can be retrieved.
 * After rendering, the specified callback function will be called, and then the element will return to its original
 * state.
 *
 * @param cb - the callback function
 *
 * @example
 * ```js
 * this.dom.renderTemporarily(() => {
 *   console.log(this.$el.clientHeight);
 * });
 * ```
 */
export function renderTemporarily<T extends Friend['C']>(this: Friend, cb: ElCb<T>): Promise<void>;

export function renderTemporarily<T extends Friend['C']>(
	this: Friend,
	cbOrEl: CanUndef<Element | string> | ElCb<T>,
	elOrCb: CanUndef<Element | string> | ElCb<T> = this.node
): Promise<void> {
	let
		cb,
		el;

	if (Object.isFunction(cbOrEl)) {
		cb = cbOrEl;
		el = elOrCb;

	} else if (Object.isFunction(elOrCb)) {
		cb = elOrCb;
		el = cbOrEl;
	}

	if (!(el instanceof Node)) {
		throw new ReferenceError('The element to render is not specified');
	}

	if (!Object.isFunction(cb)) {
		throw new ReferenceError('The callback to invoke after rendering is not specified');
	}

	return this.ctx.waitComponentStatus('ready').then(async () => {
		const
			resolvedEl = Object.isString(el) ? this.block?.element(el) : el;

		if (resolvedEl == null) {
			return;
		}

		if (resolvedEl.clientHeight > 0) {
			await cb.call(this.component, resolvedEl);
			return;
		}

		const wrapper = document.createElement('div');
		Object.assign(wrapper.style, {
			opacity: 0,

			display: 'block',
			position: 'absolute',

			top: 0,
			left: 0,

			'z-index': -1
		});

		const
			parent = resolvedEl.parentNode,
			before = resolvedEl.nextSibling;

		wrapper.appendChild(resolvedEl);
		document.body.appendChild(wrapper);

		await cb.call(this.component, resolvedEl);

		if (parent != null) {
			if (before != null) {
				parent.insertBefore(resolvedEl, before);

			} else {
				parent.appendChild(resolvedEl);
			}
		}

		wrapper.parentNode?.removeChild(wrapper);
	});
}
