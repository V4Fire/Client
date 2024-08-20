/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { idsCache } from 'components/directives/bind-with/const';
import { getElementId as getElementIdFromStore } from 'core/component/directives';

import type { ComponentInterface } from 'core/component/interface';
import type { DirectiveValue, Listener } from 'components/directives/bind-with/interface';

/**
 * Returns a unique identifier for the directive associated with the given element
 * @param el - the element to which the directive is applied
 */
export function getElementId(el: Element): string {
	return getElementIdFromStore(el, idsCache);
}

/**
 * Clears all declared bindings for the passed element
 *
 * @param el - the element to which the directive is applied
 * @param ctx - the directive context
 */
export function clearElementBindings(el: Element, ctx: Nullable<ComponentInterface['unsafe']>): void {
	if (ctx == null) {
		return;
	}

	ctx.async.clearAll({group: new RegExp(`:${getElementId(el)}`)});
}

/**
 * Binds the specified listener(s) to the passed element
 *
 * @param listener - the listener descriptor or a list of descriptors
 * @param el - the element to which the directive is applied
 * @param ctx - the directive context
 */
export function bindListenerToElement(
	listener: Nullable<DirectiveValue>,
	el: Element,
	ctx: Nullable<ComponentInterface['unsafe']>
): void {
	if (ctx == null || listener == null) {
		return;
	}

	const
		id = getElementId(el);

	const {async: $a} = ctx;

	$a.clearAll({
		group: new RegExp(`:${id}`)
	});

	Array.concat([], listener).forEach((listener: Listener) => {
		const group = {
			group: `${listener.group ?? ''}:${id}`
		};

		if ('path' in listener) {
			const
				opts = listener.options ?? {},
				watcher = ctx.$watch(listener.path, opts, handler);

			if (watcher != null) {
				$a.worker(watcher, group);
			}

			return;
		}

		if ('promise' in listener) {
			$a.promise(listener.promise, group).then(handler, errorHandler);
			return;
		}

		if ('callback' in listener) {
			listener.callback($a.proxy(handler, group), $a.proxy(errorHandler, group));
			return;
		}

		const emitter = listener.emitter ?? {
			on: ctx.$on.bind(ctx),
			once: ctx.$once.bind(ctx),
			off: ctx.$off.bind(ctx)
		};

		if (listener.on != null) {
			$a.on(emitter, listener.on, handler, {
				options: listener.options,
				...group
			});
		}

		if (listener.once != null) {
			$a.once(emitter, listener.once, handler, {
				options: listener.options,
				...group
			});
		}

		function handler(...args: unknown[]): unknown {
			return listener.then(el, ...args);
		}

		function errorHandler(err: unknown): unknown {
			// eslint-disable-next-line @v4fire/unbound-method
			if ('catch' in listener && Object.isFunction(listener.catch)) {
				return listener.catch(el, err);
			}

			return stderr(err);
		}
	});
}
