/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-block/modules/lfc/README.md]]
 * @packageDocumentation
 */

import SyncPromise from 'core/promise/sync';

import type { AsyncOptions } from 'core/async';
import Friend from 'super/i-block/modules/friend';

import { statuses } from 'super/i-block/const';

import type { Hook } from 'core/component';
import type { Cb } from 'super/i-block/modules/lfc/interface';

export * from 'super/i-block/modules/lfc/interface';

/**
 * Class to work with a component life cycle
 */
export default class Lfc extends Friend {
	/**
	 * Returns true if the component hook is equal to one of "before create" hooks
	 * @param [skip] - name of a skipped hook
	 */
	isBeforeCreate(...skip: Hook[]): boolean {
		const beforeHooks = {
			beforeRuntime: true,
			beforeCreate: true,
			beforeDataCreate: true
		};

		for (let i = 0; i < skip.length; i++) {
			beforeHooks[skip[i]] = false;
		}

		return Boolean(beforeHooks[<string>this.hook]);
	}

	/**
	 * Executes the specified callback after the `beforeDataCreate` hook or `beforeReady` event
	 * and returns a result of the invocation. If the callback can be invoked immediately, it will be invoked,
	 * and the method returns the invocation' result. Otherwise, the method returns a promise.
	 *
	 * This method is helpful to execute a function after the component is initialized and doesn't wait for its providers.
	 *
	 * @see [[Async.proxy]]
	 * @param cb
	 * @param [opts] - additional options
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

		const
			res = this.ctx.waitStatus('beforeReady', cb, opts);

		if (Object.isPromise(res)) {
			return res.catch(stderr);
		}

		return res;
	}

	/**
	 * Executes the specified callback after the Block' instance is ready and returns a result of the invocation.
	 * If the callback can be invoked immediately, it will be invoked, and the method returns the invocation' result.
	 * Otherwise, the method returns a promise.
	 *
	 * @param cb
	 * @param [opts] - additional options
	 */
	execCbAfterBlockReady<R = unknown>(cb: Cb<this['C'], R>, opts?: AsyncOptions): CanUndef<CanPromise<R>> {
		if (this.ctx.block) {
			if (statuses[this.componentStatus] >= 0) {
				return cb.call(this.component);
			}

			return;
		}

		return this.async.promise(new SyncPromise<any>((r) => {
			this.ctx.blockReadyListeners.push(() => r(cb.call(this.component)));
		}), opts).catch(stderr);
	}

	/**
	 * Executes the specified callback after the component switched to `created` and returns a result of the invocation.
	 * If the callback can be invoked immediately, it will be invoked, and the method returns the invocation' result.
	 * Otherwise, the method returns a promise.
	 *
	 * @param cb
	 * @param [opts] - additional options
	 */
	execCbAfterComponentCreated<R = unknown>(cb: Cb<this['C'], R>, opts?: AsyncOptions): CanPromise<CanVoid<R>> {
		if (this.isBeforeCreate()) {
			return this.async.promise(new SyncPromise<R>((r) => {
				this.meta.hooks.created.unshift({fn: () => r(cb.call(this.component))});
			}), opts).catch(stderr);
		}

		if (statuses[this.componentStatus] >= 0) {
			return cb.call(this.component);
		}
	}
}
