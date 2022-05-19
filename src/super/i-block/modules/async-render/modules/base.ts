/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import SyncPromise from 'core/promise/sync';

//#if runtime has component/async-render
import { queue, restart, deferRestart } from 'core/component/render/daemon';
//#endif

import type iBlock from 'super/i-block/i-block';
import type { ComponentElement } from 'super/i-block/i-block';

import Friend from 'super/i-block/modules/friend';
import type { TaskParams } from 'super/i-block/modules/async-render/interface';

export default class AsyncRender extends Friend {
	//#if runtime has component/async-render

	constructor(component: iBlock) {
		super(component);

		this.meta.hooks.beforeUpdate.push({
			fn: () => this.async.clearAll({
				group: 'asyncComponents'
			})
		});
	}

	/**
	 * Restarts the `asyncRender` daemon to force rendering
	 */
	forceRender(): void {
		restart();
		this.localEmitter.emit('forceRender');
	}

	/**
	 * Restarts the `asyncRender` daemon to force rendering
	 * (runs on the next tick)
	 */
	deferForceRender(): void {
		deferRestart();
		this.localEmitter.emit('forceRender');
	}

	/**
	 * Returns a function that returns a promise that will be resolved after firing the `forceRender` event.
	 * The method can take an element name as the first parameter. This element will be dropped before resolving.
	 *
	 * Notice, the initial component rendering is mean the same as `forceRender`.
	 * The method is useful to re-render a function component without touching the parent state.
	 *
	 * @param elementToDrop - element to drop before resolving the promise
	 *   (if the element is passed as a function, it would be invoked)
	 *
	 * @example
	 * ```
	 * < button @click = asyncRender.forceRender()
	 *   Re-render the component
	 *
	 * < .&__wrapper
	 *   < template v-for = el in asyncRender.iterate(true, {filter: asyncRender.waitForceRender('content')})
	 *     < .&__content
	 *       {{ Math.random() }}
	 * ```
	 */
	waitForceRender(
		elementToDrop?: string | ((ctx: this['component']) => CanPromise<CanUndef<string | Element>>)
	): () => CanPromise<boolean> {
		return () => {
			const
				canImmediateRender = this.lfc.isBeforeCreate() || this.hook === 'beforeMount';

			if (canImmediateRender) {
				return true;
			}

			return this.localEmitter.promisifyOnce('forceRender').then(async () => {
				if (elementToDrop != null) {
					let
						el;

					if (Object.isFunction(elementToDrop)) {
						el = await elementToDrop(this.ctx);

					} else {
						el = elementToDrop;
					}

					if (Object.isString(el)) {
						this.block?.element(el)?.remove();

					} else {
						el?.remove();
					}
				}

				return true;
			});
		};
	}

	/**
	 * Removes the given element from the DOM tree and destroys all tied components
	 *
	 * @param el
	 * @param [childComponentEls] - list of child component nodes
	 */
	protected destroy(el: Node, childComponentEls: Element[] = []): void {
		el.parentNode?.removeChild(el);

		for (let i = 0; i < childComponentEls.length; i++) {
			const
				el = childComponentEls[i];

			try {
				(<ComponentElement<iBlock>>el).component?.unsafe.$destroy();

			} catch (err) {
				stderr(err);
			}
		}

		try {
			(<ComponentElement<iBlock>>el).component?.unsafe.$destroy();

		} catch (err) {
			stderr(err);
		}
	}

	/**
	 * Creates a render task by the specified parameters
	 *
	 * @param taskFn
	 * @param [params]
	 */
	protected createTask(taskFn: AnyFunction, params: TaskParams = {}): Promise<void> {
		const
			{async: $a} = this;

		const
			group = params.group ?? 'asyncComponents';

		return new SyncPromise<void>((resolve, reject) => {
			const task = {
				weight: params.weight,

				fn: $a.proxy(() => {
					const cb = () => {
						taskFn();
						resolve();
						return true;
					};

					if (params.useRAF) {
						return $a.animationFrame({group}).then(cb);
					}

					return cb();

				}, {
					group,
					single: false,
					onClear: (err) => {
						queue.delete(task);
						reject(err);
					}
				})
			};

			queue.add(task);
		});
	}

	//#endif
}
