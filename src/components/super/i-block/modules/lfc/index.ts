/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/super/i-block/modules/lfc/README.md]]
 * @packageDocumentation
 */

import SyncPromise from 'core/promise/sync';

import type Async from 'core/async';
import type { AsyncOptions } from 'core/async';

import Friend from 'components/friends/friend';

import { statuses } from 'components/super/i-block/const';

import type { Hook } from 'core/component';
import type { Cb } from 'components/super/i-block/modules/lfc/interface';

export * from 'components/super/i-block/modules/lfc/interface';

export default class Lfc extends Friend {
	/**
	 * Returns true if the active component hook is equal to one of "before-create" hooks:
	 *
	 * 1. `beforeRuntime`
	 * 2. `beforeCreate`
	 * 3. `beforeDataCreate`
	 *
	 * @param [skip] - a hook name to be ignored, i.e., method with this hook value will return false
	 *
	 * @example
	 * ```js
	 * console.log(this.lfc.isBeforeCreate());
	 *
	 * // Returns `false` for `beforeCreate` or `beforeDataCreate`
	 * console.log(this.lfc.isBeforeCreate('beforeCreate', 'beforeDataCreate'));
	 * ```
	 */
	isBeforeCreate(...skip: Hook[]): boolean {
		const beforeHooks = {
			beforeRuntime: true,
			beforeCreate: true,
			beforeDataCreate: true
		};

		skip.forEach((hook) => beforeHooks[hook] = false);
		return Boolean(beforeHooks[<string>this.hook]);
	}

	/**
	 * Executes the specified callback after the `beforeDataCreate` hook or `beforeReady` event.
	 * If the callback can be called immediately, it will be called and the method will return the call result.
	 * Otherwise, the method returns a promise.
	 *
	 * This method is helpful to execute a function after a component is initialized and does not wait for its providers.
	 *
	 * {@link Async.proxy}
	 *
	 * @param cb
	 * @param [opts] - additional options
	 *
	 * @example
	 * ```js
	 * this.lfc.execCbAtTheRightTime(() => {
	 *   this.db.total = this.db.length;
	 * });
	 * ```
	 */
	execCbAtTheRightTime<R = unknown>(cb: Cb<this['C'], R>, opts?: AsyncOptions): CanPromise<CanVoid<R>> {
		if (this.isBeforeCreate('beforeDataCreate')) {
			return this.async.promise(new SyncPromise<R>((r) => {
				this.meta.hooks.beforeDataCreate.push({fn: () => r(cb.call(this.component))});
			}), opts).catch(stderr);
		}

		if (this.hook === 'beforeDataCreate') {
			return cb.call(this.component);
		}

		this.ctx.beforeReadyListeners++;

		const res = this.ctx.waitComponentStatus('beforeReady', cb, opts);

		if (Object.isPromise(res)) {
			return res.catch(stderr);
		}

		return res;
	}

	/**
	 * Executes the specified callback after the Block instance is ready.
	 * If the callback can be called immediately, it will be called and the method will return the call result.
	 * Otherwise, the method returns a promise.
	 *
	 * @param cb
	 * @param [opts] - additional options
	 *
	 * @example
	 * ```js
	 * this.lfc.execCbAfterBlockReady(() => {
	 *   console.log(this.block.element('foo'));
	 * });
	 * ```
	 */
	execCbAfterBlockReady<R = unknown>(cb: Cb<this['C'], R>, opts?: AsyncOptions): CanUndef<CanPromise<R>> {
		if (this.ctx.block) {
			if (statuses[this.componentStatus] >= 0) {
				return cb.call(this.component);
			}

			return;
		}

		const p = new SyncPromise((r) => {
			this.ctx.blockReadyListeners.push(() => r(cb.call(this.component)));
		});

		return Object.cast(this.async.promise(p, opts).catch(stderr));
	}

	/**
	 * Executes the specified callback after the component switched to `created`.
	 * If the callback can be called immediately, it will be called and the method will return the call result.
	 * Otherwise, the method returns a promise.
	 *
	 * @param cb
	 * @param [opts] - additional options
	 *
	 * @example
	 * ```js
	 * this.lfc.execCbAfterComponentCreated(() => {
	 *   console.log(this.componentName);
	 * });
	 * ```
	 */
	execCbAfterComponentCreated<R = unknown>(cb: Cb<this['C'], R>, opts?: AsyncOptions): CanPromise<CanVoid<R>> {
		if (this.isBeforeCreate()) {
			return this.async.promise(new SyncPromise<R>((r) => {
				this.meta.hooks['before:created'].push({fn: () => r(cb.call(this.component))});
			}), opts).catch(stderr);
		}

		if (statuses[this.componentStatus] >= 0) {
			return cb.call(this.component);
		}
	}
}
