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

import Async, { AsyncOptions } from 'core/async';
import Friend from 'super/i-block/modules/friend';

import { statuses } from 'super/i-block/const';
import { Hook } from 'core/component';

import { Cb } from 'super/i-block/modules/lfc/interface';
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
	 * Executes the specified callback after a "beforeDataCreate" hook or a "beforeReady" event
	 * and returns a result of invocation
	 *
	 * @see [[Async.proxy]]
	 * @param cb
	 * @param [opts] - additional options
	 */
	execCbAtTheRightTime<R = unknown>(cb: Cb<this['C'], R>, opts?: AsyncOptions): CanPromise<CanVoid<R>> {
		if (this.isBeforeCreate('beforeDataCreate')) {
			return this.async.promise(new Promise<R>((r) => {
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
	 * Executes the specified callback after a block ready event and returns a result of invocation
	 *
	 * @param cb
	 * @param [opts] - additional options
	 */
	execCbAfterBlockReady<R = unknown>(cb: Cb<this['C'], R>, opts?: AsyncOptions): CanPromise<CanVoid<R>> {
		if (this.ctx.block) {
			if (statuses[this.componentStatus] >= 0) {
				return cb.call(this.component);
			}

			return;
		}

		return this.async.promise(new Promise<R>((r) => {
			this.ctx.blockReadyListeners.push(() => r(cb.call(this.component)));
		}), opts).catch(stderr);
	}

	/**
	 * Executes the specified callback after a "created" hook and returns a result of invocation
	 *
	 * @param cb
	 * @param [opts] - additional options
	 */
	execCbAfterComponentCreated<R = unknown>(cb: Cb<this['C'], R>, opts?: AsyncOptions): CanPromise<CanVoid<R>> {
		if (this.isBeforeCreate()) {
			return this.async.promise(new Promise<R>((r) => {
				this.meta.hooks.created.unshift({fn: () => r(cb.call(this.component))});
			}), opts).catch(stderr);
		}

		if (statuses[this.componentStatus] >= 0) {
			return cb.call(this.component);
		}
	}
}
