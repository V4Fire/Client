/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { idsCache } from 'core/component/directives/bind-with/const';

import type { ComponentInterface } from 'core/component/interface';
import type { DirectiveValue, Binding } from 'core/component/directives/bind-with/interface';

/**
 * Returns the unique directive identifier for the passed element
 * @param el - the element to which the directive applies
 */
export function getElementId(el: Element): string {
	let
		id = idsCache.get(el);

	if (id == null) {
		id = Math.random().toString().slice(2);
		idsCache.set(el, id);
	}

	return id;
}

/**
 * Clears all declared bindings for the passed element
 *
 * @param el - the element to which the directive applies
 * @param ctx - the directive context
 */
export function clearElementBindings(el: Element, ctx: CanUndef<ComponentInterface>): void {
	if (ctx == null) {
		return;
	}

	ctx.unsafe.async.clearAll({group: new RegExp(`:${getElementId(el)}`)});
}

/**
 * Binds the specified listener(s) to the passed element
 *
 * @param listener - the listener descriptor or a list of descriptors
 * @param el - the element to which the directive applies
 * @param ctx - the directive context
 */
export function bindListenerToElement(
	listener: Nullable<DirectiveValue>,
	el: Element,
	ctx: CanUndef<ComponentInterface>
): void {
	if (ctx == null || listener == null) {
		return;
	}

	const
		id = getElementId(el);

	const {
		unsafe,
		unsafe: {async: $a}
	} = ctx;

	$a.clearAll({
		group: new RegExp(`:${id}`)
	});

	Array.concat([], listener).forEach((listener: Binding) => {
		const
			group = {group: `${listener.group ?? ''}:${id}`};

		if ('path' in listener) {
			const
				opts = listener.options ?? {},
				watcher = unsafe.$watch(listener.path, opts, handler);

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
			on: unsafe.$on.bind(ctx),
			once: unsafe.$once.bind(ctx),
			off: unsafe.$off.bind(ctx)
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
			// eslint-disable-next-line @typescript-eslint/unbound-method
			if ('catch' in listener && Object.isFunction(listener.catch)) {
				return listener.catch(el, err);
			}

			return stderr(err);
		}
	});
}
